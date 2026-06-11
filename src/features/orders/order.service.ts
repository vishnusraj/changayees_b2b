/**
 * Order service — creation (with items, tracking ID/token, initial timeline),
 * listing/detail, status updates (timeline engine + notification trigger), and
 * customer notes. Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type Prisma, type OrderStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import {
  enqueueOrderNotification,
  enqueueCustomerNoteNotification,
} from '@/services/notification.service';
import { generateSecret } from '@/lib/auth/tokens';
import { getStatusProgress } from '@/lib/order-status';

const AUDIT_MODULE = 'orders';

// ---------------------------------------------------------------------------
// Reference generation
// ---------------------------------------------------------------------------

function generateOrderRefs(): { orderNumber: string; trackingId: string } {
  const year = new Date().getFullYear();
  const seq = `${Date.now().toString(36).slice(-5)}${Math.floor(
    Math.random() * 90 + 10,
  )}`.toUpperCase();
  return {
    orderNumber: `ORD-${year}-${seq}`,
    trackingId: `CHG-${year}-${seq}`,
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrderManager {
  id: string;
  name: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  trackingId: string;
  customerName: string;
  organization: string | null;
  phone: string;
  currentStatus: OrderStatus;
  progressPercentage: number;
  expectedDelivery: Date | null;
  manager: OrderManager | null;
  createdAt: Date;
}

export interface OrderItemView {
  id: string;
  productName: string | null;
  itemLabel: string | null;
  quantity: number;
  remarks: string | null;
}

export interface TimelineEntry {
  id: string;
  status: OrderStatus;
  customerNote: string | null;
  internalNote: string | null;
  updatedByName: string | null;
  createdAt: Date;
}

export interface CustomerNoteView {
  id: string;
  message: string;
  visibleToCustomer: boolean;
  createdByName: string | null;
  createdAt: Date;
}

export interface OrderDetail extends OrderListItem {
  email: string | null;
  consentWhatsapp: boolean;
  trackingToken: string | null;
  items: OrderItemView[];
  timeline: TimelineEntry[];
  customerNotes: CustomerNoteView[];
  updatedAt: Date;
}

export interface OrderListResult {
  orders: OrderListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function resolveUserNames(
  ids: (string | null)[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u.name]));
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  customerName: string;
  organization?: string | null;
  phone: string;
  email?: string | null;
  assignedManager?: string | null;
  expectedDelivery?: string;
  consentWhatsapp?: boolean;
  currentStatus?: OrderStatus;
  items: {
    productId?: string;
    itemLabel?: string;
    quantity: number;
    remarks?: string;
  }[];
}

export async function createOrder(
  input: CreateOrderInput,
  actorId: string,
): Promise<{ id: string; orderNumber: string; trackingId: string }> {
  const { orderNumber, trackingId } = generateOrderRefs();
  const trackingToken = generateSecret(24);
  const status: OrderStatus = input.currentStatus ?? 'ORDER_CONFIRMED';
  const expectedDelivery = input.expectedDelivery
    ? new Date(input.expectedDelivery)
    : null;
  const delivery =
    expectedDelivery && !Number.isNaN(expectedDelivery.getTime())
      ? expectedDelivery
      : null;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      trackingId,
      customerName: input.customerName,
      organization: input.organization ?? null,
      phone: input.phone,
      email: input.email ?? null,
      assignedManager: input.assignedManager ?? null,
      expectedDelivery: delivery,
      currentStatus: status,
      progressPercentage: getStatusProgress(status),
      consentWhatsapp: input.consentWhatsapp ?? false,
      createdBy: actorId,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId ?? null,
          itemLabel: item.itemLabel ?? null,
          quantity: item.quantity,
          remarks: item.remarks ?? null,
        })),
      },
      statusHistory: {
        create: {
          status,
          internalNote: 'Order created',
          updatedBy: actorId,
        },
      },
      trackingLink: { create: { trackingToken } },
    },
    select: { id: true },
  });

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'create',
    entityId: order.id,
    newValue: { orderNumber, trackingId, status },
  });

  await enqueueOrderNotification({
    orderId: order.id,
    orderNumber,
    phone: input.phone,
    status,
    trackingToken,
    consentWhatsapp: input.consentWhatsapp ?? false,
  });

  return { id: order.id, orderNumber, trackingId };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
  assignedManager?: string;
}

export async function listOrders(
  params: ListOrdersParams = {},
): Promise<OrderListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? 20;

  const where: Prisma.OrderWhereInput = {
    deletedAt: null,
    ...(params.status ? { currentStatus: params.status } : {}),
    ...(params.assignedManager
      ? { assignedManager: params.assignedManager }
      : {}),
    ...(params.search
      ? {
          OR: [
            { orderNumber: { contains: params.search, mode: 'insensitive' } },
            { trackingId: { contains: params.search, mode: 'insensitive' } },
            { customerName: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const managers = await resolveUserNames(rows.map((r) => r.assignedManager));

  return {
    orders: rows.map((row) => ({
      id: row.id,
      orderNumber: row.orderNumber,
      trackingId: row.trackingId,
      customerName: row.customerName,
      organization: row.organization,
      phone: row.phone,
      currentStatus: row.currentStatus,
      progressPercentage: row.progressPercentage,
      expectedDelivery: row.expectedDelivery,
      manager: row.assignedManager
        ? {
            id: row.assignedManager,
            name: managers.get(row.assignedManager) ?? 'Unknown',
          }
        : null,
      createdAt: row.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
    include: {
      items: { include: { product: { select: { name: true } } } },
      statusHistory: { orderBy: { createdAt: 'desc' } },
      customerNotes: { orderBy: { createdAt: 'desc' } },
      trackingLink: { select: { trackingToken: true } },
    },
  });
  if (!order) return null;

  const names = await resolveUserNames([
    order.assignedManager,
    ...order.statusHistory.map((h) => h.updatedBy),
    ...order.customerNotes.map((n) => n.createdBy),
  ]);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    trackingId: order.trackingId,
    customerName: order.customerName,
    organization: order.organization,
    phone: order.phone,
    email: order.email,
    currentStatus: order.currentStatus,
    progressPercentage: order.progressPercentage,
    expectedDelivery: order.expectedDelivery,
    consentWhatsapp: order.consentWhatsapp,
    trackingToken: order.trackingLink?.trackingToken ?? null,
    manager: order.assignedManager
      ? {
          id: order.assignedManager,
          name: names.get(order.assignedManager) ?? 'Unknown',
        }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.product?.name ?? null,
      itemLabel: item.itemLabel,
      quantity: item.quantity,
      remarks: item.remarks,
    })),
    timeline: order.statusHistory.map((h) => ({
      id: h.id,
      status: h.status,
      customerNote: h.customerNote,
      internalNote: h.internalNote,
      updatedByName: h.updatedBy ? (names.get(h.updatedBy) ?? null) : null,
      createdAt: h.createdAt,
    })),
    customerNotes: order.customerNotes.map((n) => ({
      id: n.id,
      message: n.message,
      visibleToCustomer: n.visibleToCustomer,
      createdByName: n.createdBy ? (names.get(n.createdBy) ?? null) : null,
      createdAt: n.createdAt,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// ---------------------------------------------------------------------------
// Status update — the timeline engine
// ---------------------------------------------------------------------------

export interface UpdateStatusInput {
  status: OrderStatus;
  customerNote?: string;
  internalNote?: string;
  /** Explicitly suppress the WhatsApp notification (default: send). */
  sendNotification?: boolean;
}

export async function updateOrderStatus(
  id: string,
  input: UpdateStatusInput,
  actorId: string,
): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: { id, deletedAt: null },
    include: { trackingLink: { select: { trackingToken: true } } },
  });
  if (!order) return null;

  const progress = getStatusProgress(input.status);

  // Append-only timeline entry + update the order's current status.
  await prisma.$transaction([
    prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        status: input.status,
        customerNote: input.customerNote || null,
        internalNote: input.internalNote || null,
        updatedBy: actorId,
      },
    }),
    prisma.order.update({
      where: { id },
      data: { currentStatus: input.status, progressPercentage: progress },
    }),
  ]);

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'status',
    entityId: id,
    oldValue: { status: order.currentStatus },
    newValue: { status: input.status },
  });

  // Trigger notification unless explicitly suppressed.
  if (input.sendNotification !== false) {
    await enqueueOrderNotification({
      orderId: id,
      orderNumber: order.orderNumber,
      phone: order.phone,
      status: input.status,
      trackingToken: order.trackingLink?.trackingToken ?? null,
      consentWhatsapp: order.consentWhatsapp,
    });
  }

  return getOrderById(id);
}

// ---------------------------------------------------------------------------
// Customer notes
// ---------------------------------------------------------------------------

export async function addCustomerNote(
  orderId: string,
  message: string,
  visibleToCustomer: boolean,
  actorId: string,
): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, deletedAt: null },
    select: {
      id: true,
      orderNumber: true,
      phone: true,
      consentWhatsapp: true,
      trackingLink: { select: { trackingToken: true } },
    },
  });
  if (!order) return null;

  const note = await prisma.customerNote.create({
    data: {
      orderId,
      message,
      visibleToCustomer,
      createdBy: actorId,
    },
    select: { id: true },
  });

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'note',
    entityId: orderId,
    newValue: { visibleToCustomer },
  });

  // Customer-visible notes trigger a WhatsApp update.
  if (visibleToCustomer) {
    await enqueueCustomerNoteNotification({
      orderId,
      orderNumber: order.orderNumber,
      phone: order.phone,
      trackingToken: order.trackingLink?.trackingToken ?? null,
      consentWhatsapp: order.consentWhatsapp,
      noteId: note.id,
      note: message,
    });
  }

  return getOrderById(orderId);
}
