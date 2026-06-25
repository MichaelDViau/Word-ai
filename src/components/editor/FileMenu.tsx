"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileCode,
  FileDown,
  FilePlus2,
  FileText,
  FileType2,
  FileUp,
  Save,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ExportFormat = "pdf" | "docx" | "md" | "txt" | "html";

/**
 * The "File" dropdown in the editor header: New, Open, Save, and the export
 * formats. Pure presentational — all behavior is delegated via callbacks.
 */
export function FileMenu({
  onNew,
  onOpen,
  onSave,
  onExport,
  saving,
}: {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: (format: ExportFormat) => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-ink-100",
          open && "bg-ink-100",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download className="h-4 w-4" />
        File
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-11 z-50 w-60 animate-fade-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg"
        >
          <Item icon={<FilePlus2 className="h-4 w-4" />} label="New document" onClick={() => run(onNew)} />
          <Item icon={<FileUp className="h-4 w-4" />} label="Open from device" onClick={() => run(onOpen)} />
          <Item
            icon={<Save className="h-4 w-4" />}
            label={saving ? "Saving…" : "Save"}
            shortcut="⌘S"
            onClick={() => run(onSave)}
          />
          <Divider label="Export" />
          <Item icon={<FileDown className="h-4 w-4" />} label="Export as PDF" onClick={() => run(() => onExport("pdf"))} />
          <Item icon={<FileType2 className="h-4 w-4" />} label="Export as Word (.docx)" onClick={() => run(() => onExport("docx"))} />
          <Item icon={<FileText className="h-4 w-4" />} label="Export as Markdown" onClick={() => run(() => onExport("md"))} />
          <Item icon={<FileText className="h-4 w-4" />} label="Export as Text" onClick={() => run(() => onExport("txt"))} />
          <Item icon={<FileCode className="h-4 w-4" />} label="Export as HTML" onClick={() => run(() => onExport("html"))} />
        </div>
      )}
    </div>
  );
}

function Item({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-700 transition hover:bg-ink-50"
    >
      <span className="text-ink-400">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && <span className="text-xs text-ink-300">{shortcut}</span>}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="mt-1 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-300">
      {label}
    </div>
  );
}
