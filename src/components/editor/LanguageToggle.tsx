"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Language switcher shown next to the theme toggle. It always displays the
 * language you would switch *to*: "English" while the app is in Spanish, and
 * "Español" while the app is in English. Clicking it flips the whole app's
 * language instantly. Renders a stable placeholder until mounted to avoid a
 * hydration mismatch (the persisted locale is only known on the client).
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggle, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // When in Spanish, offer English; when in English, offer Spanish.
  const label = locale === "es" ? t("lang.toEnglish") : t("lang.toSpanish");
  const title = t("lang.toggleTitle");

  return (
    <button
      onClick={toggle}
      title={`${title} · ${label}`}
      aria-label={`${title} · ${label}`}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-night-hover dark:hover:text-ink-50 sm:px-2.5",
        className,
      )}
    >
      <Languages className="h-[18px] w-[18px] shrink-0" />
      {/* Full word on tablet/desktop; icon-only on phones to keep the header
          balanced (matches how other header actions hide their labels). */}
      <span className={cn("hidden sm:inline", !mounted && "opacity-0")}>
        {label}
      </span>
    </button>
  );
}
