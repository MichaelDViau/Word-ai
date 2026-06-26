"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  PAGE_SIZES,
  type PageSettings,
  type PageSizeId,
} from "@/lib/pageSettings";
import { cn } from "@/lib/cn";

const PRESETS: { id: PageSizeId; label: string; hint: string }[] = [
  { id: "letter", label: "Letter", hint: PAGE_SIZES.letter.hint },
  { id: "legal", label: "Legal", hint: PAGE_SIZES.legal.hint },
  { id: "a4", label: "A4", hint: PAGE_SIZES.a4.hint },
  { id: "custom", label: "Custom", hint: "Set your own" },
];

/** Dialog for choosing the page size (Letter / Legal / A4 / Custom). */
export function PageSetupDialog({
  open,
  settings,
  onClose,
  onApply,
}: {
  open: boolean;
  settings: PageSettings;
  onClose: () => void;
  onApply: (next: PageSettings) => void;
}) {
  const [sizeId, setSizeId] = useState<PageSizeId>(settings.sizeId);
  const [w, setW] = useState(String(settings.customWidthIn));
  const [h, setH] = useState(String(settings.customHeightIn));

  // Reset local state whenever the dialog (re)opens.
  useEffect(() => {
    if (open) {
      setSizeId(settings.sizeId);
      setW(String(settings.customWidthIn));
      setH(String(settings.customHeightIn));
    }
  }, [open, settings]);

  const apply = () => {
    const customWidthIn = Math.min(48, Math.max(1, parseFloat(w) || 8.5));
    const customHeightIn = Math.min(48, Math.max(1, parseFloat(h) || 11));
    onApply({ ...settings, sizeId, customWidthIn, customHeightIn });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Page layout & size">
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSizeId(p.id)}
            className={cn(
              "flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition",
              sizeId === p.id
                ? "border-nopal-400 bg-nopal-50 dark:border-nopal-500 dark:bg-nopal-500/15"
                : "border-ink-200 hover:border-ink-300 dark:border-night-border dark:hover:border-night-hover",
            )}
          >
            <span className="text-sm font-medium text-ink-900 dark:text-ink-100">
              {p.label}
            </span>
            <span className="text-xs text-ink-400 dark:text-ink-500">{p.hint}</span>
          </button>
        ))}
      </div>

      {sizeId === "custom" && (
        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1 text-xs font-medium text-ink-500 dark:text-ink-400">
            Width (in)
            <input
              type="number"
              min={1}
              max={48}
              step={0.1}
              value={w}
              onChange={(e) => setW(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
            />
          </label>
          <span className="pb-2 text-ink-400">×</span>
          <label className="flex-1 text-xs font-medium text-ink-500 dark:text-ink-400">
            Height (in)
            <input
              type="number"
              min={1}
              max={48}
              step={0.1}
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-sm text-ink-900 outline-none focus:border-nopal-400 dark:border-night-border dark:bg-night-input dark:text-ink-100"
            />
          </label>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-night-hover"
        >
          Cancel
        </button>
        <button
          onClick={apply}
          className="rounded-lg bg-nopal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-nopal-700"
        >
          Apply
        </button>
      </div>
    </Modal>
  );
}
