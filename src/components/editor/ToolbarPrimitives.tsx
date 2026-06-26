"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** A single icon toggle/action button in the toolbar. */
export function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-ink-600 transition dark:text-ink-300",
        "hover:bg-ink-100 hover:text-ink-900 dark:hover:bg-night-hover dark:hover:text-ink-50",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
        active &&
          "bg-nopal-100 text-nopal-700 hover:bg-nopal-100 dark:bg-nopal-500/20 dark:text-nopal-300 dark:hover:bg-nopal-500/20",
      )}
    >
      {children}
    </button>
  );
}

/** Thin vertical separator between toolbar groups. */
export function ToolbarDivider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-ink-200 dark:bg-night-border" />;
}

/**
 * Generic dropdown wrapper used by the font, size, color and other menus.
 * Closes on outside-click and Escape.
 */
export function Dropdown({
  trigger,
  children,
  width = "w-48",
  align = "left",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  width?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((v) => !v) })}
      {open && (
        <div
          className={cn(
            "absolute top-10 z-40 animate-fade-in rounded-xl border border-ink-200 bg-white p-1.5 shadow-lg dark:border-night-border dark:bg-night-raised dark:shadow-black/40",
            width,
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

/** A pill-style dropdown trigger showing a text label (font / size / style). */
export function DropdownTrigger({
  open,
  toggle,
  label,
  title,
  className,
}: {
  open: boolean;
  toggle: () => void;
  label: string;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={toggle}
      title={title}
      aria-label={title}
      aria-expanded={open}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-night-hover",
        open && "bg-ink-100 dark:bg-night-hover",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-400" />
    </button>
  );
}

/** A simple selectable row inside a dropdown. */
export function DropdownItem({
  onClick,
  active,
  children,
  style,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={style}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm text-ink-700 transition hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-night-hover",
        active &&
          "bg-nopal-50 text-nopal-700 dark:bg-nopal-500/15 dark:text-nopal-300",
      )}
    >
      {children}
    </button>
  );
}
