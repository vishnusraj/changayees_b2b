import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { okWithMeta, created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { authorize } from '@/lib/api/guards';
import { createLeadSchema } from '@/lib/validation/lead';
import { listLeads, createLeadManual } from '@/features/leads/lead.service';
import { LeadStatus, LeadSource } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/v1/leads — list leads (filters: status, source, assignedTo, search). */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'leads.view');
  const sp = new URL(req.url).searchParams;

  const statusParam = sp.get('status');
  const sourceParam = sp.get('source');

  const result = await listLeads({
    page: Number(sp.get('page') ?? 1) || 1,
    limit: Number(sp.get('limit') ?? 20) || 20,
    status:
      statusParam && statusParam in LeadStatus
        ? (statusParam as LeadStatus)
        : undefined,
    source:
      sourceParam && sourceParam in LeadSource
        ? (sourceParam as LeadSource)
        : undefined,
    assignedTo: sp.get('assignedTo') ?? undefined,
    search: sp.get('search') ?? undefined,
  });

  return okWithMeta(result.leads, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

/** POST /api/v1/leads — create a lead manually. */
export const POST = withApi(async (req: NextRequest) => {
  const auth = await authorize(req, 'leads.create');
  const body = createLeadSchema.parse(await readJson(req));
  const id = await createLeadManual(
    {
      name: body.name,
      phone: body.phone,
      email: body.email || null,
      organization: body.organization || null,
      designation: body.designation || null,
    },
    auth.userId,
  );
  return created({ id }, 'Lead created');
});
