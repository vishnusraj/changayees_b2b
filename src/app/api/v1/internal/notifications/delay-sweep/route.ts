import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { requireCron } from '@/lib/api/cron';
import {
  sweepDelayAlerts,
  processNotificationQueue,
} from '@/services/notification.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET /api/v1/internal/notifications/delay-sweep — enqueue delay alerts for
 * overdue orders, then process. Triggered daily by cron.
 */
export const GET = withApi(async (req: NextRequest) => {
  requireCron(req);
  const swept = await sweepDelayAlerts();
  const processed = await processNotificationQueue();
  return ok({ swept, processed }, 'Delay sweep complete');
});
