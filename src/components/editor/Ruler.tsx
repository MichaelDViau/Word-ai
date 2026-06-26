"use client";

/**
 * A horizontal ruler reminiscent of Google Docs / Word. It fills the width of
 * the page it sits above and draws inch markings using percentages, so it stays
 * perfectly aligned with the sheet at any page size or zoom level (zoom is
 * applied to the shared parent).
 */
export function Ruler({
  widthIn,
  marginIn = 1,
}: {
  widthIn: number;
  /** The page's left/right margin in inches (the shaded zones). */
  marginIn?: number;
}) {
  const wholeInches = Math.floor(widthIn);
  const pct = (inch: number) => `${(inch / widthIn) * 100}%`;

  return (
    <div
      className="relative mb-2 h-6 w-full select-none overflow-hidden rounded-md border border-ink-200 bg-white text-ink-400 dark:border-night-border dark:bg-night-surface dark:text-ink-500"
      aria-hidden="true"
    >
      {/* Margin zones (left & right) */}
      <div
        className="absolute inset-y-0 left-0 bg-ink-100/70 dark:bg-night-base/60"
        style={{ width: pct(marginIn) }}
      />
      <div
        className="absolute inset-y-0 right-0 bg-ink-100/70 dark:bg-night-base/60"
        style={{ width: pct(marginIn) }}
      />

      {/* Inch ticks + numbers */}
      {Array.from({ length: wholeInches + 1 }).map((_, inch) => (
        <span
          key={`i${inch}`}
          className="absolute top-0 inset-y-0"
          style={{ left: pct(inch) }}
        >
          <span className="absolute top-0 h-2 w-px bg-ink-300 dark:bg-night-border" />
          {inch > 0 && inch < widthIn && (
            <span className="absolute top-2 -translate-x-1/2 text-[9px] font-medium leading-none">
              {inch}
            </span>
          )}
        </span>
      ))}

      {/* Half-inch ticks */}
      {Array.from({ length: wholeInches + 1 }).map((_, inch) =>
        inch + 0.5 < widthIn ? (
          <span
            key={`h${inch}`}
            className="absolute top-0 h-1.5 w-px bg-ink-200 dark:bg-night-border"
            style={{ left: pct(inch + 0.5) }}
          />
        ) : null,
      )}
    </div>
  );
}
