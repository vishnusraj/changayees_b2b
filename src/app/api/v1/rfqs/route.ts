import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { rfqSubmitSchema } from '@/lib/validation/rfq';
import { createRfq } from '@/features/rfq/rfq.service';

/**
 * POST /api/v1/rfqs — submit a Request for Quote (public, from the wizard).
 * Creates the RFQ (+ items + attachment records) and a deduped RFQ lead.
 * TODO(security): add captcha + rate limiting before launch (M-10).
 */
export const POST = withApi(async (req: NextRequest) => {
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
