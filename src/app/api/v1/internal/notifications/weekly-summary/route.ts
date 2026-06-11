import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { requireCron } from '@/lib/api/cron';
import {
  enqueueWeeklySummaries,
  processNotificationQueue,
} from '@/services/notification.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/v1/internal/notifications/weekly-summary — enqueue weekly progress
 * summaries for active orders, then process. Triggered weekly by cron.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireCron(req);
  const swept = await enqueueWeeklySummaries();
  const processed = await processNotificationQueue();
  return ok({ swept, processed }, 'Weekly summary complete');
});
