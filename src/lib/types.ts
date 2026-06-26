/**
 * Core domain types for Nopal AI Docs.
 *
 * The shapes here are intentionally backend-agnostic. The dashboard and editor
 * only ever talk to the `DocumentStore` interface (see `store.ts`), so swapping
 * localStorage for a REST/GraphQL API later is a matter of providing a new
 * store implementation — no UI changes required.
 */

/** A document as persisted in storage. */
export interface DocumentRecord {
  id: string;
  title: string;
  /** Editor content serialized as HTML. */
  content: string;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
  /** Cached metadata used by the dashboard (kept in sync on save). */
  wordCount: number;
  /** Short text preview shown on dashboard cards. */
  preview: string;
}

/** Fields the caller may provide when creating a document. */
export interface NewDocumentInput {
  title?: string;
  content?: string;
}

/** Fields that can be patched on an existing document. */
export interface DocumentPatch {
  title?: string;
  content?: string;
  wordCount?: number;
  preview?: string;
}

export type SortKey = "recent" | "title" | "created";

export type SaveState = "saved" | "saving" | "unsaved" | "error";

/**
 * Storage abstraction. Every method returns a Promise so that a future async
 * backend (cloud sync, accounts, sharing) is a drop-in replacement.
 */
export interface DocumentStore {
  list(): Promise<DocumentRecord[]>;
  get(id: string): Promise<DocumentRecord | null>;
  create(input?: NewDocumentInput): Promise<DocumentRecord>;
  update(id: string, patch: DocumentPatch): Promise<DocumentRecord>;
  duplicate(id: string): Promise<DocumentRecord>;
  remove(id: string): Promise<void>;
}
