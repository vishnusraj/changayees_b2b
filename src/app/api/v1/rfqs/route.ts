import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { rfqSubmitSchema } from '@/lib/validation/rfq';
import { createRfq } from '@/features/rfq/rfq.service';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ApiError } from '@/lib/api/errors';

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
