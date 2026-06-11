import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { okWithMeta } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { listNotifications } from '@/services/notification.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/notifications/whatsapp — notification log (optionally by order). */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'notifications.view');
  const sp = new URL(req.url).searchParams;
  const result = await listNotifications({
    orderId: sp.get('orderId') ?? undefined,
    page: Number(sp.get('page') ?? 1) || 1,
    limit: Number(sp.get('limit') ?? 50) || 50,
  });
  return okWithMeta(result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
