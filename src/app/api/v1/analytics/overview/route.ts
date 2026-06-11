import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { getAnalyticsOverview } from '@/services/analytics.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/analytics/overview?days=30 — analytics report. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'analytics.view');
  const days = Number(new URL(req.url).searchParams.get('days') ?? 30) || 30;
  const overview = await getAnalyticsOverview(Math.min(365, Math.max(1, days)));
  return ok(overview);
});
