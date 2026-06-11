import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { getDashboardStats } from '@/services/dashboard.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/analytics/dashboard — admin dashboard aggregates. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'dashboard.view');
  const stats = await getDashboardStats();
  return ok(stats);
});
