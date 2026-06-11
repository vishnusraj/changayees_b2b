/**
 * RFQ service — creates an RFQ with its line items + attachment records, and
 * captures a deduped RFQ lead. Generates a human reference number.
 *
 * Attachments: this phase records file *metadata* only (name/type/size) with a
 * `pending://` URL marker. Actual binary upload is the file-service phase
 * (signed S3 uploads, architecture M-11). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { RfqType, LeadSource } from '@/generated/prisma';
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
