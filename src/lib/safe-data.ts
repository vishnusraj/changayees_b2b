/**
 * Resilient data reads for public pages.
 *
 * Public pages are `force-dynamic` and read from the database on every request.
 * If a read fails (DB unreachable, not yet migrated, transient error), the page
 * should degrade to an empty state — never crash with a 500. Wrap each read in
 * `safe(...)` with a sensible fallback.
 *
 * Admin/API code does NOT use this — there, errors should surface.
 */
export async function safe<T>(
  query: Promise<T>,
  fallback: T,
  label?: string,
): Promise<T> {
  try {
    return await query;
  } catch (err) {
    console.error(`[safe-data]${label ? ` ${label}` : ''} read failed:`, err);
    return fallback;
  }
}
