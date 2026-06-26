"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlertCircle,
  ArrowDownToLine,
  Check,
  Copy,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  AI_ACTIONS,
  AI_MAX_INPUT,
  TRANSLATE_LANGUAGES,
  runAi,
  type AiAction,
  type AiActionId,
} from "@/lib/ai";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

type Status = "idle" | "loading" | "result" | "error";

/** Convert AI plain-text output into editor-ready HTML (lists + paragraphs). */
function aiTextToHtml(text: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    if (bullet) {
      if (listType !== "ul") {
        closeList();
        out.push("<ul>");
        listType = "ul";
      }
      out.push(`<li>${escape(bullet[1])}</li>`);
    } else if (numbered) {
      if (listType !== "ol") {
        closeList();
        out.push("<ol>");
        listType = "ol";
      }
      out.push(`<li>${escape(numbered[1])}</li>`);
    } else {
      closeList();
      out.push(`<p>${escape(line)}</p>`);
    }
  }
  closeList();
  return out.join("");
}

/**
 * The AI Assistant panel. The browser only ever calls our own `/api/ai`
 * endpoint (the OpenRouter key stays server-side). Requests are abortable so
 * the editor never freezes, and every result offers copy / replace / insert /
 * retry actions.
 */
export function AiPanel({
  editor,
  open,
  onClose,
  pendingAction,
  onPendingHandled,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
  /** An action requested from the menu bar; auto-runs when the panel opens. */
  pendingAction?: AiActionId | null;
  onPendingHandled?: () => void;
}) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [instruction, setInstruction] = useState("");
  const [language, setLanguage] = useState(TRANSLATE_LANGUAGES[0]);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [awaitingLanguage, setAwaitingLanguage] = useState(false);
  const [copied, setCopied] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  // The selection range captured when a request starts, so Replace targets it.
  const targetRef = useRef<{ from: number; to: number } | null>(null);

  const characters = editor?.storage.characterCount.characters() ?? 0;
  const words = editor?.storage.characterCount.words() ?? 0;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const execute = useCallback(
    async (action: AiAction, lang?: string) => {
      if (!editor) return;
      const { from, to, empty } = editor.state.selection;
      const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, "\n");
      const docText = editor.getText();

      // Validate we have something to work with.
      const isCustom = action.id === "custom";
      if (isCustom && !instruction.trim() && !selectedText) {
        setActiveAction(action);
        setStatus("error");
        setError(t("ai.needInstruction"));
        return;
      }
      if (!isCustom && !selectedText && !action.worksWithoutSelection) {
        setActiveAction(action);
        setStatus("error");
        setError(t("ai.needSelection"));
        return;
      }

      targetRef.current = empty ? null : { from, to };
      setActiveAction(action);
      setAwaitingLanguage(false);
      setStatus("loading");
      setError("");
      setResult("");

      cancel();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const { text } = await runAi(
          {
            action: action.id,
            text: selectedText.slice(0, AI_MAX_INPUT),
            instruction: instruction.trim() || undefined,
            language: lang || language,
            documentContext: action.worksWithoutSelection
              ? docText.slice(0, AI_MAX_INPUT)
              : undefined,
          },
          controller.signal,
        );
        setResult(text);
        setStatus("result");
      } catch (err) {
        if (controller.signal.aborted) return; // user closed/cancelled
        setStatus("error");
        setError(err instanceof Error ? err.message : t("ai.somethingWrong"));
      } finally {
        abortRef.current = null;
      }
    },
    [editor, instruction, language, cancel, t],
  );

  const handleActionClick = useCallback(
    (action: AiAction) => {
      if (action.needsLanguage) {
        setActiveAction(action);
        setAwaitingLanguage(true);
        setStatus("idle");
        return;
      }
      void execute(action);
    },
    [execute],
  );

  // Auto-run an action requested from the menu bar.
  useEffect(() => {
    if (!open || !pendingAction || !editor) return;
    const action = AI_ACTIONS.find((a) => a.id === pendingAction);
    onPendingHandled?.();
    if (action) handleActionClick(action);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingAction, editor]);

  // Abort any in-flight request when the panel closes.
  useEffect(() => {
    if (!open) cancel();
  }, [open, cancel]);

  // ---- Result actions -------------------------------------------------------

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked */
    }
  };

  const replaceSelection = () => {
    if (!editor) return;
    const html = aiTextToHtml(result);
    const target = targetRef.current;
    if (target) {
      editor.chain().focus().insertContentAt(target, html).run();
    } else {
      editor.chain().focus().insertContent(html).run();
    }
  };

  const insertBelow = () => {
    if (!editor) return;
    const html = aiTextToHtml(result);
    const target = targetRef.current;
    const pos = target ? target.to : editor.state.selection.to;
    editor.chain().focus().setTextSelection(pos).insertContent(html).run();
  };

  if (!editor) return null;

  return (
    <aside
      className={cn(
        "fixed inset-y-0 right-0 z-50 flex w-80 max-w-[90vw] flex-col border-l border-ink-200 bg-white shadow-xl transition-transform duration-300 dark:border-night-border dark:bg-night-surface lg:shadow-none",
        open ? "translate-x-0" : "translate-x-full",
      )}
      aria-hidden={!open}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-night-border">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-nopal-500 to-nopal-700 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">
              {t("ai.assistant")}
            </h2>
            <p className="text-[11px] text-ink-400 dark:text-ink-500">{t("ai.poweredBy")}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-night-hover dark:hover:text-ink-200"
          aria-label={t("ai.closePanel")}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Insights */}
        <section className="mb-4">
          <div className="grid grid-cols-3 gap-2">
            <Stat label={t("ai.words")} value={words.toLocaleString()} />
            <Stat label={t("ai.characters")} value={characters.toLocaleString()} />
            <Stat label={t("ai.readTime")} value={t("ai.minShort", { n: readingMinutes })} />
          </div>
        </section>

        {/* Custom instruction */}
        <section className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
            {t("ai.ask")}
          </label>
          <div className="relative">
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void execute({
                    id: "custom",
                    label: "Custom",
                    description: "",
                  });
                }
              }}
              rows={2}
              placeholder={t("ai.placeholder")}
              className="w-full resize-none rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
            />
            <button
              onClick={() =>
                void execute({ id: "custom", label: "Custom", description: "" })
              }
              disabled={status === "loading"}
              className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-lg bg-nopal-600 text-white transition hover:bg-nopal-700 disabled:opacity-50"
              aria-label={t("ai.runInstruction")}
              title={t("ai.run")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
            {t("ai.quickActions")}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {AI_ACTIONS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleActionClick(tool)}
                disabled={status === "loading"}
                title={t(`aiact.${tool.id}.desc`)}
                className={cn(
                  "rounded-lg border border-ink-200 bg-white px-2.5 py-2 text-left text-xs font-medium text-ink-700 transition hover:border-nopal-300 hover:bg-nopal-50 disabled:opacity-50 dark:border-night-border dark:bg-night-raised dark:text-ink-200 dark:hover:border-nopal-500/50 dark:hover:bg-nopal-500/10",
                  activeAction?.id === tool.id &&
                    "border-nopal-300 bg-nopal-50 dark:border-nopal-500/50 dark:bg-nopal-500/10",
                )}
              >
                {t(`aiact.${tool.id}.label`)}
              </button>
            ))}
          </div>
        </section>

        {/* Language picker (translate) */}
        {awaitingLanguage && activeAction?.needsLanguage && (
          <section className="mt-4 animate-fade-in rounded-xl border border-nopal-200 bg-nopal-50/60 p-3 dark:border-nopal-500/30 dark:bg-nopal-500/10">
            <label className="mb-1.5 block text-xs font-medium text-nopal-800 dark:text-nopal-300">
              {t("ai.translateTo")}
            </label>
            <div className="flex gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
              >
                {TRANSLATE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {t(`tlang.${l}`)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => activeAction && void execute(activeAction, language)}
                className="rounded-lg bg-nopal-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-nopal-700"
              >
                {t("ai.translate")}
              </button>
            </div>
          </section>
        )}

        {/* Loading */}
        {status === "loading" && (
          <section className="mt-4 animate-fade-in rounded-xl border border-ink-200 bg-ink-50/60 p-4 dark:border-night-border dark:bg-night-raised">
            <div className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
              <Loader2 className="h-4 w-4 animate-spin text-nopal-600" />
              {t("ai.working")}
            </div>
          </section>
        )}

        {/* Error */}
        {status === "error" && (
          <section className="mt-4 animate-fade-in rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div className="flex items-start gap-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
            {activeAction && (
              <button
                onClick={() => void execute(activeAction)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-50 dark:bg-night-raised dark:text-rose-300 dark:ring-rose-500/30"
              >
                <RotateCcw className="h-3 w-3" /> {t("ai.tryAgain")}
              </button>
            )}
          </section>
        )}

        {/* Result */}
        {status === "result" && (
          <section className="mt-4 animate-fade-in rounded-xl border border-nopal-200 bg-white p-3 dark:border-nopal-500/30 dark:bg-night-raised">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-nopal-800 dark:text-nopal-300">
              <Sparkles className="h-3.5 w-3.5" />
              {activeAction ? t(`aiact.${activeAction.id}.label`) : t("ai.result")}
            </div>
            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink-50/60 p-2.5 text-sm leading-relaxed text-ink-800 dark:bg-night-base/60 dark:text-ink-200">
              {result}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <ResultButton onClick={copyResult} icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} label={copied ? t("ai.copied") : t("ai.copy")} />
              <ResultButton onClick={replaceSelection} icon={<RotateCcw className="h-3.5 w-3.5" />} label={t("ai.replace")} />
              <ResultButton onClick={insertBelow} icon={<ArrowDownToLine className="h-3.5 w-3.5" />} label={t("ai.insertBelow")} />
              <ResultButton onClick={() => activeAction && void execute(activeAction)} icon={<RotateCcw className="h-3.5 w-3.5" />} label={t("ai.tryAgain")} />
            </div>
            <button
              onClick={() => {
                setStatus("idle");
                setResult("");
              }}
              className="mt-2 w-full rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 transition hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-night-hover"
            >
              {t("ai.closeResult")}
            </button>
          </section>
        )}
      </div>

      <div className="border-t border-ink-100 p-3 dark:border-night-border">
        <p className="text-[11px] leading-relaxed text-ink-400 dark:text-ink-500">
          {t("ai.disclaimer")}
        </p>
      </div>
    </aside>
  );
}

function ResultButton({
  onClick,
  icon,
  label,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:border-nopal-300 hover:bg-nopal-50 dark:border-night-border dark:bg-night-surface dark:text-ink-200 dark:hover:border-nopal-500/50 dark:hover:bg-nopal-500/10"
    >
      {icon}
      {label}
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/60 px-2 py-2 text-center dark:border-night-border dark:bg-night-raised">
      <div className="text-sm font-semibold text-ink-900 dark:text-ink-100">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-ink-400 dark:text-ink-500">
        {label}
      </div>
    </div>
  );
}
