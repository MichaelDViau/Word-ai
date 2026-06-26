"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EditorContent, useEditor } from "@tiptap/react";
import {
  ArrowLeft,
  Check,
  CloudOff,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Toolbar } from "./Toolbar";
import { AiPanel } from "./AiPanel";
import { MenuBar, type MenuBarHandlers } from "./MenuBar";
import { ThemeToggle } from "./ThemeToggle";
import { Ruler } from "./Ruler";
import { MobileToolbar } from "./MobileToolbar";
import { PageSetupDialog } from "./PageSetupDialog";
import { FindReplace } from "./FindReplace";
import { WordCountDialog, ShortcutsDialog, AboutDialog } from "./InfoDialogs";
import { buildExtensions } from "@/lib/editorExtensions";
import { localDocumentStore } from "@/lib/store";
import { ACCEPTED_IMPORT_TYPES, importFile } from "@/lib/import";
import {
  exportDocx,
  exportHtml,
  exportMarkdown,
  exportPdf,
  exportText,
  type ExportFormat,
} from "@/lib/export";
import {
  clampZoom,
  loadPageSettings,
  resolvePageSize,
  savePageSettings,
  ZOOM_STEP,
  DPI,
  type PageSettings,
} from "@/lib/pageSettings";
import { AUTOSAVE_DELAY_MS } from "@/lib/constants";
import type { AiActionId } from "@/lib/ai";
import type { DocumentRecord, SaveState } from "@/lib/types";
import { cn } from "@/lib/cn";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export function DocumentEditor({ initialDoc }: { initialDoc: DocumentRecord }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialDoc.title);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPending, setAiPending] = useState<AiActionId | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // View / page settings (persisted per document, separate from content).
  const [pageSettings, setPageSettings] = useState<PageSettings>(() =>
    loadPageSettings(initialDoc.id),
  );

  // Dialog visibility.
  const [pageSetupOpen, setPageSetupOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [wordCountOpen, setWordCountOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: initialDoc.content,
    editorProps: {
      attributes: {
        class: "ProseMirror focus:outline-none",
        spellcheck: "true",
      },
    },
    immediatelyRender: false,
    onUpdate: () => scheduleSave(),
  });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  }, []);

  /** Persist the current title + content to the store. */
  const save = useCallback(async () => {
    if (!editor) return;
    setSaveState("saving");
    try {
      await localDocumentStore.update(initialDoc.id, {
        title: title.trim() || "Untitled document",
        content: editor.getHTML(),
      });
      setSaveState("saved");
    } catch (err) {
      console.error(err);
      setSaveState("error");
      showToast(
        err instanceof Error ? err.message : "Couldn't save your document.",
      );
    }
  }, [editor, initialDoc.id, title, showToast]);

  /** Debounced autosave triggered on edits. */
  const scheduleSave = useCallback(() => {
    setSaveState("unsaved");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
  }, [save]);

  // Re-run autosave scheduling when the title changes.
  useEffect(() => {
    if (title !== initialDoc.title) scheduleSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Save once on unmount to capture any pending changes.
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // ---- View settings ------------------------------------------------------

  const updateSettings = useCallback(
    (patch: Partial<PageSettings>) => {
      setPageSettings((prev) => {
        const next = { ...prev, ...patch };
        savePageSettings(initialDoc.id, next);
        return next;
      });
    },
    [initialDoc.id],
  );

  const setZoom = useCallback(
    (z: number) => updateSettings({ zoom: clampZoom(z) }),
    [updateSettings],
  );

  // ---- File actions -------------------------------------------------------

  const handleNew = useCallback(async () => {
    await save();
    const doc = await localDocumentStore.create();
    router.push(`/editor/${doc.id}`);
  }, [save, router]);

  const handleOpen = useCallback(() => fileInputRef.current?.click(), []);

  const handleSaveAs = useCallback(async () => {
    await save();
    const copy = await localDocumentStore.duplicate(initialDoc.id);
    showToast("Saved as a copy");
    router.push(`/editor/${copy.id}`);
  }, [save, initialDoc.id, router, showToast]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      showToast("Importing…");
      const { title: importedTitle, html } = await importFile(file);
      const doc = await localDocumentStore.create({
        title: importedTitle,
        content: html,
      });
      router.push(`/editor/${doc.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Import failed.");
    }
  };

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      if (!editor) return;
      const html = editor.getHTML();
      const name = title.trim() || "Untitled document";
      try {
        showToast(`Exporting ${format.toUpperCase()}…`);
        switch (format) {
          case "pdf":
            await exportPdf(name, html);
            break;
          case "docx":
            await exportDocx(name, html);
            break;
          case "md":
            await exportMarkdown(name, html);
            break;
          case "txt":
            await exportText(name, html);
            break;
          case "html":
            await exportHtml(name, html);
            break;
        }
      } catch (err) {
        console.error(err);
        showToast(
          err instanceof Error ? err.message : `Could not export ${format}.`,
        );
      }
    },
    [editor, title, showToast],
  );

  // ---- Insert actions -----------------------------------------------------

  const handleInsertImage = useCallback(() => imageInputRef.current?.click(), []);

  const onImagePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast("That image is too large (max 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      editor.chain().focus().setImage({ src }).run();
    };
    reader.onerror = () => showToast("Couldn't read that image.");
    reader.readAsDataURL(file);
  };

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const prev = (editor.getAttributes("link").href as string) || "https://";
    const url = window.prompt("Enter a URL", prev);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const normalized = /^https?:\/\//i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalized })
      .run();
  }, [editor]);

  // ---- Fullscreen ---------------------------------------------------------

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setFullscreen((v) => !v);
    }
  }, []);

  // ---- AI -----------------------------------------------------------------

  const openAi = useCallback((action?: AiActionId) => {
    setAiOpen(true);
    if (action) setAiPending(action);
  }, []);

  // ---- Keyboard shortcuts -------------------------------------------------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        void save();
        showToast("Document saved");
      } else if (key === "f") {
        e.preventDefault();
        setFindOpen(true);
      } else if (key === "k") {
        e.preventDefault();
        handleInsertLink();
      } else if (key === "=" || e.key === "+") {
        e.preventDefault();
        setZoom(pageSettings.zoom + ZOOM_STEP);
      } else if (key === "-") {
        e.preventDefault();
        setZoom(pageSettings.zoom - ZOOM_STEP);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, showToast, handleInsertLink, setZoom, pageSettings.zoom]);

  // ---- Derived layout values ---------------------------------------------

  const { widthIn } = resolvePageSize(pageSettings);
  const pageWidthPx = Math.round(widthIn * DPI);

  const menuHandlers: MenuBarHandlers = {
    onNew: handleNew,
    onOpen: handleOpen,
    onSave: () => {
      void save();
      showToast("Document saved");
    },
    onSaveAs: handleSaveAs,
    onPrint: handlePrint,
    onExport: handleExport,
    showRuler: pageSettings.showRuler,
    onToggleRuler: (show) => updateSettings({ showRuler: show }),
    onZoomIn: () => setZoom(pageSettings.zoom + ZOOM_STEP),
    onZoomOut: () => setZoom(pageSettings.zoom - ZOOM_STEP),
    onResetZoom: () => setZoom(1),
    fullscreen,
    onToggleFullscreen: toggleFullscreen,
    onPageSetup: () => setPageSetupOpen(true),
    onInsertImage: handleInsertImage,
    onInsertLink: handleInsertLink,
    onWordCount: () => setWordCountOpen(true),
    onFindReplace: () => setFindOpen(true),
    onOpenAi: openAi,
    onShortcuts: () => setShortcutsOpen(true),
    onAbout: () => setAboutOpen(true),
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-screen flex-col bg-ink-50 dark:bg-night-base",
        fullscreen && "bg-white dark:bg-night-base",
      )}
    >
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-30 border-b border-ink-200 bg-white/90 backdrop-blur transition-all dark:border-night-border dark:bg-night-surface/90",
          aiOpen && "lg:pr-80",
        )}
      >
        {/* Row 1 — title + primary controls */}
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <Link
            href="/"
            onClick={() => void save()}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-night-hover dark:hover:text-ink-50"
            aria-label="Back to documents"
            title="Back to documents"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="hidden sm:block">
            <Logo showWordmark={false} />
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => void save()}
              placeholder="Untitled document"
              aria-label="Document title"
              className="min-w-0 max-w-xs flex-1 truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-ink-950 outline-none transition hover:border-ink-200 focus:border-nopal-400 focus:bg-white dark:text-ink-50 dark:hover:border-night-border dark:focus:bg-night-input sm:text-base"
            />
            <SaveIndicator state={saveState} />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={toggleFullscreen}
              className="hidden h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-night-hover dark:hover:text-ink-50 sm:grid"
              title={fullscreen ? "Exit full screen" : "Full screen"}
              aria-label={fullscreen ? "Exit full screen" : "Full screen"}
            >
              {fullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={() => (aiOpen ? setAiOpen(false) : openAi())}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
                aiOpen
                  ? "bg-nopal-600 text-white hover:bg-nopal-700"
                  : "bg-nopal-50 text-nopal-700 hover:bg-nopal-100 dark:bg-nopal-500/15 dark:text-nopal-300 dark:hover:bg-nopal-500/25",
              )}
              title="Toggle AI assistant"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </div>
        </div>

        {/* Row 2 — menu bar (desktop) */}
        {editor && (
          <div className="hidden items-center justify-between border-t border-ink-100 px-3 py-1 dark:border-night-border sm:flex">
            <MenuBar editor={editor} handlers={menuHandlers} />
            <ZoomControl
              zoom={pageSettings.zoom}
              onIn={() => setZoom(pageSettings.zoom + ZOOM_STEP)}
              onOut={() => setZoom(pageSettings.zoom - ZOOM_STEP)}
              onReset={() => setZoom(1)}
            />
          </div>
        )}

        {/* Toolbar (desktop) */}
        <div className="hidden border-t border-ink-100 bg-white dark:border-night-border dark:bg-night-surface sm:block">
          {editor ? <Toolbar editor={editor} /> : <div className="h-11" />}
        </div>
      </header>

      {/* Page area */}
      <main
        className={cn(
          "flex-1 overflow-auto px-3 py-6 pb-24 transition-all sm:px-6 sm:py-10 sm:pb-10",
          aiOpen && "lg:pr-80",
        )}
      >
        <div
          className="page-zoom mx-auto max-w-full"
          style={{ width: pageWidthPx, zoom: pageSettings.zoom }}
        >
          {pageSettings.showRuler && (
            <div className="hidden sm:block">
              <Ruler widthIn={widthIn} />
            </div>
          )}
          <div className="print-page min-h-[60vh] rounded-xl bg-white px-6 py-10 shadow-page dark:bg-night-surface dark:shadow-black/30 sm:px-16 sm:py-16">
            <EditorContent editor={editor} />
          </div>
        </div>
        <p className="no-print mt-3 text-center text-xs text-ink-300 dark:text-ink-600">
          Changes are saved automatically to this device.
        </p>
      </main>

      {/* Mobile bottom toolbar */}
      {editor && (
        <MobileToolbar
          editor={editor}
          onOpenAi={() => openAi()}
          onInsertImage={handleInsertImage}
          onInsertLink={handleInsertLink}
        />
      )}

      {/* AI panel */}
      <AiPanel
        editor={editor}
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        pendingAction={aiPending}
        onPendingHandled={() => setAiPending(null)}
      />

      {/* Backdrop for AI panel on small screens */}
      {aiOpen && (
        <button
          className="fixed inset-0 z-40 bg-ink-950/20 lg:hidden"
          onClick={() => setAiOpen(false)}
          aria-label="Close AI panel"
        />
      )}

      {/* Find & replace */}
      {editor && (
        <FindReplace editor={editor} open={findOpen} onClose={() => setFindOpen(false)} />
      )}

      {/* Dialogs */}
      <PageSetupDialog
        open={pageSetupOpen}
        settings={pageSettings}
        onClose={() => setPageSetupOpen(false)}
        onApply={(next) => {
          savePageSettings(initialDoc.id, next);
          setPageSettings(next);
        }}
      />
      <WordCountDialog editor={editor} open={wordCountOpen} onClose={() => setWordCountOpen(false)} />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMPORT_TYPES}
        className="hidden"
        onChange={handleImport}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onImagePicked}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-[70] -translate-x-1/2 animate-fade-in rounded-full bg-ink-950 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-night-raised dark:ring-1 dark:ring-night-border sm:bottom-5">
          {toast}
        </div>
      )}
    </div>
  );
}

function ZoomControl({
  zoom,
  onIn,
  onOut,
  onReset,
}: {
  zoom: number;
  onIn: () => void;
  onOut: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={onOut}
        className="grid h-7 w-7 place-items-center rounded-md text-ink-500 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-night-hover"
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
      <button
        onClick={onReset}
        className="min-w-[3rem] rounded-md px-1.5 py-1 text-xs font-medium text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-night-hover"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={onIn}
        className="grid h-7 w-7 place-items-center rounded-md text-ink-500 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-night-hover"
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const map = {
    saved: {
      icon: <Check className="h-3.5 w-3.5" />,
      label: "Saved",
      className: "text-nopal-600 dark:text-nopal-400",
    },
    saving: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Saving…",
      className: "text-ink-400",
    },
    unsaved: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Saving…",
      className: "text-ink-400",
    },
    error: {
      icon: <CloudOff className="h-3.5 w-3.5" />,
      label: "Not saved",
      className: "text-rose-500",
    },
  }[state];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium",
        map.className,
      )}
      title={map.label}
    >
      {map.icon}
      <span className="hidden sm:inline">{map.label}</span>
    </span>
  );
}
