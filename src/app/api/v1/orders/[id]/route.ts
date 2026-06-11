import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { getOrderById } from '@/features/orders/order.service';

/** GET /api/v1/orders/{id} — full order with items, timeline, and notes. */
export const GET = withApiParams<{ id: string }>(async (req, { id }) => {
  await authorize(req, 'orders.view');
  const order = await getOrderById(id);
  if (!order) throw ApiError.notFound('Order not found');
  return ok(order);
});
