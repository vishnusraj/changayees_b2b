import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { inquirySchema } from '@/lib/validation/inquiry';
import { captureLead } from '@/features/leads/lead.service';
import { LeadSource } from '@/generated/prisma';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { ApiError } from '@/lib/api/errors';

/**
 * POST /api/v1/inquiries — product inquiry (quick inquiry).
 * Captures a deduped lead (source = PRODUCT_INQUIRY).
 */
export const POST = withApi(async (req: NextRequest) => {
  if (!rateLimit(`inquiry:${clientIp(req)}`, 8, 60_000)) {
    throw ApiError.rateLimited('Too many requests. Please try again shortly.');
  }
  const body = inquirySchema.parse(await readJson(req));

  const productLine = body.productName ?? body.productSlug;
  const notes = [
    productLine ? `Product: ${productLine}` : null,
    body.message ? body.message : null,
  ]
    .filter(Boolean)
    .join('\n');

  await captureLead({
    name: body.name,
    phone: body.phone,
    email: body.email || null,
    organization: body.organization || null,
    source: LeadSource.PRODUCT_INQUIRY,
    notes: notes || null,
  });

  return message('Thanks — our team will reach out shortly.');
});
