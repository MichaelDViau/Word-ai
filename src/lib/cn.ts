/**
 * Tiny classNames helper — joins truthy class fragments with a space.
 * Kept dependency-free on purpose so the bundle stays lean.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
