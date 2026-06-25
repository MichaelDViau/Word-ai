"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { localDocumentStore } from "@/lib/store";
import type { DocumentRecord } from "@/lib/types";

/**
 * Editor route. Loads the requested document from the store on the client
 * (localStorage isn't available during SSR) and hands it to the editor.
 */
export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [doc, setDoc] = useState<DocumentRecord | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const found = await localDocumentStore.get(id);
      if (cancelled) return;
      if (found) {
        setDoc(found);
        setStatus("ready");
      } else {
        setStatus("missing");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50">
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading document…</span>
        </div>
      </div>
    );
  }

  if (status === "missing" || !doc) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-50 px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold text-ink-950">
            Document not found
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            This document may have been deleted or isn&apos;t available on this
            device.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-xl bg-nopal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-nopal-700"
          >
            Back to documents
          </Link>
        </div>
      </div>
    );
  }

  // `key` ensures a fresh editor instance when navigating between documents.
  return <DocumentEditor key={doc.id} initialDoc={doc} />;
}
