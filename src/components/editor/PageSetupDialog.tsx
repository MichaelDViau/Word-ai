"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  PAGE_SIZES,
  type PageSettings,
  type PageSizeId,
} from "@/lib/pageSettings";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const PRESETS: { id: PageSizeId; labelKey: string; hint: string }[] = [
  { id: "letter", labelKey: "page.letter", hint: PAGE_SIZES.letter.hint },
  { id: "legal", labelKey: "page.legal", hint: PAGE_SIZES.legal.hint },
  { id: "a4", labelKey: "page.a4", hint: PAGE_SIZES.a4.hint },
  { id: "custom", labelKey: "page.custom", hint: "page.setYourOwn" },
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
  const { t } = useI18n();
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
    <Modal open={open} onClose={onClose} title={t("page.title")}>
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
              {t(p.labelKey)}
            </span>
            <span className="text-xs text-ink-400 dark:text-ink-500">
              {p.id === "custom" ? t(p.hint) : p.hint}
            </span>
          </button>
        ))}
      </div>

      {sizeId === "custom" && (
        <div className="mt-4 flex items-end gap-3">
          <label className="flex-1 text-xs font-medium text-ink-500 dark:text-ink-400">
            {t("page.width")}
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
            {t("page.height")}
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
          {t("common.cancel")}
        </button>
        <button
          onClick={apply}
          className="rounded-lg bg-nopal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-nopal-700"
        >
          {t("common.apply")}
        </button>
      </div>
    </Modal>
  );
}
