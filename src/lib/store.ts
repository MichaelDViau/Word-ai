import { nanoid } from "nanoid";
import { STORAGE_KEY } from "./constants";
import type {
  DocumentPatch,
  DocumentRecord,
  DocumentStore,
  NewDocumentInput,
} from "./types";

/**
 * Compute a plain-text preview and word count from editor HTML.
 * Runs in the browser (uses the DOM) — guarded for SSR safety.
 */
export function deriveMeta(html: string): { preview: string; wordCount: number } {
  if (typeof document === "undefined") {
    // Fallback during SSR: strip tags crudely.
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return {
      preview: text.slice(0, 180),
      wordCount: text ? text.split(/\s+/).length : 0,
    };
  }
  const el = document.createElement("div");
  el.innerHTML = html;
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  return {
    preview: text.slice(0, 180),
    wordCount: text ? text.split(/\s+/).filter(Boolean).length : 0,
  };
}

const now = () => new Date().toISOString();

const STARTER_HTML = `
  <h1>Welcome to Nopal AI Docs 🌵</h1>
  <p>This is your first document. Start typing to replace this text, or explore the toolbar above to format your writing.</p>
  <p>A few things you can try right away:</p>
  <ul>
    <li><strong>Bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s> text</li>
    <li>Headings, lists, checklists, quotes, and code blocks</li>
    <li>Import a <code>.docx</code>, <code>.md</code>, <code>.txt</code>, or <code>.html</code> file</li>
    <li>Export to PDF, Word, Markdown, Text, or HTML</li>
  </ul>
  <blockquote><p>Tip: open the <strong>AI Assistant</strong> panel on the right to see the writing tools coming soon.</p></blockquote>
`;

/** Safely read all documents from localStorage. */
function readAll(): DocumentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as DocumentRecord[];
  } catch (err) {
    console.error("Failed to read documents from storage:", err);
    return [];
  }
}

/** Persist the full document list. */
function writeAll(docs: DocumentRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error("Failed to write documents to storage:", err);
    throw new Error(
      "Could not save — your browser storage may be full or disabled.",
    );
  }
}

/**
 * localStorage-backed implementation of `DocumentStore`.
 *
 * All methods are async to keep the same contract a networked backend would
 * expose, even though the work here is synchronous.
 */
export const localDocumentStore: DocumentStore = {
  async list() {
    return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async get(id) {
    return readAll().find((d) => d.id === id) ?? null;
  },

  async create(input: NewDocumentInput = {}) {
    const docs = readAll();
    const content = input.content ?? (docs.length === 0 ? STARTER_HTML : "<p></p>");
    const meta = deriveMeta(content);
    const record: DocumentRecord = {
      id: nanoid(12),
      title: input.title?.trim() || "Untitled document",
      content,
      createdAt: now(),
      updatedAt: now(),
      wordCount: meta.wordCount,
      preview: meta.preview,
    };
    writeAll([record, ...docs]);
    return record;
  },

  async update(id, patch: DocumentPatch) {
    const docs = readAll();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error("Document not found");
    const existing = docs[idx];
    const content = patch.content ?? existing.content;
    const meta =
      patch.content !== undefined
        ? deriveMeta(content)
        : { preview: existing.preview, wordCount: existing.wordCount };
    const updated: DocumentRecord = {
      ...existing,
      ...patch,
      content,
      wordCount: patch.wordCount ?? meta.wordCount,
      preview: patch.preview ?? meta.preview,
      updatedAt: now(),
    };
    docs[idx] = updated;
    writeAll(docs);
    return updated;
  },

  async duplicate(id) {
    const docs = readAll();
    const source = docs.find((d) => d.id === id);
    if (!source) throw new Error("Document not found");
    const copy: DocumentRecord = {
      ...source,
      id: nanoid(12),
      title: `${source.title} (copy)`,
      createdAt: now(),
      updatedAt: now(),
    };
    writeAll([copy, ...docs]);
    return copy;
  },

  async remove(id) {
    const docs = readAll().filter((d) => d.id !== id);
    writeAll(docs);
  },
};
