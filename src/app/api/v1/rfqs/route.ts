import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { created, okWithMeta } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { authorize } from '@/lib/api/guards';
import { rfqSubmitSchema } from '@/lib/validation/rfq';
import { createRfq, listRfqs } from '@/features/rfq/rfq.service';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ApiError } from '@/lib/api/errors';
import { RfqStatus } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/v1/rfqs — list RFQs for the admin portal (filters: status, search). */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'rfqs.view');
  const sp = new URL(req.url).searchParams;
  const statusParam = sp.get('status');

  const result = await listRfqs({
    page: Number(sp.get('page') ?? 1) || 1,
    limit: Number(sp.get('limit') ?? 20) || 20,
    status:
      statusParam && statusParam in RfqStatus
        ? (statusParam as RfqStatus)
        : undefined,
    search: sp.get('search') ?? undefined,
  });

  return okWithMeta(result.rfqs, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

/**
 * POST /api/v1/rfqs — submit a Request for Quote (public, from the wizard).
 * Creates the RFQ (+ items + attachment records) and a deduped RFQ lead.
 */
export const POST = withApi(async (req: NextRequest) => {
  if (!rateLimit(`rfq:${clientIp(req)}`, 5, 60_000)) {
    throw ApiError.rateLimited('Too many requests. Please try again shortly.');
  }
  const body = rfqSubmitSchema.parse(await readJson(req));

  const { rfqNumber } = await createRfq({
    organization: body.organization,
    contactPerson: body.contactPerson,
    email: body.email || null,
    phone: body.phone,
    location: body.location || null,
    requirements: body.requirements || null,
    expectedQuantity: body.expectedQuantity,
    studentCount: body.studentCount,
    staffCount: body.staffCount,
    expectedDelivery: body.expectedDelivery,
    consentWhatsapp: body.consentWhatsapp,
    items: body.items,
    files: body.files,
  });

  return created({ rfqNumber }, 'RFQ submitted');
});
