import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { getLeadActivity } from '@/features/leads/lead.service';

/** GET /api/v1/leads/{id}/activity — audit-derived activity feed. */
export const GET = withApiParams<{ id: string }>(async (req, { id }) => {
  await authorize(req, 'leads.view');
  const activity = await getLeadActivity(id);
  return ok(activity);
});
