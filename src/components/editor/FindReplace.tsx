"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface Match {
  from: number;
  to: number;
}

/** Build a flat [char, docPosition] index of the document's text. */
function buildIndex(editor: Editor): { ch: string; pos: number }[] {
  const chars: { ch: string; pos: number }[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.isText && node.text) {
      for (let i = 0; i < node.text.length; i++) {
        chars.push({ ch: node.text[i], pos: pos + i });
      }
    }
    return true;
  });
  return chars;
}

/** Find all contiguous matches for `query`, respecting block boundaries. */
function findMatches(editor: Editor, query: string, matchCase: boolean): Match[] {
  if (!query) return [];
  const chars = buildIndex(editor);
  const haystack = chars.map((c) => c.ch).join("");
  const hay = matchCase ? haystack : haystack.toLowerCase();
  const needle = matchCase ? query : query.toLowerCase();
  const matches: Match[] = [];
  let from = 0;
  while (true) {
    const idx = hay.indexOf(needle, from);
    if (idx === -1) break;
    // Only accept matches whose characters are contiguous in the document
    // (i.e. don't span a block boundary), so replacement stays correct.
    let contiguous = true;
    for (let j = 1; j < needle.length; j++) {
      if (chars[idx + j].pos !== chars[idx].pos + j) {
        contiguous = false;
        break;
      }
    }
    if (contiguous) {
      matches.push({
        from: chars[idx].pos,
        to: chars[idx].pos + needle.length,
      });
    }
    from = idx + Math.max(1, needle.length);
  }
  return matches;
}

/**
 * A compact, Word-style Find & Replace panel docked to the top-right of the
 * editor. Supports next/previous navigation, case sensitivity, replace, and
 * replace-all over the real document positions.
 */
export function FindReplace({
  editor,
  open,
  onClose,
}: {
  editor: Editor;
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [current, setCurrent] = useState(0);
  // Recompute matches whenever the query, options, or doc version change.
  const [docVersion, setDocVersion] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onUpdate = () => setDocVersion((v) => v + 1);
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor, open]);

  const matches = useMemo(
    () => findMatches(editor, query, matchCase),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, query, matchCase, docVersion],
  );

  const select = useCallback(
    (i: number) => {
      const m = matches[i];
      if (!m) return;
      editor.chain().setTextSelection({ from: m.from, to: m.to }).scrollIntoView().run();
    },
    [editor, matches],
  );

  useEffect(() => {
    setCurrent(0);
    if (matches.length > 0 && query) select(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, matchCase]);

  if (!open) return null;

  const go = (dir: 1 | -1) => {
    if (matches.length === 0) return;
    const next = (current + dir + matches.length) % matches.length;
    setCurrent(next);
    select(next);
  };

  const replaceOne = () => {
    const m = matches[current];
    if (!m) return;
    editor
      .chain()
      .focus()
      .insertContentAt({ from: m.from, to: m.to }, replacement)
      .run();
  };

  const replaceAll = () => {
    if (matches.length === 0) return;
    const tr = editor.state.tr;
    // Apply from last to first so earlier positions stay valid.
    [...matches].reverse().forEach((m) => {
      tr.insertText(replacement, m.from, m.to);
    });
    editor.view.dispatch(tr);
  };

  return (
    <div className="fixed right-4 top-28 z-40 w-80 max-w-[92vw] animate-fade-in rounded-xl border border-ink-200 bg-white p-3 shadow-xl dark:border-night-border dark:bg-night-raised dark:shadow-black/40">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
          Find &amp; replace
        </span>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-night-hover"
          aria-label="Close find and replace"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(e.shiftKey ? -1 : 1);
            if (e.key === "Escape") onClose();
          }}
          placeholder="Find"
          className="min-w-0 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
        />
        <span className="w-16 shrink-0 text-center text-xs tabular-nums text-ink-400 dark:text-ink-500">
          {matches.length ? `${current + 1}/${matches.length}` : "0/0"}
        </span>
        <button
          onClick={() => go(-1)}
          disabled={!matches.length}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-night-hover"
          aria-label="Previous match"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={!matches.length}
          className="grid h-8 w-8 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-night-hover"
          aria-label="Next match"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <input
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        placeholder="Replace with"
        className="mt-2 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
      />

      <div className="mt-2 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
          <input
            type="checkbox"
            checked={matchCase}
            onChange={(e) => setMatchCase(e.target.checked)}
            className="h-3.5 w-3.5 accent-nopal-600"
          />
          Match case
        </label>
        <div className="flex gap-1.5">
          <button
            onClick={replaceOne}
            disabled={!matches.length}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-ink-100 disabled:opacity-40 dark:text-ink-200 dark:hover:bg-night-hover"
          >
            Replace
          </button>
          <button
            onClick={replaceAll}
            disabled={!matches.length}
            className="rounded-lg bg-nopal-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-nopal-700 disabled:opacity-40"
          >
            Replace all
          </button>
        </div>
      </div>
    </div>
  );
}
