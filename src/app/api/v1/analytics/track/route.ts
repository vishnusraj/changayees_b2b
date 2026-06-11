import { NextResponse, type NextRequest } from 'next/server';
import { readJson } from '@/lib/api/request';
import { track, PUBLIC_TRACKABLE } from '@/services/analytics.service';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/analytics/track — public beacon for client-side events
 * (product views, WhatsApp clicks). Whitelisted events only; always 204.
 * Generously rate-limited; excess beacons are silently dropped (never error).
 */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`beacon:${clientIp(req)}`, 120, 60_000)) {
      return new NextResponse(null, { status: 204 });
    }
    const body = (await readJson(req)) as {
      event?: string;
      visitorId?: string;
      metadata?: Record<string, unknown>;
    };
    if (body.event && PUBLIC_TRACKABLE.has(body.event)) {
      await track(body.event, {
        eventType: 'engagement',
        userIdentifier: body.visitorId,
        metadata: body.metadata,
      });
    }
  } catch {
    // swallow — analytics is best-effort
  }
  return new NextResponse(null, { status: 204 });
}
