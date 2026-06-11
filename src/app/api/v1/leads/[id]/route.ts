import { withApiParams } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { updateLeadSchema } from '@/lib/validation/lead';
import { getLeadById, updateLead } from '@/features/leads/lead.service';

/** GET /api/v1/leads/{id} */
export const GET = withApiParams<{ id: string }>(async (req, { id }) => {
  await authorize(req, 'leads.view');
  const lead = await getLeadById(id);
  if (!lead) throw ApiError.notFound('Lead not found');
  return ok(lead);
});

/** PUT /api/v1/leads/{id} — update fields incl. notes. */
export const PUT = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'leads.update');
  const body = updateLeadSchema.parse(await readJson(req));
  const lead = await updateLead(id, body, auth.userId);
  if (!lead) throw ApiError.notFound('Lead not found');
  return ok(lead, 'Lead updated');
});
