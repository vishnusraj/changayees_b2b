import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { okWithMeta, created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { authorize } from '@/lib/api/guards';
import { createOrderSchema } from '@/lib/validation/order';
import { listOrders, createOrder } from '@/features/orders/order.service';
import { OrderStatus } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/v1/orders — list orders. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'orders.view');
  const sp = new URL(req.url).searchParams;
  const statusParam = sp.get('status');

  const result = await listOrders({
    page: Number(sp.get('page') ?? 1) || 1,
    limit: Number(sp.get('limit') ?? 20) || 20,
    status:
      statusParam && statusParam in OrderStatus
        ? (statusParam as OrderStatus)
        : undefined,
    assignedManager: sp.get('manager') ?? undefined,
    search: sp.get('search') ?? undefined,
  });

  return okWithMeta(result.orders, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

/** POST /api/v1/orders — create an order (+ items, tracking ID/token, timeline). */
export const POST = withApi(async (req: NextRequest) => {
  const auth = await authorize(req, 'orders.create');
  const body = createOrderSchema.parse(await readJson(req));

  const result = await createOrder(
    {
      customerName: body.customerName,
      organization: body.organization || null,
      phone: body.phone,
      email: body.email || null,
      assignedManager: body.assignedManager || null,
      expectedDelivery: body.expectedDelivery,
      consentWhatsapp: body.consentWhatsapp,
      currentStatus: body.currentStatus,
      items: body.items,
    },
    auth.userId,
  );

  return created(result, 'Order created');
});
