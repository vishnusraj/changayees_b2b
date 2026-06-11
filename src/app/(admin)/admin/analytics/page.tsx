'use client';

import * as React from 'react';
import {
  Eye,
  ClipboardList,
  Download,
  MessageCircle,
  MapPin,
  Users,
} from 'lucide-react';
import { apiGet } from '@/lib/admin-api';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';

interface Overview {
  days: number;
  totals: Record<string, number>;
  daily: { date: string; count: number }[];
  leadsBySource: Record<string, number>;
  topProducts: { slug: string; views: number }[];
}

const humanize = (s: string) =>
  s.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function AdminAnalyticsPage() {
  const [data, setData] = React.useState<Overview | null>(null);
  const [days, setDays] = React.useState('30');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoading(true);
    apiGet<Overview>(`/analytics/overview?days=${days}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [days]);

  const t = data?.totals ?? {};
  const sources = data ? Object.entries(data.leadsBySource).sort((a, b) => b[1] - a[1]) : [];
  const sourceMax = Math.max(1, ...sources.map(([, v]) => v));
  const dailyMax = Math.max(1, ...(data?.daily ?? []).map((d) => d.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">Analytics</h1>
        <Select
          aria-label="Date range"
          className="w-40"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          options={[
            { label: 'Last 7 days', value: '7' },
            { label: 'Last 30 days', value: '30' },
            { label: 'Last 90 days', value: '90' },
          ]}
        />
      </div>

      {loading ? (
        <LoadingState lines={8} />
      ) : !data ? (
        <Alert variant="danger">{error ?? 'Failed to load analytics'}</Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Product views" value={t['product_viewed'] ?? 0} icon={Eye} />
            <MetricCard label="RFQ submissions" value={t['rfq_submitted'] ?? 0} icon={ClipboardList} />
            <MetricCard label="Catalog downloads" value={t['catalog_downloaded'] ?? 0} icon={Download} />
            <MetricCard label="WhatsApp clicks" value={t['whatsapp_clicked'] ?? 0} icon={MessageCircle} />
            <MetricCard label="Tracking views" value={t['tracking_viewed'] ?? 0} icon={MapPin} />
            <MetricCard label="Leads created" value={t['lead_created'] ?? 0} icon={Users} />
          </div>

          {/* Activity over time */}
          <Card>
            <CardHeader>
              <CardTitle>Activity over time</CardTitle>
            </CardHeader>
            <CardContent>
              {data.daily.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="flex h-32 items-end gap-1">
                  {data.daily.map((d) => (
                    <div
                      key={d.date}
                      className="flex-1 rounded-t bg-primary/70 transition-all hover:bg-primary"
                      style={{ height: `${(d.count / dailyMax) * 100}%` }}
                      title={`${d.date}: ${d.count}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lead sources */}
            <Card>
              <CardHeader>
                <CardTitle>Lead sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">No leads in range.</p>
                ) : (
                  sources.map(([source, count]) => (
                    <div key={source} className="space-y-1">
                      <div className="flex justify-between text-caption">
                        <span className="text-muted-foreground">{humanize(source)}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-brand-teal"
                          style={{ width: `${(count / sourceMax) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Top products */}
            <Card>
              <CardHeader>
                <CardTitle>Top viewed products</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topProducts.length === 0 ? (
                  <p className="text-body-sm text-muted-foreground">No product views yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {data.topProducts.map((p) => (
                      <li key={p.slug} className="flex items-center justify-between py-2 text-body-sm">
                        <span className="truncate font-mono text-caption">{p.slug}</span>
                        <span className="font-semibold">{p.views}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
