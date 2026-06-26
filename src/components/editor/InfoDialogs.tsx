"use client";

import type { Editor } from "@tiptap/react";
import { Modal } from "@/components/ui/Modal";
import { Logo } from "@/components/Logo";

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
  const words = editor?.storage.characterCount.words() ?? 0;
  const characters = editor?.storage.characterCount.characters() ?? 0;
  const charactersNoSpaces = (editor?.getText() ?? "").replace(/\s/g, "").length;
  const readingMinutes = Math.max(1, Math.round(words / 200));

  const rows = [
    { label: "Words", value: words.toLocaleString() },
    { label: "Characters", value: characters.toLocaleString() },
    { label: "Characters (no spaces)", value: charactersNoSpaces.toLocaleString() },
    { label: "Estimated reading time", value: `${readingMinutes} min` },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Word count">
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

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘ / Ctrl + S", label: "Save document" },
  { keys: "⌘ / Ctrl + Z", label: "Undo" },
  { keys: "⌘ / Ctrl + ⇧ + Z", label: "Redo" },
  { keys: "⌘ / Ctrl + B", label: "Bold" },
  { keys: "⌘ / Ctrl + I", label: "Italic" },
  { keys: "⌘ / Ctrl + U", label: "Underline" },
  { keys: "⌘ / Ctrl + K", label: "Insert link" },
  { keys: "⌘ / Ctrl + F", label: "Find and replace" },
  { keys: "⌘ / Ctrl + A", label: "Select all" },
];

/** Keyboard shortcuts reference. */
export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortcuts">
      <div className="max-h-[60vh] space-y-1 overflow-y-auto">
        {SHORTCUTS.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-ink-50 dark:hover:bg-night-hover"
          >
            <span className="text-sm text-ink-700 dark:text-ink-200">{s.label}</span>
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
  return (
    <Modal open={open} onClose={onClose} title="About this editor">
      <div className="flex flex-col items-center text-center">
        <Logo className="scale-110" />
        <p className="mt-4 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
          A professional, web-based document editor with rich formatting, import
          and export, page layouts, a polished dark mode, and an integrated
          Nopal AI writing assistant.
        </p>
        <p className="mt-3 text-xs text-ink-400 dark:text-ink-500">
          Built with Next.js · TypeScript · Tailwind CSS · TipTap
        </p>
      </div>
    </Modal>
  );
}
