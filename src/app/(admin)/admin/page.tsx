'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Package,
  Users,
  Truck,
  ClipboardList,
  Download,
  MessageCircle,
  Plus,
  TrendingUp,
} from 'lucide-react';
import { apiGet } from '@/lib/admin-api';
import { MetricCard } from '@/components/dashboard/metric-card';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

interface RecentLead {
  id: string;
  name: string;
  source: string;
  status: string;
  createdAt: string;
}
interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  currentStatus: string;
  progressPercentage: number;
  createdAt: string;
}
interface DashboardStats {
  products: { total: number; published: number };
  leads: { total: number; newLeads: number; won: number; conversionRate: number };
  orders: { total: number; active: number; delivered: number };
  rfqs: { total: number; pending: number };
  catalogDownloads: { total: number; last30Days: number };
  notifications: { queued: number; sent: number; failed: number };
  recentLeads: RecentLead[];
  recentOrders: RecentOrder[];
  leadsBySource: Record<string, number>;
}

const humanize = (s: string) =>
  s.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    apiGet<DashboardStats>('/analytics/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState lines={8} />;
  if (!stats) return <Alert variant="danger">{error ?? 'Failed to load dashboard'}</Alert>;

  const sourceEntries = Object.entries(stats.leadsBySource).sort((a, b) => b[1] - a[1]);
  const sourceMax = Math.max(1, ...sourceEntries.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/admin/orders/new">
              <Plus className="h-4 w-4" aria-hidden />
              New Order
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/leads">View Leads</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/cms">Content</Link>
          </Button>
        </div>
      </div>

      {/* Metric widgets */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Products" value={stats.products.total} icon={Package} hint={`${stats.products.published} published`} />
        <MetricCard label="Leads" value={stats.leads.total} icon={Users} hint={`${stats.leads.newLeads} new`} />
        <MetricCard label="Active orders" value={stats.orders.active} icon={Truck} hint={`${stats.orders.total} total`} />
        <MetricCard label="RFQs pending" value={stats.rfqs.pending} icon={ClipboardList} hint={`${stats.rfqs.total} total`} />
        <MetricCard label="Catalog downloads" value={stats.catalogDownloads.last30Days} icon={Download} hint="last 30 days" />
        <MetricCard label="Notifications" value={stats.notifications.failed} icon={MessageCircle} hint={`${stats.notifications.queued} queued`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Analytics widget */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
              Lead analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-h2">{stats.leads.conversionRate}%</span>
              <span className="text-body-sm text-muted-foreground">
                conversion ({stats.leads.won} won)
              </span>
            </div>
            <div className="space-y-2">
              {sourceEntries.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No leads yet.</p>
              ) : (
                sourceEntries.map(([source, count]) => (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-caption">
                      <span className="text-muted-foreground">{humanize(source)}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(count / sourceMax) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification health widget */}
        <Card>
          <CardHeader>
            <CardTitle>Notification health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <NotifStat label="Queued" value={stats.notifications.queued} tone="bg-neutral-400" />
              <NotifStat label="Sent" value={stats.notifications.sent} tone="bg-success" />
              <NotifStat label="Failed" value={stats.notifications.failed} tone="bg-danger" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent leads</CardTitle>
            <Link href="/admin/leads" className="text-body-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentLeads.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No leads yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-2 py-2.5">
                    <Link href={`/admin/leads/${lead.id}`} className="min-w-0">
                      <span className="block truncate text-body-sm font-medium text-primary hover:underline">
                        {lead.name}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {humanize(lead.source)} · {formatDate(lead.createdAt)}
                      </span>
                    </Link>
                    <StatusBadge status={lead.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent orders</CardTitle>
            <Link href="/admin/orders" className="text-body-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentOrders.length === 0 ? (
              <p className="text-body-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-2 py-2.5">
                    <Link href={`/admin/orders/${order.id}`} className="min-w-0">
                      <span className="block truncate text-body-sm font-medium text-primary hover:underline">
                        {order.customerName}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {order.orderNumber} · {order.progressPercentage}%
                      </span>
                    </Link>
                    <StatusBadge status={order.currentStatus} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotifStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <span className={cn('mx-auto mb-2 block h-1.5 w-8 rounded-full', tone)} />
      <p className="text-h3 tabular-nums">{value}</p>
      <p className="text-caption text-muted-foreground">{label}</p>
    </div>
  );
}
