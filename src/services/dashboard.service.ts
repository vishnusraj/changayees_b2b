/**
 * Admin dashboard aggregation — counts + recent activity across modules.
 * Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type OrderStatus, type RfqStatus } from '@/generated/prisma';

export interface DashboardRecentLead {
  id: string;
  name: string;
  source: string;
  status: string;
  createdAt: Date;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  currentStatus: OrderStatus;
  progressPercentage: number;
  createdAt: Date;
}

export interface DashboardStats {
  products: { total: number; published: number };
  leads: { total: number; newLeads: number; won: number; conversionRate: number };
  orders: { total: number; active: number; delivered: number };
  rfqs: { total: number; pending: number };
  catalogDownloads: { total: number; last30Days: number };
  notifications: { queued: number; sent: number; failed: number };
  recentLeads: DashboardRecentLead[];
  recentOrders: DashboardRecentOrder[];
  leadsBySource: Record<string, number>;
}

const ACTIVE_ORDER_EXCLUDE: OrderStatus[] = ['DELIVERED', 'CLOSED'];
const PENDING_RFQ: RfqStatus[] = ['SUBMITTED', 'UNDER_REVIEW'];

export async function getDashboardStats(): Promise<DashboardStats> {
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [
    productsTotal,
    productsPublished,
    leadsTotal,
    leadsNew,
    leadsWon,
    ordersTotal,
    ordersActive,
    ordersDelivered,
    rfqsTotal,
    rfqsPending,
    catalogTotal,
    catalogRecent,
    notifGroup,
    recentLeads,
    recentOrders,
    leadsSourceGroup,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'NEW' } }),
    prisma.lead.count({ where: { deletedAt: null, status: 'WON' } }),
    prisma.order.count({ where: { deletedAt: null } }),
    prisma.order.count({
      where: { deletedAt: null, currentStatus: { notIn: ACTIVE_ORDER_EXCLUDE } },
    }),
    prisma.order.count({ where: { deletedAt: null, currentStatus: 'DELIVERED' } }),
    prisma.rfq.count({ where: { deletedAt: null } }),
    prisma.rfq.count({ where: { deletedAt: null, status: { in: PENDING_RFQ } } }),
    prisma.catalogDownload.count(),
    prisma.catalogDownload.count({ where: { createdAt: { gte: since30 } } }),
    prisma.whatsappNotification.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lead.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, source: true, status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        currentStatus: true,
        progressPercentage: true,
        createdAt: true,
      },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
      where: { deletedAt: null },
    }),
  ]);

  const notif = Object.fromEntries(
    notifGroup.map((n) => [n.status, n._count._all]),
  );
  const leadsBySource = Object.fromEntries(
    leadsSourceGroup.map((s) => [s.source, s._count._all]),
  );

  return {
    products: { total: productsTotal, published: productsPublished },
    leads: {
      total: leadsTotal,
      newLeads: leadsNew,
      won: leadsWon,
      conversionRate: leadsTotal > 0 ? Math.round((leadsWon / leadsTotal) * 100) : 0,
    },
    orders: { total: ordersTotal, active: ordersActive, delivered: ordersDelivered },
    rfqs: { total: rfqsTotal, pending: rfqsPending },
    catalogDownloads: { total: catalogTotal, last30Days: catalogRecent },
    notifications: {
      queued: notif['QUEUED'] ?? 0,
      sent: (notif['SENT'] ?? 0) + (notif['DELIVERED'] ?? 0) + (notif['READ'] ?? 0),
      failed: notif['FAILED'] ?? 0,
    },
    recentLeads,
    recentOrders,
    leadsBySource,
  };
}
