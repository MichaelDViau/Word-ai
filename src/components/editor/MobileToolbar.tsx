"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Plus,
  Redo2,
  Sparkles,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import {
  FONT_FAMILIES,
  HIGHLIGHT_COLORS,
  LINE_SPACINGS,
  TEXT_COLORS,
} from "@/lib/constants";
import { cn } from "@/lib/cn";

const BLOCK_CHIPS = [
  { label: "Title", apply: (e: Editor) => e.chain().focus().setNode("heading", { level: 1, displayStyle: "title" }).run() },
  { label: "H1", apply: (e: Editor) => e.chain().focus().setNode("heading", { level: 1, displayStyle: null }).run() },
  { label: "H2", apply: (e: Editor) => e.chain().focus().setNode("heading", { level: 2, displayStyle: null }).run() },
  { label: "H3", apply: (e: Editor) => e.chain().focus().setNode("heading", { level: 3, displayStyle: null }).run() },
  { label: "Body", apply: (e: Editor) => e.chain().focus().setParagraph().run() },
];

/**
 * The mobile-only editing experience. A clean, large-target bottom bar holds the
 * essentials; everything advanced lives in tidy slide-up sheets so the small
 * screen never feels like a squeezed desktop app.
 */
export function MobileToolbar({
  editor,
  onOpenAi,
  onInsertImage,
  onInsertLink,
}: {
  editor: Editor;
  onOpenAi: () => void;
  onInsertImage: () => void;
  onInsertLink: () => void;
}) {
  const [sheet, setSheet] = useState<null | "format" | "insert">(null);
  const close = () => setSheet(null);

  return (
    <>
      {/* Bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-ink-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-night-border dark:bg-night-surface/95 sm:hidden">
        <BarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Undo2 className="h-5 w-5" />
        </BarButton>
        <BarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Redo2 className="h-5 w-5" />
        </BarButton>
        <BarButton label="Format" onClick={() => setSheet("format")}>
          <Type className="h-5 w-5" />
        </BarButton>
        <BarButton label="Insert" onClick={() => setSheet("insert")}>
          <Plus className="h-5 w-5" />
        </BarButton>
        <BarButton label="AI" highlight onClick={onOpenAi}>
          <Sparkles className="h-5 w-5" />
        </BarButton>
      </nav>

      {/* Format sheet */}
      <BottomSheet open={sheet === "format"} onClose={close} title="Format">
        <div className="space-y-4">
          {/* Block styles */}
          <div className="flex flex-wrap gap-2">
            {BLOCK_CHIPS.map((b) => (
              <button
                key={b.label}
                onClick={() => b.apply(editor)}
                className="rounded-full border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-700 transition active:scale-95 dark:border-night-border dark:text-ink-200"
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Inline marks */}
          <div className="grid grid-cols-3 gap-2">
            <SheetToggle active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} icon={<Bold className="h-5 w-5" />} label="Bold" />
            <SheetToggle active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} icon={<Italic className="h-5 w-5" />} label="Italic" />
            <SheetToggle active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} icon={<UnderlineIcon className="h-5 w-5" />} label="Underline" />
          </div>

          {/* Font family */}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Font</span>
            <select
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              value={(editor.getAttributes("textStyle").fontFamily as string) || ""}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 dark:border-night-border dark:bg-night-input dark:text-ink-100"
            >
              <option value="">Default</option>
              {FONT_FAMILIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          {/* Alignment + lists */}
          <div className="grid grid-cols-5 gap-2">
            <SheetIcon active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-5 w-5" /></SheetIcon>
            <SheetIcon active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-5 w-5" /></SheetIcon>
            <SheetIcon active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-5 w-5" /></SheetIcon>
            <SheetIcon active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-5 w-5" /></SheetIcon>
            <SheetIcon active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-5 w-5" /></SheetIcon>
          </div>

          {/* Checklist + line spacing */}
          <div className="flex flex-wrap items-center gap-2">
            <SheetIcon active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}><CheckSquare className="h-5 w-5" /></SheetIcon>
            {LINE_SPACINGS.map((s) => (
              <button
                key={s.value}
                onClick={() => editor.chain().focus().setLineHeight(s.value).run()}
                className="rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 dark:border-night-border dark:text-ink-200"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Colors */}
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Text color</span>
            <div className="flex flex-wrap gap-2">
              {TEXT_COLORS.map((c) => (
                <button key={c} onClick={() => editor.chain().focus().setColor(c).run()} className="h-8 w-8 rounded-full border border-ink-200 dark:border-night-border" style={{ backgroundColor: c }} aria-label={`Text ${c}`} />
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-ink-500 dark:text-ink-400">Highlight</span>
            <div className="flex flex-wrap gap-2">
              {HIGHLIGHT_COLORS.map((c) => (
                <button key={c} onClick={() => editor.chain().focus().toggleHighlight({ color: c }).run()} className="h-8 w-8 rounded-full border border-ink-200 dark:border-night-border" style={{ backgroundColor: c }} aria-label={`Highlight ${c}`} />
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>

      {/* Insert sheet */}
      <BottomSheet open={sheet === "insert"} onClose={close} title="Insert">
        <div className="grid grid-cols-3 gap-3">
          <SheetTile icon={<ImageIcon className="h-6 w-6" />} label="Image" onClick={() => { close(); onInsertImage(); }} />
          <SheetTile icon={<TableIcon className="h-6 w-6" />} label="Table" onClick={() => { close(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); }} />
          <SheetTile icon={<Link2 className="h-6 w-6" />} label="Link" onClick={() => { close(); onInsertLink(); }} />
          <SheetTile icon={<Minus className="h-6 w-6" />} label="Divider" onClick={() => { close(); editor.chain().focus().setHorizontalRule().run(); }} />
          <SheetTile
            icon={<span className="text-base font-semibold">📅</span>}
            label="Date"
            onClick={() => {
              close();
              const d = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
              editor.chain().focus().insertContent(d).run();
            }}
          />
          <SheetTile icon={<span className="text-base font-semibold">⤓</span>} label="Page break" onClick={() => { close(); editor.chain().focus().setPageBreak().run(); }} />
        </div>
      </BottomSheet>
    </>
  );
}

function BarButton({
  children,
  label,
  onClick,
  disabled,
  highlight,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition active:scale-95 disabled:opacity-40",
        highlight ? "text-nopal-600 dark:text-nopal-400" : "text-ink-500 dark:text-ink-300",
      )}
    >
      {children}
      {label}
    </button>
  );
}

function SheetToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition active:scale-95",
        active
          ? "border-nopal-300 bg-nopal-50 text-nopal-700 dark:border-nopal-500/50 dark:bg-nopal-500/15 dark:text-nopal-300"
          : "border-ink-200 text-ink-700 dark:border-night-border dark:text-ink-200",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SheetIcon({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "grid h-12 place-items-center rounded-xl border transition active:scale-95",
        active
          ? "border-nopal-300 bg-nopal-50 text-nopal-700 dark:border-nopal-500/50 dark:bg-nopal-500/15 dark:text-nopal-300"
          : "border-ink-200 text-ink-700 dark:border-night-border dark:text-ink-200",
      )}
    >
      {children}
    </button>
  );
}

function SheetTile({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-ink-200 text-ink-700 transition active:scale-95 dark:border-night-border dark:text-ink-200"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
