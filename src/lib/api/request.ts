import type { NextRequest } from 'next/server';

/** Best-effort client metadata for session auditing. */
export function getRequestMeta(req: NextRequest): {
  userAgent: string | null;
  ip: string | null;
} {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() ?? null;
  return {
    userAgent: req.headers.get('user-agent'),
    ip,
  };
}

/** Parse a JSON body, throwing a clean error on malformed input. */
export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
