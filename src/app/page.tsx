"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpDown,
  FileUp,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/editor/ThemeToggle";
import { LanguageToggle } from "@/components/editor/LanguageToggle";
import { useDocuments } from "@/lib/useDocuments";
import { ACCEPTED_IMPORT_TYPES, importFile } from "@/lib/import";
import { localDocumentStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import type { DocumentRecord, SortKey } from "@/lib/types";
import { cn } from "@/lib/cn";

const SORT_KEYS: Record<SortKey, string> = {
  recent: "dash.sort.recent",
  title: "dash.sort.title",
  created: "dash.sort.created",
};

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { documents, loading, error, create, rename, duplicate, remove, refresh } =
    useDocuments();

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [renameTarget, setRenameTarget] = useState<DocumentRecord | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DocumentRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const visible = useMemo(() => {
    const filtered = documents.filter((d) =>
      `${d.title} ${d.preview}`.toLowerCase().includes(query.toLowerCase()),
    );
    const sorted = [...filtered];
    if (sort === "title") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "created") {
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return sorted;
  }, [documents, query, sort]);

  async function handleCreate() {
    const doc = await create();
    router.push(`/editor/${doc.id}`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-importing the same file
    if (!file) return;
    setImporting(true);
    setImportError(null);
    try {
      const { title, html } = await importFile(file);
      const doc = await localDocumentStore.create({ title, content: html });
      router.push(`/editor/${doc.id}`);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : t("dash.couldNotImport"),
      );
      setImporting(false);
    }
  }

  function openRename(doc: DocumentRecord) {
    setRenameTarget(doc);
    setRenameValue(doc.title);
  }

  async function confirmRename() {
    if (renameTarget) {
      await rename(renameTarget.id, renameValue.trim() || t("editor.untitled"));
    }
    setRenameTarget(null);
  }

  async function confirmDelete() {
    if (deleteTarget) await remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/80 backdrop-blur dark:border-night-border dark:bg-night-surface/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50 dark:border-night-border dark:bg-night-raised dark:text-ink-200 dark:hover:bg-night-hover"
            >
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t("dash.openFile")}</span>
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-nopal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-nopal-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t("dash.newDocument")}</span>
              <span className="sm:hidden">{t("dash.new")}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-nopal-50 px-3 py-1 text-xs font-medium text-nopal-700 dark:bg-nopal-500/15 dark:text-nopal-300">
            <Sparkles className="h-3.5 w-3.5" />
            {t("dash.yourDocuments")}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-3xl">
            {t("dash.welcomeBack")}
          </h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {t("dash.subtitle")}
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("dash.searchPlaceholder")}
              className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-nopal-400 focus:ring-2 focus:ring-nopal-100 dark:border-night-border dark:bg-night-raised dark:text-ink-100 dark:focus:ring-nopal-500/20"
            />
          </div>
          <div className="relative inline-flex items-center">
            <ArrowUpDown className="pointer-events-none absolute left-3 h-4 w-4 text-ink-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="appearance-none rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-9 text-sm font-medium text-ink-700 outline-none transition focus:border-nopal-400 focus:ring-2 focus:ring-nopal-100 dark:border-night-border dark:bg-night-raised dark:text-ink-200 dark:focus:ring-nopal-500/20"
            >
              {(Object.keys(SORT_KEYS) as SortKey[]).map((key) => (
                <option key={key} value={key}>
                  {t(SORT_KEYS[key])}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* States */}
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        {importError && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {importError}
          </div>
        )}

        {loading ? (
          <SkeletonGrid />
        ) : visible.length === 0 ? (
          <EmptyState
            hasDocs={documents.length > 0}
            onCreate={handleCreate}
            onOpen={() => fileInputRef.current?.click()}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onRename={() => openRename(doc)}
                onDuplicate={() => duplicate(doc.id)}
                onDelete={() => setDeleteTarget(doc)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Hidden import input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMPORT_TYPES}
        className="hidden"
        onChange={handleImport}
      />

      {/* Importing overlay */}
      {importing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm dark:bg-night-base/70">
          <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-lg dark:bg-night-raised">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-nopal-200 border-t-nopal-600" />
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">
              {t("dash.importing")}
            </span>
          </div>
        </div>
      )}

      {/* Rename modal */}
      <Modal
        open={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title={t("dash.renameTitle")}
      >
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          className="w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm outline-none focus:border-nopal-400 focus:ring-2 focus:ring-nopal-100 dark:border-night-border dark:bg-night-input dark:text-ink-100 dark:focus:ring-nopal-500/20"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setRenameTarget(null)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-night-hover"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={confirmRename}
            className="rounded-lg bg-nopal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-nopal-700"
          >
            {t("common.save")}
          </button>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t("dash.deleteTitle")}
      >
        <p className="text-sm text-ink-600 dark:text-ink-300">
          {t("dash.deleteConfirmPre")}
          <span className="font-semibold text-ink-900 dark:text-ink-100">
            {deleteTarget?.title}
          </span>
          {t("dash.deleteConfirmPost")}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-night-hover"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={confirmDelete}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            {t("common.delete")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-56 animate-pulse rounded-2xl border border-ink-100 bg-white dark:border-night-border dark:bg-night-surface"
        />
      ))}
    </div>
  );
}

function EmptyState({
  hasDocs,
  onCreate,
  onOpen,
}: {
  hasDocs: boolean;
  onCreate: () => void;
  onOpen: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-white py-20 text-center dark:border-night-border dark:bg-night-surface">
      <div className="max-w-sm px-6">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-nopal-50 dark:bg-nopal-500/15">
          <Plus className="h-7 w-7 text-nopal-600 dark:text-nopal-400" />
        </div>
        <h2 className="text-lg font-semibold text-ink-950 dark:text-ink-50">
          {hasDocs ? t("dash.noMatching") : t("dash.noDocsYet")}
        </h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
          {hasDocs ? t("dash.tryDifferentSearch") : t("dash.emptyHint")}
        </p>
        {!hasDocs && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={onCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-nopal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-nopal-700"
            >
              <Plus className="h-4 w-4" />
              {t("dash.newDocument")}
            </button>
            <button
              onClick={onOpen}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 dark:border-night-border dark:text-ink-200 dark:hover:bg-night-hover",
              )}
            >
              <FileUp className="h-4 w-4" />
              {t("dash.openFile")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
