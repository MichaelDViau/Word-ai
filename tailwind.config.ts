import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nopal AI brand palette — a fresh "nopal" (prickly pear cactus)
        // inspired green with a deep ink neutral and warm accent.
        nopal: {
          50: "#eefbf2",
          100: "#d6f5e0",
          200: "#b0e9c4",
          300: "#7dd6a2",
          400: "#46bd7c",
          500: "#22a35f",
          600: "#16834c",
          700: "#13683f",
          800: "#135334",
          900: "#11442d",
          950: "#062618",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d4d9e1",
          300: "#aeb7c6",
          400: "#8290a5",
          500: "#62718a",
          600: "#4d5a71",
          700: "#3f4a5c",
          800: "#37404e",
          900: "#313844",
          950: "#1d222b",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        page: "0 1px 3px rgba(16, 24, 40, 0.08), 0 12px 32px rgba(16, 24, 40, 0.06)",
        toolbar: "0 1px 2px rgba(16, 24, 40, 0.06)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
