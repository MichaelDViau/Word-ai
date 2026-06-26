"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Light/dark theme toggle. Shows a moon in light mode (tap to go dark) and a
 * sun in dark mode (tap to go light). Renders a stable placeholder until mounted
 * to avoid a hydration mismatch on the icon.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";
  const label = isDark ? t("theme.toLight") : t("theme.toDark");

  return (
    <button
      onClick={toggle}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-night-hover dark:hover:text-ink-50",
        className,
      )}
    >
      {!mounted ? (
        <Moon className="h-5 w-5 opacity-0" />
      ) : isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
