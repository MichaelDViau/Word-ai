"use client";

import type { Editor } from "@tiptap/react";
import { Modal } from "@/components/ui/Modal";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/i18n";

/** Live word / character / reading-time stats for the document. */
export function WordCountDialog({
  editor,
  open,
  onClose,
}: {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const words = editor?.storage.characterCount.words() ?? 0;
  const characters = editor?.storage.characterCount.characters() ?? 0;
  const charactersNoSpaces = (editor?.getText() ?? "").replace(/\s/g, "").length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  const rows = [
    { label: t("wc.words"), value: words.toLocaleString() },
    { label: t("wc.characters"), value: characters.toLocaleString() },
    { label: t("wc.charactersNoSpaces"), value: charactersNoSpaces.toLocaleString() },
    { label: t("wc.readingTime"), value: t("wc.min", { n: readingMinutes }) },
  ];

  return (
    <Modal open={open} onClose={onClose} title={t("wc.title")}>
      <div className="divide-y divide-ink-100 dark:divide-night-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-2.5">
            <span className="text-sm text-ink-600 dark:text-ink-300">{r.label}</span>
            <span className="text-sm font-semibold text-ink-950 dark:text-ink-100">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

const SHORTCUTS: { keys: string; labelKey: string }[] = [
  { keys: "⌘ / Ctrl + S", labelKey: "sc.save" },
  { keys: "⌘ / Ctrl + Z", labelKey: "sc.undo" },
  { keys: "⌘ / Ctrl + ⇧ + Z", labelKey: "sc.redo" },
  { keys: "⌘ / Ctrl + B", labelKey: "sc.bold" },
  { keys: "⌘ / Ctrl + I", labelKey: "sc.italic" },
  { keys: "⌘ / Ctrl + U", labelKey: "sc.underline" },
  { keys: "⌘ / Ctrl + K", labelKey: "sc.insertLink" },
  { keys: "⌘ / Ctrl + F", labelKey: "sc.findReplace" },
  { keys: "⌘ / Ctrl + A", labelKey: "sc.selectAll" },
];

/** Keyboard shortcuts reference. */
export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t("sc.title")}>
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {SHORTCUTS.map((s) => (
          <div
            key={s.labelKey}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-ink-50 dark:hover:bg-night-hover"
          >
            <span className="text-sm text-ink-700 dark:text-ink-200">{t(s.labelKey)}</span>
            <kbd className="rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-xs font-medium text-ink-600 dark:border-night-border dark:bg-night-input dark:text-ink-300">
              {s.keys}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/** "About this editor" dialog. */
export function AboutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t("about.title")}>
      <div className="flex flex-col items-center text-center">
        <Logo className="scale-110" />
        <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          {t("about.body")}
        </p>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">
          {t("about.builtWith")}
        </p>
      </div>
    </Modal>
  );
}
