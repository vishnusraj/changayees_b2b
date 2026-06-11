import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { requireCron } from '@/lib/api/cron';
import { processNotificationQueue } from '@/services/notification.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/v1/internal/notifications/process — drain the WhatsApp queue.
 * Triggered by cron (every minute). Sends QUEUED notifications with retries.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireCron(req);
  const result = await processNotificationQueue();
  return ok(result, 'Queue processed');
});
