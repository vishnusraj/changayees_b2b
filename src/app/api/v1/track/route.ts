import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { trackSchema } from '@/lib/validation/track';
import { verifyByIdAndPhone } from '@/features/tracking/tracking.service';
import { rateLimit, clientIp } from '@/lib/rate-limit';

/**
 * POST /api/v1/track — verify Order ID + phone, return the tracking token.
 * Returns a single generic 404 on any mismatch (no enumeration of valid IDs).
 * Rate-limited to deter brute-forcing tracking IDs.
 */
export const POST = withApi(async (req: NextRequest) => {
  if (!rateLimit(`track:${clientIp(req)}`, 10, 60_000)) {
    throw ApiError.rateLimited('Too many attempts. Please try again shortly.');
  }
  const body = trackSchema.parse(await readJson(req));
  const result = await verifyByIdAndPhone(body.trackingId, body.phone);
  if (!result) {
    throw ApiError.notFound(
      'We couldn’t find an order matching those details.',
    );
  }
  return ok({ trackingToken: result.trackingToken });
});
