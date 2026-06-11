import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { assignLeadSchema } from '@/lib/validation/lead';
import { assignLead } from '@/features/leads/lead.service';

/** PATCH /api/v1/leads/{id}/assign */
export const PATCH = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'leads.assign');
  const body = assignLeadSchema.parse(await readJson(req));
  const lead = await assignLead(id, body.assignedTo, auth.userId);
  if (!lead) throw ApiError.notFound('Lead or assignee not found');
  return ok(lead, 'Lead assigned');
});
