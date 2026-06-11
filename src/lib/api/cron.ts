import { type NextRequest } from 'next/server';
import { ApiError } from './errors';

/**
 * Authorize a cron/internal request. Vercel Cron sends
 * `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is configured.
 * In development with no secret set, requests are allowed for local testing.
 */
export function requireCron(req: NextRequest): void {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization');
  const provided =
    header?.replace(/^Bearer\s+/i, '') ?? req.headers.get('x-cron-secret');

  if (secret) {
    if (provided !== secret) {
      throw ApiError.unauthorized('Invalid cron secret');
    }
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw ApiError.unauthorized('Cron secret not configured');
  }
}
