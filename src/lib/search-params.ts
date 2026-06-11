/** Helpers for reading Next.js searchParams (string | string[] | undefined). */

export function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parse a comma-separated multi-value param into a clean array. */
export function listParam(value: string | string[] | undefined): string[] {
  const first = firstParam(value);
  return first ? first.split(',').filter(Boolean) : [];
}

export function intParam(
  value: string | string[] | undefined,
  fallback: number,
): number {
  const n = Number(firstParam(value));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
