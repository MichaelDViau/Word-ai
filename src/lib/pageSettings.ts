/**
 * Per-document view settings: page size, ruler visibility, and zoom.
 *
 * These are presentation preferences, not document content, so they live in
 * their own localStorage namespace keyed by document id. This keeps the
 * existing document schema and saving system completely untouched.
 */

export type PageSizeId = "letter" | "legal" | "a4" | "custom";

export interface PageSize {
  id: PageSizeId;
  label: string;
  /** Printable page dimensions in inches (used for on-screen sizing at 96dpi). */
  widthIn: number;
  heightIn: number;
  /** Human-readable dimension hint for menus. */
  hint: string;
}

/** Standard page sizes. A4 is converted from mm (210 × 297mm). */
export const PAGE_SIZES: Record<Exclude<PageSizeId, "custom">, PageSize> = {
  letter: {
    id: "letter",
    label: "Letter",
    widthIn: 8.5,
    heightIn: 11,
    hint: "8.5 × 11 in",
  },
  legal: {
    id: "legal",
    label: "Legal",
    widthIn: 8.5,
    heightIn: 14,
    hint: "8.5 × 14 in",
  },
  a4: {
    id: "a4",
    label: "A4",
    widthIn: 210 / 25.4,
    heightIn: 297 / 25.4,
    hint: "210 × 297 mm",
  },
};

export const DPI = 96;

export interface PageSettings {
  sizeId: PageSizeId;
  /** Used when sizeId === "custom" (in inches). */
  customWidthIn: number;
  customHeightIn: number;
  showRuler: boolean;
  /** Zoom level as a fraction, e.g. 1 = 100%. */
  zoom: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  sizeId: "letter",
  customWidthIn: 8.5,
  customHeightIn: 11,
  showRuler: false,
  zoom: 1,
};

export const ZOOM_MIN = 0.5;
export const ZOOM_MAX = 2;
export const ZOOM_STEP = 0.1;

const keyFor = (docId: string) => `nopal-ai-docs:page-settings:${docId}`;

export function loadPageSettings(docId: string): PageSettings {
  if (typeof window === "undefined") return { ...DEFAULT_PAGE_SETTINGS };
  try {
    const raw = window.localStorage.getItem(keyFor(docId));
    if (!raw) return { ...DEFAULT_PAGE_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PAGE_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_PAGE_SETTINGS };
  }
}

export function savePageSettings(docId: string, settings: PageSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(docId), JSON.stringify(settings));
  } catch {
    /* ignore quota / disabled storage */
  }
}

/** Resolve the active page dimensions (in inches) from settings. */
export function resolvePageSize(settings: PageSettings): {
  widthIn: number;
  heightIn: number;
} {
  if (settings.sizeId === "custom") {
    return {
      widthIn: settings.customWidthIn,
      heightIn: settings.customHeightIn,
    };
  }
  const size = PAGE_SIZES[settings.sizeId];
  return { widthIn: size.widthIn, heightIn: size.heightIn };
}

export function clampZoom(zoom: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100));
}
