/**
 * File export helpers. Turns editor HTML into downloadable files in several
 * formats. All heavy converters are dynamically imported so they stay out of
 * the editor's initial bundle.
 */

/** Supported download/export formats. */
export type ExportFormat = "pdf" | "docx" | "md" | "txt" | "html";

const sanitizeFilename = (name: string) =>
  name.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim() || "document";

/** Trigger a browser download for a Blob. */
async function downloadBlob(blob: Blob, filename: string) {
  // file-saver is a CommonJS/UMD module; under dynamic import the `saveAs`
  // function can land on the namespace or on `.default`. Resolve defensively,
  // and fall back to a manual anchor-download if it isn't a function.
  const mod: any = await import("file-saver");
  const saveAs =
    typeof mod.saveAs === "function"
      ? mod.saveAs
      : typeof mod.default === "function"
        ? mod.default
        : typeof mod.default?.saveAs === "function"
          ? mod.default.saveAs
          : null;

  if (saveAs) {
    saveAs(blob, filename);
    return;
  }

  // Manual fallback.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Wrap editor HTML in a complete, self-contained HTML document with print-ready
 * styling. Used for the .html export and as the source for PDF/Word export.
 */
export function buildStandaloneHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1d222b; line-height: 1.6; max-width: 720px; margin: 48px auto; padding: 0 24px; }
  h1 { font-size: 2em; margin: 0.67em 0; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.25em; }
  p { margin: 0 0 0.75em; }
  blockquote { border-left: 3px solid #16834c; margin: 1em 0; padding: 0.25em 1em; color: #4d5a71; }
  pre { background: #f6f7f9; padding: 12px 16px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; }
  code { background: #f6f7f9; padding: 2px 4px; border-radius: 4px; font-family: 'Courier New', monospace; }
  pre code { background: none; padding: 0; }
  hr { border: none; border-top: 1px solid #d4d9e1; margin: 1.5em 0; }
  ul[data-type="taskList"] { list-style: none; padding-left: 0.25em; }
  ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 8px; }
  img { max-width: 100%; }
  table { border-collapse: collapse; }
  td, th { border: 1px solid #d4d9e1; padding: 6px 10px; }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Export as a standalone .html file. */
export async function exportHtml(title: string, html: string) {
  const full = buildStandaloneHtml(title, html);
  const blob = new Blob([full], { type: "text/html;charset=utf-8" });
  await downloadBlob(blob, `${sanitizeFilename(title)}.html`);
}

/** Export as plain text (.txt) — tags stripped, structure approximated. */
export async function exportText(title: string, html: string) {
  const el = document.createElement("div");
  el.innerHTML = html;
  // Convert block elements into line breaks for readable plain text.
  el.querySelectorAll("p, h1, h2, h3, h4, li, blockquote, pre, hr").forEach(
    (node) => node.append("\n"),
  );
  const text = (el.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  const blob = new Blob([text + "\n"], { type: "text/plain;charset=utf-8" });
  await downloadBlob(blob, `${sanitizeFilename(title)}.txt`);
}

/** Export as Markdown (.md) using Turndown for HTML→MD conversion. */
export async function exportMarkdown(title: string, html: string) {
  const TurndownService = (await import("turndown")).default;
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  // Preserve task-list checkboxes as GitHub-style markdown.
  service.addRule("taskItems", {
    filter: (node) =>
      node.nodeName === "LI" &&
      (node as HTMLElement).getAttribute("data-checked") !== null,
    replacement: (content, node) => {
      const checked =
        (node as HTMLElement).getAttribute("data-checked") === "true";
      return `- [${checked ? "x" : " "}] ${content.trim()}\n`;
    },
  });
  const markdown = service.turndown(html);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  await downloadBlob(blob, `${sanitizeFilename(title)}.md`);
}

/** Export as a Word document (.docx). */
export async function exportDocx(title: string, html: string) {
  const { asBlob } = await import("html-docx-js-typescript");
  const full = buildStandaloneHtml(title, html);
  const result = await asBlob(full, {
    orientation: "portrait",
    margins: { top: 720, right: 720, bottom: 720, left: 720 },
  });
  // asBlob may return a Blob (browser) — normalize defensively.
  const blob =
    result instanceof Blob
      ? result
      : new Blob([result as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
  await downloadBlob(blob, `${sanitizeFilename(title)}.docx`);
}

/**
 * Export as PDF.
 *
 * We render the document into a hidden iframe with print styling and invoke the
 * browser's native print-to-PDF. This produces crisp, vector text (selectable,
 * searchable) and faithful pagination — far better fidelity than rasterizing
 * the screen. The user picks "Save as PDF" in the print dialog.
 */
export async function exportPdf(title: string, html: string) {
  const full = buildStandaloneHtml(title, html);
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("Unable to prepare the document for PDF export.");
  }

  doc.open();
  doc.write(full);
  doc.close();
  // Set the print dialog's suggested filename via the document title.
  doc.title = sanitizeFilename(title);

  // Give the iframe a tick to lay out before printing.
  await new Promise((resolve) => setTimeout(resolve, 250));

  const win = iframe.contentWindow;
  if (win) {
    win.focus();
    win.print();
  }

  // Clean up after the print dialog has had time to capture the content.
  setTimeout(() => {
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  }, 1000);
}
