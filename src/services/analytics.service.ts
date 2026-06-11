/**
 * Analytics service — records business events into `analytics_events` and
 * aggregates them for the admin analytics report. `track` is best-effort and
 * never throws (analytics must not break a request). Node runtime only.
 */
import { prisma } from '@/lib/prisma';
import { type Prisma } from '@/generated/prisma';

export const ANALYTICS_EVENTS = {
  PRODUCT_VIEWED: 'product_viewed',
  RFQ_SUBMITTED: 'rfq_submitted',
  CATALOG_DOWNLOADED: 'catalog_downloaded',
  WHATSAPP_CLICKED: 'whatsapp_clicked',
  TRACKING_VIEWED: 'tracking_viewed',
  LEAD_CREATED: 'lead_created',
} as const;

/** Events a public (unauthenticated) beacon is allowed to record. */
export const PUBLIC_TRACKABLE = new Set<string>([
  ANALYTICS_EVENTS.PRODUCT_VIEWED,
  ANALYTICS_EVENTS.WHATSAPP_CLICKED,
]);

export async function track(
  event: string,
  opts?: {
    eventType?: string;
    userIdentifier?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName: event,
        eventType: opts?.eventType ?? null,
        userIdentifier: opts?.userIdentifier || null,
        metadata: opts?.metadata
          ? (opts.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });
  } catch (error) {
    console.error('[analytics] track failed:', error);
  }
}

// ---------------------------------------------------------------------------
// Aggregation
// ---------------------------------------------------------------------------

export interface AnalyticsOverview {
  days: number;
  totals: Record<string, number>;
  daily: { date: string; count: number }[];
  leadsBySource: Record<string, number>;
  topProducts: { slug: string; views: number }[];
}

export async function getAnalyticsOverview(
  days = 30,
): Promise<AnalyticsOverview> {
  const since = new Date(Date.now() - days * 24 * 3600 * 1000);

  const [totalsGroup, leadsSourceGroup, dailyRaw, topRaw] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      _count: { _all: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
      where: { deletedAt: null, createdAt: { gte: since } },
    }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT date_trunc('day', created_at) AS day, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE created_at >= ${since}
      GROUP BY 1
      ORDER BY 1
    `,
    prisma.$queryRaw<Array<{ slug: string; views: bigint }>>`
      SELECT metadata->>'slug' AS slug, COUNT(*)::bigint AS views
      FROM analytics_events
      WHERE event_name = 'product_viewed'
        AND created_at >= ${since}
        AND metadata->>'slug' IS NOT NULL
      GROUP BY 1
      ORDER BY 2 DESC
      LIMIT 8
    `,
  ]);

  return {
    days,
    totals: Object.fromEntries(
      totalsGroup.map((t) => [t.eventName, t._count._all]),
    ),
    daily: dailyRaw.map((d) => ({
      date: d.day.toISOString().slice(0, 10),
      count: Number(d.count),
    })),
    leadsBySource: Object.fromEntries(
      leadsSourceGroup.map((s) => [s.source, s._count._all]),
    ),
    topProducts: topRaw.map((p) => ({ slug: p.slug, views: Number(p.views) })),
  };
}
