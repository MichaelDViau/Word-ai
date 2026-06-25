/**
 * File import helpers. Converts uploaded files into editor-ready HTML while
 * preserving as much formatting as the source allows.
 *
 * Heavy parsers (mammoth, marked) are dynamically imported so they only load
 * in the browser when an import actually happens — keeping the editor's initial
 * bundle small.
 */

export interface ImportResult {
  /** Suggested document title derived from the file name. */
  title: string;
  /** Editor-ready HTML. */
  html: string;
}

const stripExtension = (name: string) =>
  name.replace(/\.[^.]+$/, "").trim() || "Imported document";

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Convert a plain-text string into paragraph HTML. */
function textToHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n");
  return normalized
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map(escapeHtml).join("<br>");
      return `<p>${lines || ""}</p>`;
    })
    .join("");
}

/**
 * Read an uploaded file and return editor HTML plus a suggested title.
 * Supports .docx, .txt, .md / .markdown, and .html / .htm.
 */
export async function importFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();
  const title = stripExtension(file.name);

  // Word documents — mammoth converts .docx to semantic HTML.
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth/mammoth.browser");
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.convertToHtml({ arrayBuffer });
    return { title, html: value || "<p></p>" };
  }

  // Legacy .doc is not supported by mammoth's browser build.
  if (name.endsWith(".doc")) {
    throw new Error(
      "Legacy .doc files aren't supported. Please save as .docx and try again.",
    );
  }

  const text = await file.text();

  // Markdown — marked produces HTML; TipTap will normalize it on load.
  if (name.endsWith(".md") || name.endsWith(".markdown")) {
    const { marked } = await import("marked");
    const html = await marked.parse(text, { breaks: true, gfm: true });
    return { title, html: typeof html === "string" ? html : String(html) };
  }

  // Raw HTML — extract <body> if present so we don't import <head> noise.
  if (name.endsWith(".html") || name.endsWith(".htm")) {
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return { title, html: (bodyMatch ? bodyMatch[1] : text) || "<p></p>" };
  }

  // Plain text and everything else.
  return { title, html: textToHtml(text) };
}

/** File extensions accepted by the open/import file picker. */
export const ACCEPTED_IMPORT_TYPES = ".docx,.txt,.md,.markdown,.html,.htm";
