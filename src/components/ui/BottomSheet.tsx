"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

/**
 * A clean, Apple-style slide-up bottom sheet for mobile. Used to hold advanced
 * tools so the primary mobile surface stays uncluttered. Closes on backdrop tap
 * and Escape; locks body scroll while open.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] sm:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-ink-950/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-300 ease-out dark:border-night-border dark:bg-night-raised",
          open ? "translate-y-0" : "translate-y-full",
          className,
        )}
      >
        {/* Grab handle */}
        <div className="sticky top-0 z-10 flex flex-col items-center gap-2 bg-white/95 pt-3 backdrop-blur dark:bg-night-raised/95">
          <span className="h-1.5 w-10 rounded-full bg-ink-200 dark:bg-night-border" />
          {title && (
            <h2 className="pb-2 text-sm font-semibold text-ink-950 dark:text-ink-100">
              {title}
            </h2>
          )}
        </div>
        <div className="px-4 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}
