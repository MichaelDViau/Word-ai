"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Editor } from "@tiptap/react";
import { Check, ChevronRight } from "lucide-react";
import type { ExportFormat } from "@/lib/export";
import type { AiActionId } from "@/lib/ai";
import { LINE_SPACINGS } from "@/lib/constants";
import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/*  Menu primitives                                                            */
/* -------------------------------------------------------------------------- */

interface MenuBarContextValue {
  openId: string | null;
  setOpenId: (id: string | null) => void;
}
const MenuBarContext = createContext<MenuBarContextValue | null>(null);

/** A single top-level menu (e.g. "File") and its dropdown. */
function Menu({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const ctx = useContext(MenuBarContext)!;
  const open = ctx.openId === id;
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => ctx.setOpenId(null), [ctx]);

  return (
    <div
      ref={ref}
      className="relative"
      // Hovering a different menu while one is open switches to it — the
      // familiar desktop menu-bar behavior.
      onMouseEnter={() => {
        if (ctx.openId && ctx.openId !== id) ctx.setOpenId(id);
      }}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => ctx.setOpenId(open ? null : id)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "rounded-md px-2.5 py-1 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-night-hover",
          open && "bg-ink-100 dark:bg-night-hover",
        )}
      >
        {label}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-9 z-50 min-w-[15rem] animate-fade-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg dark:border-night-border dark:bg-night-raised dark:shadow-black/40"
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

/** A clickable menu row with optional icon, shortcut, and active check. */
function MenuItem({
  label,
  icon,
  shortcut,
  onClick,
  disabled,
  active,
  destructive,
}: {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm transition",
        "text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover",
        destructive && "text-rose-600 dark:text-rose-400",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
      )}
    >
      <span className="grid h-4 w-4 shrink-0 place-items-center text-ink-400 dark:text-ink-500">
        {active ? <Check className="h-4 w-4 text-nopal-600 dark:text-nopal-400" /> : icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="shrink-0 text-xs text-ink-300 dark:text-ink-500">{shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="my-1 h-px bg-ink-100 dark:bg-night-border" />;
}

function MenuLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-300 dark:text-ink-500">
      {children}
    </div>
  );
}

/** A nested fly-out submenu (e.g. "Download as ›"). */
function SubMenu({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm text-ink-700 transition hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover"
      >
        <span className="grid h-4 w-4 shrink-0 place-items-center text-ink-400 dark:text-ink-500">
          {icon}
        </span>
        <span className="flex-1 truncate">{label}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-300 dark:text-ink-500" />
      </button>
      {open && (
        <div className="absolute left-full top-0 z-50 ml-1 min-w-[12rem] animate-fade-in overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-lg dark:border-night-border dark:bg-night-raised dark:shadow-black/40">
          {children}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MenuBar                                                                     */
/* -------------------------------------------------------------------------- */

export interface MenuBarHandlers {
  // File
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onPrint: () => void;
  onExport: (format: ExportFormat) => void;
  // View
  showRuler: boolean;
  onToggleRuler: (show: boolean) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onPageSetup: () => void;
  // Insert
  onInsertImage: () => void;
  onInsertLink: () => void;
  // Tools
  onWordCount: () => void;
  onFindReplace: () => void;
  onOpenAi: (action?: AiActionId) => void;
  // Help
  onShortcuts: () => void;
  onAbout: () => void;
}

export function MenuBar({
  editor,
  handlers,
}: {
  editor: Editor;
  handlers: MenuBarHandlers;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!openId) return;
    const onDown = (e: MouseEvent) => {
      const bar = document.getElementById("nopal-menubar");
      if (bar && !bar.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  const run = (close: () => void, fn: () => void) => {
    close();
    fn();
  };

  const insertDate = () => {
    const date = new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    editor.chain().focus().insertContent(date).run();
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <MenuBarContext.Provider value={{ openId, setOpenId }}>
      <div id="nopal-menubar" className="flex items-center gap-0.5">
        {/* ---------------------------------------------------------------- File */}
        <Menu id="file" label="File">
          {(close) => (
            <>
              <MenuItem label="New document" shortcut="⌘N" onClick={() => run(close, handlers.onNew)} />
              <MenuItem label="Open from device" shortcut="⌘O" onClick={() => run(close, handlers.onOpen)} />
              <MenuDivider />
              <MenuItem label="Save" shortcut="⌘S" onClick={() => run(close, handlers.onSave)} />
              <MenuItem label="Save as a copy" onClick={() => run(close, handlers.onSaveAs)} />
              <MenuDivider />
              <SubMenu label="Download as">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => handlers.onExport("pdf"))} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">PDF (.pdf)</button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => handlers.onExport("docx"))} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">Word (.docx)</button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => handlers.onExport("md"))} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">Markdown (.md)</button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => handlers.onExport("txt"))} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">Plain text (.txt)</button>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => handlers.onExport("html"))} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">HTML (.html)</button>
              </SubMenu>
              <MenuItem label="Print" shortcut="⌘P" onClick={() => run(close, handlers.onPrint)} />
            </>
          )}
        </Menu>

        {/* ---------------------------------------------------------------- Edit */}
        <Menu id="edit" label="Edit">
          {(close) => (
            <>
              <MenuItem label="Undo" shortcut="⌘Z" disabled={!editor.can().undo()} onClick={() => run(close, () => editor.chain().focus().undo().run())} />
              <MenuItem label="Redo" shortcut="⌘⇧Z" disabled={!editor.can().redo()} onClick={() => run(close, () => editor.chain().focus().redo().run())} />
              <MenuDivider />
              <MenuItem label="Cut" shortcut="⌘X" onClick={() => run(close, () => document.execCommand("cut"))} />
              <MenuItem label="Copy" shortcut="⌘C" onClick={() => run(close, () => document.execCommand("copy"))} />
              <MenuItem label="Paste" shortcut="⌘V" onClick={() => run(close, () => navigator.clipboard?.readText().then((t) => editor.chain().focus().insertContent(t).run()).catch(() => {}))} />
              <MenuDivider />
              <MenuItem label="Select all" shortcut="⌘A" onClick={() => run(close, () => editor.chain().focus().selectAll().run())} />
              <MenuItem label="Find and replace" shortcut="⌘F" onClick={() => run(close, handlers.onFindReplace)} />
            </>
          )}
        </Menu>

        {/* ---------------------------------------------------------------- View */}
        <Menu id="view" label="View">
          {(close) => (
            <>
              <MenuItem
                label="Show ruler"
                active={handlers.showRuler}
                onClick={() => run(close, () => handlers.onToggleRuler(true))}
              />
              <MenuItem
                label="Hide ruler"
                active={!handlers.showRuler}
                onClick={() => run(close, () => handlers.onToggleRuler(false))}
              />
              <MenuDivider />
              <MenuItem label="Zoom in" shortcut="⌘+" onClick={() => run(close, handlers.onZoomIn)} />
              <MenuItem label="Zoom out" shortcut="⌘−" onClick={() => run(close, handlers.onZoomOut)} />
              <MenuItem label="Reset zoom (100%)" onClick={() => run(close, handlers.onResetZoom)} />
              <MenuDivider />
              <MenuItem
                label={handlers.fullscreen ? "Exit full screen" : "Full screen"}
                onClick={() => run(close, handlers.onToggleFullscreen)}
              />
              <MenuItem label="Page layout & size…" onClick={() => run(close, handlers.onPageSetup)} />
            </>
          )}
        </Menu>

        {/* -------------------------------------------------------------- Insert */}
        <Menu id="insert" label="Insert">
          {(close) => (
            <>
              <MenuItem label="Image…" onClick={() => run(close, handlers.onInsertImage)} />
              <MenuItem label="Table (3 × 3)" onClick={() => run(close, insertTable)} />
              <MenuItem label="Link…" shortcut="⌘K" onClick={() => run(close, handlers.onInsertLink)} />
              <MenuDivider />
              <MenuItem label="Today's date" onClick={() => run(close, insertDate)} />
              <MenuItem label="Horizontal line" onClick={() => run(close, () => editor.chain().focus().setHorizontalRule().run())} />
              <MenuItem label="Page break" onClick={() => run(close, () => editor.chain().focus().setPageBreak().run())} />
            </>
          )}
        </Menu>

        {/* -------------------------------------------------------------- Format */}
        <Menu id="format" label="Format">
          {(close) => (
            <>
              <MenuItem label="Bold" shortcut="⌘B" active={editor.isActive("bold")} onClick={() => run(close, () => editor.chain().focus().toggleBold().run())} />
              <MenuItem label="Italic" shortcut="⌘I" active={editor.isActive("italic")} onClick={() => run(close, () => editor.chain().focus().toggleItalic().run())} />
              <MenuItem label="Underline" shortcut="⌘U" active={editor.isActive("underline")} onClick={() => run(close, () => editor.chain().focus().toggleUnderline().run())} />
              <MenuItem label="Strikethrough" active={editor.isActive("strike")} onClick={() => run(close, () => editor.chain().focus().toggleStrike().run())} />
              <MenuDivider />
              <MenuLabel>Align</MenuLabel>
              <MenuItem label="Left" active={editor.isActive({ textAlign: "left" })} onClick={() => run(close, () => editor.chain().focus().setTextAlign("left").run())} />
              <MenuItem label="Center" active={editor.isActive({ textAlign: "center" })} onClick={() => run(close, () => editor.chain().focus().setTextAlign("center").run())} />
              <MenuItem label="Right" active={editor.isActive({ textAlign: "right" })} onClick={() => run(close, () => editor.chain().focus().setTextAlign("right").run())} />
              <MenuItem label="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => run(close, () => editor.chain().focus().setTextAlign("justify").run())} />
              <MenuDivider />
              <SubMenu label="Line spacing">
                {LINE_SPACINGS.map((s) => (
                  <button key={s.value} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => run(close, () => editor.chain().focus().setLineHeight(s.value).run())} className="flex w-full px-3 py-1.5 text-left text-sm text-ink-700 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover">{s.label}</button>
                ))}
              </SubMenu>
              <MenuItem label="Clear formatting" onClick={() => run(close, () => editor.chain().focus().unsetAllMarks().clearNodes().run())} />
            </>
          )}
        </Menu>

        {/* --------------------------------------------------------------- Tools */}
        <Menu id="tools" label="Tools">
          {(close) => (
            <>
              <MenuItem label="Word count" onClick={() => run(close, handlers.onWordCount)} />
              <MenuItem label="Find and replace" shortcut="⌘F" onClick={() => run(close, handlers.onFindReplace)} />
              <MenuDivider />
              <MenuLabel>Nopal AI</MenuLabel>
              <MenuItem label="AI rewrite" onClick={() => run(close, () => handlers.onOpenAi("rewrite"))} />
              <MenuItem label="AI correction" onClick={() => run(close, () => handlers.onOpenAi("correct"))} />
              <MenuItem label="AI translation" onClick={() => run(close, () => handlers.onOpenAi("translate"))} />
              <MenuItem label="AI summary" onClick={() => run(close, () => handlers.onOpenAi("summarize"))} />
              <MenuItem label="More AI tools…" onClick={() => run(close, () => handlers.onOpenAi())} />
            </>
          )}
        </Menu>

        {/* ---------------------------------------------------------------- Help */}
        <Menu id="help" label="Help">
          {(close) => (
            <>
              <MenuItem label="Keyboard shortcuts" onClick={() => run(close, handlers.onShortcuts)} />
              <MenuItem label="About this editor" onClick={() => run(close, handlers.onAbout)} />
            </>
          )}
        </Menu>
      </div>
    </MenuBarContext.Provider>
  );
}
