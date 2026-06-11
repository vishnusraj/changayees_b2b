import { withApiParams } from '@/lib/api/route';
import { ok, created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { customerNoteSchema } from '@/lib/validation/order';
import { getOrderById, addCustomerNote } from '@/features/orders/order.service';

/** GET /api/v1/orders/{id}/notes — customer notes for an order. */
export const GET = withApiParams<{ id: string }>(async (req, { id }) => {
  await authorize(req, 'orders.view');
  const order = await getOrderById(id);
  if (!order) throw ApiError.notFound('Order not found');
  return ok(order.customerNotes);
});

/** POST /api/v1/orders/{id}/notes — add a customer note. */
export const POST = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'orders.update');
  const body = customerNoteSchema.parse(await readJson(req));
  const order = await addCustomerNote(
    id,
    body.message,
    body.visibleToCustomer ?? true,
    auth.userId,
  );
  if (!order) throw ApiError.notFound('Order not found');
  return created(order, 'Note added');
});
