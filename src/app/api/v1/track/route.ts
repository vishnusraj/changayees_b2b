import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { trackSchema } from '@/lib/validation/track';
import { verifyByIdAndPhone } from '@/features/tracking/tracking.service';

/**
 * POST /api/v1/track — verify Order ID + phone, return the tracking token.
 * Returns a single generic 404 on any mismatch (no enumeration of valid IDs).
 * TODO(security): add rate limiting before launch (M-10).
 */
export const POST = withApi(async (req: NextRequest) => {
  const body = trackSchema.parse(await readJson(req));
  const result = await verifyByIdAndPhone(body.trackingId, body.phone);
  if (!result) {
    throw ApiError.notFound(
      'We couldn’t find an order matching those details.',
    );
  }
  return ok({ trackingToken: result.trackingToken });
});
