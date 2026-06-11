import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';
import { resolveByToken } from '@/features/tracking/tracking.service';

/** GET /api/v1/track/{token} — public tracking view by opaque token. */
export const GET = withApiParams<{ token: string }>(async (_req, { token }) => {
  const view = await resolveByToken(token);
  if (!view) throw ApiError.notFound('This tracking link is invalid or expired.');
  return ok(view);
});
