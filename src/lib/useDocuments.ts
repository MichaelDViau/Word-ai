"use client";

import { useCallback, useEffect, useState } from "react";
import { localDocumentStore } from "./store";
import type { DocumentRecord, NewDocumentInput } from "./types";

/**
 * Hook backing the dashboard. Loads the document list and exposes CRUD actions
 * that keep local state in sync with the store.
 */
export function useDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const docs = await localDocumentStore.list();
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input?: NewDocumentInput) => {
      const doc = await localDocumentStore.create(input);
      await refresh();
      return doc;
    },
    [refresh],
  );

  const rename = useCallback(
    async (id: string, title: string) => {
      await localDocumentStore.update(id, { title });
      await refresh();
    },
    [refresh],
  );

  const duplicate = useCallback(
    async (id: string) => {
      await localDocumentStore.duplicate(id);
      await refresh();
    },
    [refresh],
  );

  const remove = useCallback(
    async (id: string) => {
      await localDocumentStore.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { documents, loading, error, refresh, create, rename, duplicate, remove };
}
