import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { getLeadAnalytics } from '@/features/leads/lead.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/analytics/leads — lead funnel + source breakdown. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'analytics.view');
  const analytics = await getLeadAnalytics();
  return ok(analytics);
});
