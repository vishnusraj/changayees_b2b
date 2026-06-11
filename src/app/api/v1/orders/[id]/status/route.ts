import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { updateStatusSchema } from '@/lib/validation/order';
import { updateOrderStatus } from '@/features/orders/order.service';

/**
 * PATCH /api/v1/orders/{id}/status — advance the order, append the timeline
 * entry, and (unless suppressed) enqueue the WhatsApp notification.
 */
export const PATCH = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'orders.update_status');
  const body = updateStatusSchema.parse(await readJson(req));
  const order = await updateOrderStatus(id, body, auth.userId);
  if (!order) throw ApiError.notFound('Order not found');
  return ok(order, 'Status updated');
});
