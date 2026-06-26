/** App-wide constants and shared option lists used by the toolbar. */

export const APP_NAME = "Nopal AI Docs";

/**
 * Font families offered in the toolbar font picker.
 *
 * `web` marks families loaded from Google Fonts (see `layout.tsx`); the rest
 * are common system fonts. The `value` is a full CSS font stack so text always
 * renders with a sensible fallback. Grouped for a premium, organized menu.
 */
export interface FontOption {
  label: string;
  value: string;
  /** Optional grouping label shown as a section header in the picker. */
  group?: string;
}

export const FONT_FAMILIES: FontOption[] = [
  // Editor defaults
  { label: "Sans Serif", value: "Inter, system-ui, sans-serif", group: "Default" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif", group: "Default" },
  { label: "Mono", value: "'JetBrains Mono', 'Courier New', monospace", group: "Default" },

  // Popular web fonts (loaded via Google Fonts)
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

  // System sans serif
  { label: "Arial", value: "Arial, Helvetica, sans-serif", group: "System Sans" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif", group: "System Sans" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif", group: "System Sans" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Tahoma, sans-serif", group: "System Sans" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif", group: "System Sans" },

  // Serif (web + system)
  { label: "Merriweather", value: "Merriweather, Georgia, serif", group: "Serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif", group: "Serif" },
  { label: "Lora", value: "Lora, Georgia, serif", group: "Serif" },
  { label: "PT Serif", value: "'PT Serif', Georgia, serif", group: "Serif" },
  { label: "EB Garamond", value: "'EB Garamond', Garamond, serif", group: "Serif" },
  { label: "Garamond", value: "Garamond, 'Times New Roman', serif", group: "Serif" },
  { label: "Georgia", value: "Georgia, serif", group: "Serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif", group: "Serif" },

  // Monospace
  { label: "JetBrains Mono", value: "'JetBrains Mono', 'Courier New', monospace", group: "Monospace" },
  { label: "Courier New", value: "'Courier New', Courier, monospace", group: "Monospace" },
];

/** Font sizes (in px) offered in the toolbar size picker. */
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96,
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

/** Line-height presets for the spacing menu. */
export const LINE_SPACINGS = [
  { label: "Single", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" },
];

export const STORAGE_KEY = "nopal-ai-docs:documents:v1";
export const AUTOSAVE_DELAY_MS = 800;
