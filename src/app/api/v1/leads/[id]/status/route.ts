import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { changeLeadStatusSchema } from '@/lib/validation/lead';
import { changeLeadStatus } from '@/features/leads/lead.service';

/** PATCH /api/v1/leads/{id}/status */
export const PATCH = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'leads.update');
  const body = changeLeadStatusSchema.parse(await readJson(req));
  const lead = await changeLeadStatus(id, body.status, auth.userId);
  if (!lead) throw ApiError.notFound('Lead not found');
  return ok(lead, 'Status updated');
});
