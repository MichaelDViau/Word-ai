/** App-wide constants and shared option lists used by the toolbar. */

export const APP_NAME = "Nopal AI Docs";

/** Font families offered in the toolbar font picker. */
export const FONT_FAMILIES: { label: string; value: string }[] = [
  { label: "Sans Serif", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'JetBrains Mono', 'Courier New', monospace" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Courier", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
];

/** Font sizes (in px) offered in the toolbar size picker. */
export const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

/** Preset text colors for the color picker. */
export const TEXT_COLORS = [
  "#1d222b", "#4d5a71", "#62718a", "#e11d48", "#ea580c",
  "#d97706", "#16834c", "#0891b2", "#2563eb", "#7c3aed",
];

/** Preset highlight colors. */
export const HIGHLIGHT_COLORS = [
  "#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#fed7aa",
  "#e9d5ff", "#fecaca", "#d9f99d", "#a5f3fc", "#ffffff",
];

/** Line-height presets for the spacing menu. */
export const LINE_SPACINGS = [
  { label: "Single", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" },
];

export const STORAGE_KEY = "nopal-ai-docs:documents:v1";
export const AUTOSAVE_DELAY_MS = 800;
