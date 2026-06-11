import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { getAssignableUsers } from '@/features/leads/lead.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/leads/assignees — active users a lead can be assigned to. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'leads.view');
  const users = await getAssignableUsers();
  return ok(users);
});
