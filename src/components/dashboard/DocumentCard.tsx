"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { DocumentRecord } from "@/lib/types";
import { cn } from "@/lib/cn";

function formatDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DocumentCard({
  doc,
  onRename,
  onDuplicate,
  onDelete,
}: {
  doc: DocumentRecord;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const runAction = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-nopal-300 hover:shadow-page">
      <Link
        href={`/editor/${doc.id}`}
        className="flex flex-1 flex-col"
        aria-label={`Open ${doc.title}`}
      >
        {/* Mini page preview */}
        <div className="relative h-36 overflow-hidden border-b border-ink-100 bg-gradient-to-b from-ink-50 to-white px-5 pt-5">
          <p className="line-clamp-5 text-[11px] leading-relaxed text-ink-400">
            {doc.preview || "Empty document"}
          </p>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        </div>
        <div className="flex items-start gap-2 px-4 py-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-nopal-600" />
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium text-ink-950">
              {doc.title}
            </h3>
            <p className="mt-0.5 text-xs text-ink-400">
              {formatDate(doc.updatedAt)} · {doc.wordCount} words
            </p>
          </div>
        </div>
      </Link>

      {/* Context menu */}
      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((v) => !v);
          }}
          className={cn(
            "rounded-lg bg-white/80 p-1.5 text-ink-500 opacity-0 shadow-sm backdrop-blur transition hover:bg-white hover:text-ink-900 group-hover:opacity-100",
            menuOpen && "opacity-100",
          )}
          aria-label="Document options"
          aria-haspopup="menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-9 z-20 w-44 animate-fade-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1 shadow-lg"
          >
            <MenuItem icon={<Pencil className="h-4 w-4" />} label="Rename" onClick={() => runAction(onRename)} />
            <MenuItem icon={<Copy className="h-4 w-4" />} label="Duplicate" onClick={() => runAction(onDuplicate)} />
            <div className="my-1 h-px bg-ink-100" />
            <MenuItem
              icon={<Trash2 className="h-4 w-4" />}
              label="Delete"
              destructive
              onClick={() => runAction(onDelete)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition",
        destructive
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-ink-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
