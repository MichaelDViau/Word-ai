/** App-wide constants and shared option lists used by the toolbar. */

export const APP_NAME = "Nopal: Documentos";

/**
 * Font families offered in the toolbar font picker.
 *
 * `group` is a stable key translated via `fontgroup.{group}` in the UI. Every
 * `value` is a full CSS font stack (with sensible fallbacks) and is unique, so
 * it can safely be used as a React key and as a `<select>` option value.
 * Web families (Google Fonts) are loaded once in `layout.tsx`.
 */
export interface FontOption {
  label: string;
  value: string;
  /** Stable grouping key shown as a translated section header in the picker. */
  group?: string;
}

export const FONT_FAMILIES: FontOption[] = [
  // Editor defaults — generic families with broad system fallbacks.
  { label: "Sans Serif", value: "system-ui, -apple-system, 'Segoe UI', sans-serif", group: "Default" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif", group: "Default" },
  { label: "Mono", value: "ui-monospace, 'Courier New', monospace", group: "Default" },

  // Popular web sans-serif fonts (loaded via Google Fonts).
  { label: "Inter", value: "Inter, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Roboto", value: "Roboto, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Open Sans", value: "'Open Sans', system-ui, sans-serif", group: "Sans Serif" },
  { label: "Lato", value: "Lato, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Montserrat", value: "Montserrat, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Poppins", value: "Poppins, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Nunito", value: "Nunito, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Source Sans 3", value: "'Source Sans 3', system-ui, sans-serif", group: "Sans Serif" },
  { label: "Raleway", value: "Raleway, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Work Sans", value: "'Work Sans', system-ui, sans-serif", group: "Sans Serif" },
  { label: "DM Sans", value: "'DM Sans', system-ui, sans-serif", group: "Sans Serif" },
  { label: "Manrope", value: "Manrope, system-ui, sans-serif", group: "Sans Serif" },
  { label: "IBM Plex Sans", value: "'IBM Plex Sans', system-ui, sans-serif", group: "Sans Serif" },
  { label: "Rubik", value: "Rubik, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Karla", value: "Karla, system-ui, sans-serif", group: "Sans Serif" },
  { label: "Oswald", value: "Oswald, 'Arial Narrow', sans-serif", group: "Sans Serif" },

  // System sans serif (no download required).
  { label: "Arial", value: "Arial, Helvetica, sans-serif", group: "System Sans" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif", group: "System Sans" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif", group: "System Sans" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Tahoma, sans-serif", group: "System Sans" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif", group: "System Sans" },
  { label: "Calibri", value: "Calibri, Candara, Segoe, sans-serif", group: "System Sans" },

  // Serif (web + system).
  { label: "Merriweather", value: "Merriweather, Georgia, serif", group: "Serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif", group: "Serif" },
  { label: "Lora", value: "Lora, Georgia, serif", group: "Serif" },
  { label: "PT Serif", value: "'PT Serif', Georgia, serif", group: "Serif" },
  { label: "EB Garamond", value: "'EB Garamond', Garamond, serif", group: "Serif" },
  { label: "Source Serif 4", value: "'Source Serif 4', Georgia, serif", group: "Serif" },
  { label: "IBM Plex Serif", value: "'IBM Plex Serif', Georgia, serif", group: "Serif" },
  { label: "Libre Baskerville", value: "'Libre Baskerville', Georgia, serif", group: "Serif" },
  { label: "Bitter", value: "Bitter, Georgia, serif", group: "Serif" },
  { label: "Garamond", value: "Garamond, 'Times New Roman', serif", group: "Serif" },
  { label: "Georgia", value: "Georgia, serif", group: "Serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif", group: "Serif" },

  // Monospace.
  { label: "JetBrains Mono", value: "'JetBrains Mono', 'Courier New', monospace", group: "Monospace" },
  { label: "IBM Plex Mono", value: "'IBM Plex Mono', 'Courier New', monospace", group: "Monospace" },
  { label: "Source Code Pro", value: "'Source Code Pro', 'Courier New', monospace", group: "Monospace" },
  { label: "Courier New", value: "'Courier New', Courier, monospace", group: "Monospace" },
];

/** Font sizes (in px) offered in the toolbar size picker. */
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48, 54, 60,
  72, 80, 96,
];

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

/**
 * Line-height presets for the spacing menu. `tkey` (when present) is a
 * translation key; otherwise the literal `label` (a numeric ratio) is shown.
 */
export interface LineSpacingOption {
  tkey?: string;
  label: string;
  value: string;
}

export const LINE_SPACINGS: LineSpacingOption[] = [
  { tkey: "spacing.single", label: "Single", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { tkey: "spacing.double", label: "Double", value: "2" },
];

export const STORAGE_KEY = "nopal-ai-docs:documents:v1";
export const AUTOSAVE_DELAY_MS = 800;
