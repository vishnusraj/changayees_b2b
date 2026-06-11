/**
 * RFQ service — creates an RFQ with its line items + attachment records, and
 * captures a deduped RFQ lead. Generates a human reference number.
 *
 * Attachments: this phase records file *metadata* only (name/type/size) with a
 * `pending://` URL marker. Actual binary upload is the file-service phase
 * (signed S3 uploads, architecture M-11). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { RfqType, LeadSource, type RfqStatus, type Prisma } from '@/generated/prisma';
import { captureLead, normalizePhone } from '@/features/leads/lead.service';
import { track, ANALYTICS_EVENTS } from '@/services/analytics.service';

export interface CreateRfqInput {
  organization: string;
  contactPerson: string;
  email?: string | null;
  phone: string;
  location?: string | null;
  requirements?: string | null;
  expectedQuantity?: number;
  studentCount?: number;
  staffCount?: number;
  expectedDelivery?: string;
  consentWhatsapp?: boolean;
  items?: { customLabel?: string; productId?: string; quantity?: number }[];
  files?: { fileName: string; fileType?: string; fileSize?: number }[];
}

export function generateRfqNumber(): string {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString(36).slice(-6).toUpperCase();
  return `RFQ-${year}-${suffix}`;
}

function toValidDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createRfq(
  input: CreateRfqInput,
): Promise<{ rfqNumber: string }> {
  const rfqNumber = generateRfqNumber();

  const leadId = await captureLead({
    name: input.contactPerson,
    phone: input.phone,
    email: input.email ?? null,
    organization: input.organization,
    source: LeadSource.RFQ,
    consentWhatsapp: input.consentWhatsapp ?? false,
    notes: input.requirements ?? null,
  });

  await prisma.rfq.create({
    data: {
      rfqNumber,
      type: RfqType.RFQ,
      organization: input.organization,
      contactPerson: input.contactPerson,
      phone: normalizePhone(input.phone),
      email: input.email ?? null,
      location: input.location ?? null,
      requirements: input.requirements ?? null,
      expectedQuantity: input.expectedQuantity ?? null,
      studentCount: input.studentCount ?? null,
      staffCount: input.staffCount ?? null,
      expectedDelivery: toValidDate(input.expectedDelivery),
      consentWhatsapp: input.consentWhatsapp ?? false,
      leadId,
      items: input.items?.length
        ? {
            create: input.items.map((item) => ({
              productId: item.productId ?? null,
              customLabel: item.customLabel ?? null,
              quantity: item.quantity ?? null,
            })),
          }
        : undefined,
      files: input.files?.length
        ? {
            create: input.files.map((file) => ({
              // pending:// marks metadata captured before the binary upload.
              fileUrl: `pending://${file.fileName}`,
              fileName: file.fileName,
              fileType: file.fileType ?? null,
              fileSize: file.fileSize ?? null,
            })),
          }
        : undefined,
    },
  });

  await track(ANALYTICS_EVENTS.RFQ_SUBMITTED, {
    eventType: 'conversion',
    metadata: { rfqNumber, type: 'RFQ' },
  });

  return { rfqNumber };
}

// ---------------------------------------------------------------------------
// Admin: list RFQs
// ---------------------------------------------------------------------------

export interface RfqListItem {
  id: string;
  rfqNumber: string;
  organization: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  location: string | null;
  expectedQuantity: number | null;
  expectedDelivery: string | null;
  status: string;
  itemCount: number;
  leadId: string | null;
  createdAt: string;
}

export interface ListRfqsParams {
  page?: number;
  limit?: number;
  status?: RfqStatus;
  search?: string;
}

export interface RfqListResult {
  rfqs: RfqListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated RFQ list for the admin portal (filters: status, search). */
export async function listRfqs(
  params: ListRfqsParams = {},
): Promise<RfqListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? 20;

  const where: Prisma.RfqWhereInput = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.search
      ? {
          OR: [
            { rfqNumber: { contains: params.search, mode: 'insensitive' } },
            { organization: { contains: params.search, mode: 'insensitive' } },
            { contactPerson: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.rfq.count({ where }),
    prisma.rfq.findMany({
      where,
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    rfqs: rows.map((r) => ({
      id: r.id,
      rfqNumber: r.rfqNumber,
      organization: r.organization,
      contactPerson: r.contactPerson,
      phone: r.phone,
      email: r.email,
      location: r.location,
      expectedQuantity: r.expectedQuantity,
      expectedDelivery: r.expectedDelivery
        ? r.expectedDelivery.toISOString()
        : null,
      status: r.status,
      itemCount: r._count.items,
      leadId: r.leadId,
      createdAt: r.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
