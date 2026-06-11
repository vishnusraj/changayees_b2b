import { withApiParams } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { retryNotification } from '@/services/notification.service';

/** POST /api/v1/notifications/whatsapp/{id}/retry — re-queue a failed send. */
export const POST = withApiParams<{ id: string }>(async (req, { id }) => {
  await authorize(req, 'notifications.retry');
  const ok = await retryNotification(id);
  if (!ok) throw ApiError.notFound('Notification not found');
  return message('Notification re-queued');
});
