"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Loader2,
  Maximize2,
  Minimize2,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Toolbar } from "./Toolbar";
import { AiPanel } from "./AiPanel";
import { FileMenu, type ExportFormat } from "./FileMenu";
import { buildExtensions } from "@/lib/editorExtensions";
import { localDocumentStore } from "@/lib/store";
import { ACCEPTED_IMPORT_TYPES, importFile } from "@/lib/import";
import {
  exportDocx,
  exportHtml,
  exportMarkdown,
  exportPdf,
  exportText,
} from "@/lib/export";
import { AUTOSAVE_DELAY_MS } from "@/lib/constants";
import type { DocumentRecord, SaveState } from "@/lib/types";
import { cn } from "@/lib/cn";

export function DocumentEditor({ initialDoc }: { initialDoc: DocumentRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialDoc.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [aiOpen, setAiOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: initialDoc.content,
    editorProps: {
      attributes: {
        class: "ProseMirror focus:outline-none",
        spellcheck: "true",
      },
    },
    immediatelyRender: false,
    onUpdate: () => scheduleSave(),
  });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }, []);

  /** Persist the current title + content to the store. */
  const save = useCallback(async () => {
    if (!editor) return;
    setSaveState("saving");
    try {
      await localDocumentStore.update(initialDoc.id, {
        title: title.trim() || "Untitled document",
        content: editor.getHTML(),
      });
      setSaveState("saved");
    } catch (err) {
      console.error(err);
      setSaveState("error");
      showToast(
        err instanceof Error ? err.message : "Couldn't save your document.",
      );
    }
  }, [editor, initialDoc.id, title, showToast]);

  /** Debounced autosave triggered on edits. */
  const scheduleSave = useCallback(() => {
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
  }, [save]);

  // Re-run autosave scheduling when the title changes.
  useEffect(() => {
    if (title !== initialDoc.title) scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Save once on unmount to capture any pending changes.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Keyboard shortcut: ⌘/Ctrl + S to save manually.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
        showToast("Document saved");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, showToast]);

  // Keep React fullscreen state in sync with the browser fullscreen API.
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen API can be blocked; fall back to a CSS-only focus mode.
      setFullscreen((v) => !v);
    }
  };

  // ---- File actions -------------------------------------------------------

  const handleNew = async () => {
    await save();
    const doc = await localDocumentStore.create();
    router.push(`/editor/${doc.id}`);
  };

  const handleOpen = () => fileInputRef.current?.click();

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      showToast("Importing…");
      const { title: importedTitle, html } = await importFile(file);
      const doc = await localDocumentStore.create({
        title: importedTitle,
        content: html,
      });
      router.push(`/editor/${doc.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Import failed.");
    }
  };

  const handleExport = async (format: ExportFormat) => {
    if (!editor) return;
    const html = editor.getHTML();
    const name = title.trim() || "Untitled document";
    try {
      showToast(`Exporting ${format.toUpperCase()}…`);
      switch (format) {
        case "pdf":
          await exportPdf(name, html);
          break;
        case "docx":
          await exportDocx(name, html);
          break;
        case "md":
          await exportMarkdown(name, html);
          break;
        case "txt":
          await exportText(name, html);
          break;
        case "html":
          await exportHtml(name, html);
          break;
      }
    } catch (err) {
      console.error(err);
      showToast(
        err instanceof Error ? err.message : `Could not export ${format}.`,
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-screen flex-col bg-ink-50",
        fullscreen && "bg-white",
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur transition-all",
          // Reserve room for the AI panel on large screens so header controls
          // and the toolbar are never hidden behind it.
          aiOpen && "lg:pr-80",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <Link
            href="/"
            onClick={() => void save()}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900"
            aria-label="Back to documents"
            title="Back to documents"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="hidden sm:block">
            <Logo showWordmark={false} />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void save()}
              placeholder="Untitled document"
              aria-label="Document title"
              className="min-w-0 max-w-xs flex-1 truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink-950 outline-none transition hover:border-ink-200 focus:border-nopal-400 focus:bg-white sm:text-base"
            />
            <SaveIndicator state={saveState} />
          </div>

          <div className="flex items-center gap-1">
            <FileMenu
              onNew={handleNew}
              onOpen={handleOpen}
              onSave={() => {
                void save();
                showToast("Document saved");
              }}
              onExport={handleExport}
              saving={saveState === "saving"}
            />
            <button
              onClick={toggleFullscreen}
              className="hidden h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 sm:grid"
              title={fullscreen ? "Exit full screen" : "Full screen"}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => setAiOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
                aiOpen
                  ? "bg-nopal-600 text-white hover:bg-nopal-700"
                  : "bg-nopal-50 text-nopal-700 hover:bg-nopal-100",
              )}
              title="Toggle AI assistant"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-t border-ink-100 bg-white">
          {editor ? (
            <Toolbar editor={editor} />
          ) : (
            <div className="h-11" />
          )}
        </div>
      </header>

      {/* Page area */}
      <main
        className={cn(
          "flex-1 overflow-y-auto px-3 py-6 transition-all sm:px-6 sm:py-10",
          aiOpen && "lg:pr-80",
        )}
      >
        <div className="mx-auto w-full" style={{ maxWidth: "var(--page-max)" }}>
          <div className="print-page min-h-[60vh] rounded-xl bg-white px-6 py-10 shadow-page sm:px-16 sm:py-16">
            <EditorContent editor={editor} />
          </div>
          <p className="no-print mt-3 text-center text-xs text-ink-300">
            Changes are saved automatically to this device.
          </p>
        </div>
      </main>

      {/* AI panel */}
      <AiPanel editor={editor} open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Backdrop for AI panel on small screens */}
      {aiOpen && (
        <button
          className="fixed inset-0 z-30 bg-ink-950/20 lg:hidden"
          onClick={() => setAiOpen(false)}
          aria-label="Close AI panel"
        />
      )}

      {/* Hidden import input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMPORT_TYPES}
        className="hidden"
        onChange={handleImport}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 animate-fade-in rounded-full bg-ink-950 px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const map = {
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: "Saved",
      className: "text-nopal-600",
    },
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Saving…",
      className: "text-ink-400",
    },
    unsaved: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Saving…",
      className: "text-ink-400",
    },
    error: {
      icon: <CloudOff className="h-3.5 w-3.5" />,
      label: "Not saved",
      className: "text-rose-500",
    },
  }[state];

  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 text-xs font-medium sm:inline-flex",
        map.className,
      )}
    >
      {map.icon}
      {map.label}
    </span>
  );
}
