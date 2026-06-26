"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CheckSquare,
  Code2,
  Highlighter,
  Indent,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Outdent,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
  Baseline,
} from "lucide-react";
import {
  Dropdown,
  DropdownItem,
  DropdownTrigger,
  ToolbarButton,
  ToolbarDivider,
} from "./ToolbarPrimitives";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  LINE_SPACINGS,
  TEXT_COLORS,
} from "@/lib/constants";
import { useI18n, type TFunction } from "@/lib/i18n";

interface BlockStyle {
  labelKey: string;
  className: string;
  isActive: (e: Editor) => boolean;
  apply: (e: Editor) => void;
}

const BLOCK_STYLES: BlockStyle[] = [
  {
    labelKey: "block.title",
    className: "text-2xl font-extrabold",
    isActive: (e) => e.isActive("heading", { level: 1, displayStyle: "title" }),
    apply: (e) =>
      e
        .chain()
        .focus()
        .setNode("heading", { level: 1, displayStyle: "title" })
        .run(),
  },
  {
    labelKey: "block.subtitle",
    className: "text-lg text-ink-500",
    isActive: (e) =>
      e.isActive("heading", { level: 2, displayStyle: "subtitle" }),
    apply: (e) =>
      e
        .chain()
        .focus()
        .setNode("heading", { level: 2, displayStyle: "subtitle" })
        .run(),
  },
  {
    labelKey: "block.heading1",
    className: "text-xl font-bold",
    isActive: (e) => e.isActive("heading", { level: 1, displayStyle: null }),
    apply: (e) =>
      e.chain().focus().setNode("heading", { level: 1, displayStyle: null }).run(),
  },
  {
    labelKey: "block.heading2",
    className: "text-lg font-bold",
    isActive: (e) => e.isActive("heading", { level: 2, displayStyle: null }),
    apply: (e) =>
      e.chain().focus().setNode("heading", { level: 2, displayStyle: null }).run(),
  },
  {
    labelKey: "block.heading3",
    className: "text-base font-semibold",
    isActive: (e) => e.isActive("heading", { level: 3, displayStyle: null }),
    apply: (e) =>
      e.chain().focus().setNode("heading", { level: 3, displayStyle: null }).run(),
  },
  {
    labelKey: "block.body",
    className: "text-sm",
    isActive: (e) => e.isActive("paragraph"),
    apply: (e) => e.chain().focus().setParagraph().run(),
  },
];

function activeBlockLabelKey(editor: Editor): string {
  const match = BLOCK_STYLES.find((b) => b.isActive(editor));
  return match ? match.labelKey : "block.body";
}

function activeFontLabel(editor: Editor, t: TFunction): string {
  const family = editor.getAttributes("textStyle").fontFamily as
    | string
    | undefined;
  const found = FONT_FAMILIES.find((f) => f.value === family);
  return found ? found.label : t("common.default");
}

function activeFontSize(editor: Editor): string {
  const size = editor.getAttributes("textStyle").fontSize as string | undefined;
  return size ? size.replace("px", "") : "16";
}

/**
 * The full formatting toolbar. Receives the live TipTap editor and a render
 * tick (`version`) that forces re-render on selection/transaction changes so
 * active states stay accurate.
 */
export function Toolbar({ editor }: { editor: Editor }) {
  const { t } = useI18n();
  // Re-render is driven by the parent passing a changing key/state; we also
  // read directly off the editor for active states.
  return (
    <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto px-2 py-1.5">
      {/* Undo / redo */}
      <ToolbarButton
        title={t("tb.undo")}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.redo")}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block style */}
      <Dropdown
        width="w-52"
        trigger={({ open, toggle }) => (
          <DropdownTrigger
            open={open}
            toggle={toggle}
            title={t("tb.paragraphStyle")}
            label={t(activeBlockLabelKey(editor))}
            className="min-w-[104px] justify-between"
          />
        )}
      >
        {(close) => (
          <div className="max-h-72 overflow-y-auto">
            {BLOCK_STYLES.map((style) => (
              <DropdownItem
                key={style.labelKey}
                active={style.isActive(editor)}
                onClick={() => {
                  style.apply(editor);
                  close();
                }}
              >
                <span className={style.className}>{t(style.labelKey)}</span>
              </DropdownItem>
            ))}
          </div>
        )}
      </Dropdown>

      <ToolbarDivider />

      {/* Font family */}
      <Dropdown
        width="w-52"
        trigger={({ open, toggle }) => (
          <DropdownTrigger
            open={open}
            toggle={toggle}
            title={t("tb.font")}
            label={activeFontLabel(editor, t)}
            className="min-w-[112px] justify-between"
          />
        )}
      >
        {(close) => {
          const current = editor.getAttributes("textStyle").fontFamily as
            | string
            | undefined;
          let lastGroup: string | undefined;
          return (
            <div className="max-h-72 overflow-y-auto">
              {FONT_FAMILIES.map((font, i) => {
                const showHeader = font.group && font.group !== lastGroup;
                lastGroup = font.group;
                return (
                  <div key={`${font.value}-${i}`}>
                    {showHeader && (
                      <div className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-300 dark:text-ink-500">
                        {t(`fontgroup.${font.group}`)}
                      </div>
                    )}
                    <DropdownItem
                      style={{ fontFamily: font.value }}
                      active={current === font.value}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(font.value).run();
                        close();
                      }}
                    >
                      {font.label}
                    </DropdownItem>
                  </div>
                );
              })}
            </div>
          );
        }}
      </Dropdown>

      {/* Font size */}
      <Dropdown
        width="w-24"
        trigger={({ open, toggle }) => (
          <DropdownTrigger
            open={open}
            toggle={toggle}
            title={t("tb.fontSize")}
            label={activeFontSize(editor)}
            className="min-w-[52px]"
          />
        )}
      >
        {(close) => (
          <div className="max-h-72 overflow-y-auto">
            {FONT_SIZES.map((size) => (
              <DropdownItem
                key={size}
                active={activeFontSize(editor) === String(size)}
                onClick={() => {
                  editor.chain().focus().setFontSize(`${size}px`).run();
                  close();
                }}
              >
                {size}
              </DropdownItem>
            ))}
          </div>
        )}
      </Dropdown>

      <ToolbarDivider />

      {/* Inline marks */}
      <ToolbarButton
        title={t("tb.bold")}
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.italic")}
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.underline")}
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.strike")}
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      {/* Text color */}
      <ColorMenu
        title={t("tb.textColor")}
        icon={
          <Baseline
            className="h-4 w-4"
            style={{
              color:
                (editor.getAttributes("textStyle").color as string) ||
                undefined,
            }}
          />
        }
        colors={TEXT_COLORS}
        current={editor.getAttributes("textStyle").color as string | undefined}
        onPick={(c) => editor.chain().focus().setColor(c).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
        clearLabel={t("tb.defaultColor")}
      />

      {/* Highlight */}
      <ColorMenu
        title={t("tb.highlightColor")}
        icon={<Highlighter className="h-4 w-4" />}
        colors={HIGHLIGHT_COLORS}
        current={editor.getAttributes("highlight").color as string | undefined}
        onPick={(c) =>
          editor.chain().focus().toggleHighlight({ color: c }).run()
        }
        onClear={() => editor.chain().focus().unsetHighlight().run()}
        clearLabel={t("tb.noHighlight")}
      />

      {/* Link */}
      <LinkButton editor={editor} />

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        title={t("tb.bulletList")}
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.numberedList")}
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.checklist")}
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <CheckSquare className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        title={t("tb.alignLeft")}
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.alignCenter")}
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.alignRight")}
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.justify")}
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <AlignJustify className="h-4 w-4" />
      </ToolbarButton>

      {/* Line spacing */}
      <Dropdown
        width="w-36"
        trigger={({ open, toggle }) => (
          <DropdownTrigger
            open={open}
            toggle={toggle}
            title={t("tb.lineSpacing")}
            label={t("tb.spacing")}
            className="min-w-[80px]"
          />
        )}
      >
        {(close) => (
          <div>
            {LINE_SPACINGS.map((s) => (
              <DropdownItem
                key={s.value}
                onClick={() => {
                  editor.chain().focus().setLineHeight(s.value).run();
                  close();
                }}
              >
                {s.tkey ? t(s.tkey) : s.label}
              </DropdownItem>
            ))}
          </div>
        )}
      </Dropdown>

      <ToolbarDivider />

      {/* Indent / outdent — implemented via list sink/lift, falling back to
          nothing outside lists (kept honest: disabled when not applicable). */}
      <ToolbarButton
        title={t("tb.decreaseIndent")}
        disabled={!editor.can().liftListItem("listItem")}
        onClick={() => editor.chain().focus().liftListItem("listItem").run()}
      >
        <Outdent className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.increaseIndent")}
        disabled={!editor.can().sinkListItem("listItem")}
        onClick={() => editor.chain().focus().sinkListItem("listItem").run()}
      >
        <Indent className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarButton
        title={t("tb.blockquote")}
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.codeBlock")}
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title={t("tb.horizontalDivider")}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

function ColorMenu({
  title,
  icon,
  colors,
  current,
  onPick,
  onClear,
  clearLabel,
}: {
  title: string;
  icon: React.ReactNode;
  colors: string[];
  current?: string;
  onPick: (color: string) => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <Dropdown
      width="w-auto"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggle}
          title={title}
          aria-label={title}
          aria-expanded={open}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-600 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-night-hover dark:hover:text-ink-50"
        >
          {icon}
        </button>
      )}
    >
      {(close) => (
        <div className="p-1">
          <div className="grid grid-cols-5 gap-1">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(c);
                  close();
                }}
                title={c}
                className="h-6 w-6 rounded-md border border-ink-200 transition hover:scale-110 dark:border-night-border"
                style={{
                  backgroundColor: c,
                  outline: current === c ? "2px solid #16834c" : undefined,
                  outlineOffset: "1px",
                }}
              />
            ))}
          </div>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onClear();
              close();
            }}
            className="mt-1.5 w-full rounded-lg px-2 py-1.5 text-left text-xs text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-night-hover"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </Dropdown>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const start = () => {
    const prev = (editor.getAttributes("link").href as string) || "";
    setValue(prev);
    setOpen(true);
  };

  const apply = () => {
    const href = value.trim();
    if (!href) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const normalized = /^https?:\/\//i.test(href) ? href : `https://${href}`;
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: normalized })
        .run();
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <ToolbarButton
        title={t("tb.insertLink")}
        active={editor.isActive("link")}
        onClick={start}
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      {open && (
        <div className="absolute top-10 z-40 w-64 animate-fade-in rounded-xl border border-ink-200 bg-white p-2 shadow-lg dark:border-night-border dark:bg-night-raised">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder={t("tb.pasteUrl")}
            className="w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-sm outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
          />
          <div className="mt-2 flex justify-end gap-1.5">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
              className="rounded-md px-2.5 py-1 text-xs text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-night-hover"
            >
              {t("common.cancel")}
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={apply}
              className="rounded-md bg-nopal-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-nopal-700"
            >
              {t("common.apply")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
