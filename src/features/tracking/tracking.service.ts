/**
 * Public order tracking (no login).
 *
 * Two access paths (architecture §6 / ADR-04):
 *   • resolveByToken — the opaque tracking_token is the authorization; renders
 *     the order directly (used by the WhatsApp deep link and after verify).
 *   • verifyByIdAndPhone — manual fallback: match tracking_id + phone, then
 *     hand back the token to view.
 *
 * Only customer-safe data is returned (no internal notes, no PII beyond what the
 * customer already provided). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type OrderStatus } from '@/generated/prisma';
import { normalizePhone } from '@/features/leads/lead.service';
import { track, ANALYTICS_EVENTS } from '@/services/analytics.service';

export interface TrackingTimelineEntry {
  status: OrderStatus;
  date: Date;
  note: string | null;
}

export interface TrackingNote {
  message: string;
  date: Date;
}

export interface TrackingView {
  orderNumber: string;
  trackingId: string;
  customerName: string;
  organization: string | null;
  status: OrderStatus;
  progressPercentage: number;
  expectedDelivery: Date | null;
  timeline: TrackingTimelineEntry[];
  notes: TrackingNote[];
}

/** Lenient phone match: equal, or one is a suffix of the other (≥6 digits). */
function phoneMatches(stored: string, input: string): boolean {
  const a = normalizePhone(stored).replace(/\D/g, '');
  const b = normalizePhone(input).replace(/\D/g, '');
  if (a.length < 6 || b.length < 6) return a === b;
  return a === b || a.endsWith(b) || b.endsWith(a);
}

export async function resolveByToken(
  token: string,
): Promise<TrackingView | null> {
  const link = await prisma.trackingLink.findFirst({
    where: { trackingToken: token, isActive: true },
    include: {
      order: {
        include: {
          statusHistory: { orderBy: { createdAt: 'desc' } },
          customerNotes: {
            where: { visibleToCustomer: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!link || link.order.deletedAt) return null;
  const order = link.order;

  // Order-tracking usage analytics.
  await track(ANALYTICS_EVENTS.TRACKING_VIEWED, {
    eventType: 'engagement',
    metadata: { orderNumber: order.orderNumber },
  });

  return {
    orderNumber: order.orderNumber,
    trackingId: order.trackingId,
    customerName: order.customerName,
    organization: order.organization,
    status: order.currentStatus,
    progressPercentage: order.progressPercentage,
    expectedDelivery: order.expectedDelivery,
    timeline: order.statusHistory.map((h) => ({
      status: h.status,
      date: h.createdAt,
      note: h.customerNote, // customer-facing note only — never internalNote
    })),
    notes: order.customerNotes.map((n) => ({
      message: n.message,
      date: n.createdAt,
    })),
  };
}

/** Verify tracking ID + phone; return the token on success, else null. */
export async function verifyByIdAndPhone(
  trackingId: string,
  phone: string,
): Promise<{ trackingToken: string } | null> {
  const order = await prisma.order.findFirst({
    where: { trackingId, deletedAt: null },
    select: {
      phone: true,
      trackingLink: { select: { trackingToken: true, isActive: true } },
    },
  });

  if (!order || !order.trackingLink?.isActive) return null;
  if (!phoneMatches(order.phone, phone)) return null;

  return { trackingToken: order.trackingLink.trackingToken };
}
