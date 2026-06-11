/**
 * Lightweight in-memory sliding-window rate limiter for public endpoints.
 *
 * NOTE (Vercel/serverless): in-memory state is per-instance, so this gives
 * best-effort burst protection only. For robust cross-instance limiting in
 * production, back this with Upstash Redis (@upstash/ratelimit) — the call sites
 * stay the same.
 */
const buckets = new Map<string, number[]>();
const MAX_KEYS = 10_000;

/** Returns true if the request is allowed; false if the limit is exceeded. */
export function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const hits = (buckets.get(identifier) ?? []).filter(
    (t) => now - t < windowMs,
  );

  if (hits.length >= limit) {
    buckets.set(identifier, hits);
    return false;
  }

  hits.push(now);
  buckets.set(identifier, hits);

  // Crude memory guard — drop the oldest keys if the map grows unbounded.
  if (buckets.size > MAX_KEYS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey) buckets.delete(firstKey);
  }
  return true;
}

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}
