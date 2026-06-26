import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import CharacterCount from "@tiptap/extension-character-count";
import type { Extensions } from "@tiptap/react";
import { FontSize } from "./fontSize";
import { LineHeight } from "./lineHeight";
import { HeadingWithStyle } from "./headingStyle";
import { PageBreak } from "./pageBreak";

/**
 * The complete set of TipTap extensions powering the editor. Centralized here
 * so both the editor and any headless rendering use an identical schema.
 */
export function buildExtensions(): Extensions {
  return [
    StarterKit.configure({
      // Heading is provided by HeadingWithStyle below so we can support the
      // Title / Subtitle block styles.
      heading: false,
      codeBlock: {
        HTMLAttributes: { class: "code-block" },
      },
      blockquote: {},
      horizontalRule: {},
    }),
    HeadingWithStyle.configure({ levels: [1, 2, 3] }),
    Underline,
    TextStyle,
    Color,
    FontFamily,
    FontSize,
    LineHeight,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Subscript,
    Superscript,
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),
    Image.configure({
      inline: false,
      allowBase64: true,
      HTMLAttributes: { class: "editor-image" },
    }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    PageBreak,
    TaskList,
    TaskItem.configure({ nested: true }),
    CharacterCount,
    Placeholder.configure({
      placeholder: "Start writing, or press '/' for options…",
    }),
  ];
}
