import { NextResponse, type NextRequest } from 'next/server';
import { readJson } from '@/lib/api/request';
import { track, PUBLIC_TRACKABLE } from '@/services/analytics.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/analytics/track — public beacon for client-side events
 * (product views, WhatsApp clicks). Whitelisted events only; always 204.
 * TODO(security): rate-limit before launch (M-10).
 */
export async function POST(req: NextRequest) {
  try {
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
