/**
 * WhatsApp notification engine.
 *
 * Producer  — enqueue* functions create QUEUED rows (idempotent, opt-in gated)
 *             on status changes, customer notes, delay alerts, and weekly summaries.
 * Consumer  — processNotificationQueue() drains QUEUED rows, sends via the Cloud
 *             API, and updates status with bounded retries.
 * Sweeps    — sweepDelayAlerts() / enqueueWeeklySummaries() are run by cron.
 * Webhook   — applyDeliveryStatus() updates a row from a Meta delivery receipt.
 *
 * In production a separate BullMQ worker can call the same processor/sweeps; the
 * cron endpoints in /api/v1/internal/notifications/* are the serverless path.
 * Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type OrderStatus, NotificationStatus } from '@/generated/prisma';
import { getStatusMeta } from '@/lib/order-status';
import { sendWhatsAppMessage } from '@/services/whatsapp.client';

const MAX_RETRIES = 5;

/** Status → utility template. Statuses not listed do not notify. */
const ORDER_NOTIFICATION_TEMPLATES: Partial<Record<OrderStatus, string>> = {
  ORDER_CONFIRMED: 'order_confirmed',
  FABRIC_ORDERED: 'production_update',
  FABRIC_RECEIVED: 'production_update',
  CUTTING_STARTED: 'production_update',
  STITCHING_STARTED: 'production_update',
  QUALITY_INSPECTION: 'quality_update',
  PACKING: 'packing_update',
  DISPATCHED: 'dispatch_update',
  DELIVERED: 'delivered_update',
};

export function statusNotifies(status: OrderStatus): boolean {
  return Boolean(ORDER_NOTIFICATION_TEMPLATES[status]);
}

function trackingLink(token: string | null): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return token ? `${appUrl}/track/${token}` : `${appUrl}/track`;
}

/** ISO year-week key, e.g. "2026-W24" — for weekly-summary idempotency. */
function isoWeekKey(date = new Date()): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Producer
// ---------------------------------------------------------------------------

interface EnqueueInput {
  orderId: string;
  phone: string;
  templateName: string;
  message: string;
  idempotencyKey: string;
  consent: boolean;
}

/** Create a QUEUED notification (no-op if no consent or already enqueued). */
async function enqueue(input: EnqueueInput): Promise<boolean> {
  if (!input.consent) return false;

  const existing = await prisma.whatsappNotification.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
    select: { id: true },
  });
  if (existing) return false;

  try {
    await prisma.whatsappNotification.create({
      data: {
        orderId: input.orderId,
        phone: input.phone,
        templateName: input.templateName,
        message: input.message,
        status: NotificationStatus.QUEUED,
        idempotencyKey: input.idempotencyKey,
      },
    });
    return true;
  } catch {
    return false; // unique race on idempotencyKey
  }
}

export interface OrderNotificationContext {
  orderId: string;
  orderNumber: string;
  phone: string;
  trackingToken: string | null;
  consentWhatsapp: boolean;
}

/** Status change → production update (the primary trigger). */
export async function enqueueOrderNotification(
  ctx: OrderNotificationContext & { status: OrderStatus },
): Promise<boolean> {
  const template = ORDER_NOTIFICATION_TEMPLATES[ctx.status];
  if (!template) return false;
  const message = `Your order ${ctx.orderNumber} is now "${getStatusMeta(ctx.status).label}". Track it here: ${trackingLink(ctx.trackingToken)}`;
  return enqueue({
    orderId: ctx.orderId,
    phone: ctx.phone,
    templateName: template,
    message,
    idempotencyKey: `${ctx.orderId}:status:${ctx.status}`,
    consent: ctx.consentWhatsapp,
  });
}

/** Customer-visible note added → notify. */
export async function enqueueCustomerNoteNotification(
  ctx: OrderNotificationContext & { noteId: string; note: string },
): Promise<boolean> {
  const message = `Update on order ${ctx.orderNumber}: ${ctx.note} — ${trackingLink(ctx.trackingToken)}`;
  return enqueue({
    orderId: ctx.orderId,
    phone: ctx.phone,
    templateName: 'customer_note',
    message,
    idempotencyKey: `${ctx.orderId}:note:${ctx.noteId}`,
    consent: ctx.consentWhatsapp,
  });
}

/** Delay alert (one per order until delivered). */
export async function enqueueDelayAlert(
  ctx: OrderNotificationContext,
): Promise<boolean> {
  const message = `Your order ${ctx.orderNumber} is taking a little longer than expected. Our team is on it — track progress: ${trackingLink(ctx.trackingToken)}`;
  return enqueue({
    orderId: ctx.orderId,
    phone: ctx.phone,
    templateName: 'delay_alert',
    message,
    idempotencyKey: `${ctx.orderId}:delay`,
    consent: ctx.consentWhatsapp,
  });
}

/** Weekly progress summary (one per order per ISO week). */
export async function enqueueWeeklySummary(
  ctx: OrderNotificationContext & { status: OrderStatus; progress: number },
): Promise<boolean> {
  const message = `Weekly update: order ${ctx.orderNumber} is "${getStatusMeta(ctx.status).label}" (${ctx.progress}% complete). Track: ${trackingLink(ctx.trackingToken)}`;
  return enqueue({
    orderId: ctx.orderId,
    phone: ctx.phone,
    templateName: 'weekly_summary',
    message,
    idempotencyKey: `${ctx.orderId}:weekly:${isoWeekKey()}`,
    consent: ctx.consentWhatsapp,
  });
}

// ---------------------------------------------------------------------------
// Consumer (processor)
// ---------------------------------------------------------------------------

export interface ProcessResult {
  processed: number;
  sent: number;
  failed: number;
}

export async function processNotificationQueue(
  batchSize = 25,
): Promise<ProcessResult> {
  const batch = await prisma.whatsappNotification.findMany({
    where: { status: NotificationStatus.QUEUED },
    orderBy: { createdAt: 'asc' },
    take: batchSize,
  });

  let sent = 0;
  let failed = 0;

  for (const notification of batch) {
    try {
      const result = await sendWhatsAppMessage({
        to: notification.phone,
        template: notification.templateName,
        message: notification.message ?? '',
      });
      await prisma.whatsappNotification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          providerId: result.providerId,
          sentAt: new Date(),
          errorMessage: null,
        },
      });
      sent += 1;
    } catch (error) {
      const retryCount = notification.retryCount + 1;
      const exhausted = retryCount >= MAX_RETRIES;
      await prisma.whatsappNotification.update({
        where: { id: notification.id },
        data: {
          // keep QUEUED for another attempt until retries are exhausted
          status: exhausted
            ? NotificationStatus.FAILED
            : NotificationStatus.QUEUED,
          retryCount,
          errorMessage:
            error instanceof Error ? error.message : 'send failed',
        },
      });
      failed += 1;
    }
  }

  return { processed: batch.length, sent, failed };
}

// ---------------------------------------------------------------------------
// Sweeps (cron)
// ---------------------------------------------------------------------------

export interface SweepResult {
  scanned: number;
  enqueued: number;
}

export async function sweepDelayAlerts(): Promise<SweepResult> {
  const overdue = await prisma.order.findMany({
    where: {
      deletedAt: null,
      consentWhatsapp: true,
      expectedDelivery: { lt: new Date() },
      currentStatus: { notIn: ['DELIVERED', 'CLOSED'] },
    },
    include: { trackingLink: { select: { trackingToken: true } } },
    take: 500,
  });

  let enqueued = 0;
  for (const order of overdue) {
    const ok = await enqueueDelayAlert({
      orderId: order.id,
      orderNumber: order.orderNumber,
      phone: order.phone,
      trackingToken: order.trackingLink?.trackingToken ?? null,
      consentWhatsapp: order.consentWhatsapp,
    });
    if (ok) enqueued += 1;
  }
  return { scanned: overdue.length, enqueued };
}

export async function enqueueWeeklySummaries(): Promise<SweepResult> {
  const active = await prisma.order.findMany({
    where: {
      deletedAt: null,
      consentWhatsapp: true,
      currentStatus: {
        notIn: [
          'INQUIRY_RECEIVED',
          'QUOTATION_SENT',
          'QUOTATION_APPROVED',
          'DELIVERED',
          'CLOSED',
        ],
      },
    },
    include: { trackingLink: { select: { trackingToken: true } } },
    take: 1000,
  });

  let enqueued = 0;
  for (const order of active) {
    const ok = await enqueueWeeklySummary({
      orderId: order.id,
      orderNumber: order.orderNumber,
      phone: order.phone,
      trackingToken: order.trackingLink?.trackingToken ?? null,
      consentWhatsapp: order.consentWhatsapp,
      status: order.currentStatus,
      progress: order.progressPercentage,
    });
    if (ok) enqueued += 1;
  }
  return { scanned: active.length, enqueued };
}

// ---------------------------------------------------------------------------
// Webhook + admin
// ---------------------------------------------------------------------------

const DELIVERY_STATUS_MAP: Record<string, NotificationStatus> = {
  sent: NotificationStatus.SENT,
  delivered: NotificationStatus.DELIVERED,
  read: NotificationStatus.READ,
  failed: NotificationStatus.FAILED,
};

/** Apply a Meta delivery receipt (by provider message id). */
export async function applyDeliveryStatus(
  providerId: string,
  metaStatus: string,
  errorMessage?: string,
): Promise<void> {
  const mapped = DELIVERY_STATUS_MAP[metaStatus];
  if (!mapped) return;
  await prisma.whatsappNotification.updateMany({
    where: { providerId },
    data: {
      status: mapped,
      ...(errorMessage ? { errorMessage } : {}),
    },
  });
}

export interface NotificationLogItem {
  id: string;
  orderId: string | null;
  phone: string;
  templateName: string;
  message: string | null;
  status: NotificationStatus;
  retryCount: number;
  errorMessage: string | null;
  sentAt: Date | null;
  createdAt: Date;
}

export async function listNotifications(params: {
  orderId?: string;
  page?: number;
  limit?: number;
}): Promise<{ items: NotificationLogItem[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? 50;
  const where = params.orderId ? { orderId: params.orderId } : {};

  const [total, items] = await Promise.all([
    prisma.whatsappNotification.count({ where }),
    prisma.whatsappNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Re-queue a failed notification (admin action). */
export async function retryNotification(id: string): Promise<boolean> {
  const result = await prisma.whatsappNotification.updateMany({
    where: { id },
    data: {
      status: NotificationStatus.QUEUED,
      retryCount: 0,
      errorMessage: null,
    },
  });
  return result.count > 0;
}
