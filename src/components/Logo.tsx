import { cn } from "@/lib/cn";

/**
 * Nopal AI wordmark + cactus glyph. Original artwork — not derived from any
 * existing product's branding.
 */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-nopal-500 to-nopal-700 shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Stylized saguaro-cactus glyph — central stem with two arms */}
          <path d="M12 21V7" />
          <path d="M12 14H9.2a2.2 2.2 0 0 1-2.2-2.2V10" />
          <path d="M12 12h2.8A2.2 2.2 0 0 0 17 9.8V8" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-ink-950">
          Nopal<span className="text-nopal-600"> AI</span>
        </span>
      )}
    </span>
  );
}
