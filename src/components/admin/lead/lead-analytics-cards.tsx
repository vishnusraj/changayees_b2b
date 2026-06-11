'use client';

import { Users, Sparkles, Trophy, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/metric-card';

export interface LeadAnalyticsData {
  total: number;
  newLeads: number;
  won: number;
  conversionRate: number;
}

/** LeadAnalyticsCards — KPI tiles for the leads dashboard. */
export function LeadAnalyticsCards({
  analytics,
}: {
  analytics: LeadAnalyticsData | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard label="Total leads" value={analytics?.total ?? '—'} icon={Users} />
      <MetricCard label="New" value={analytics?.newLeads ?? '—'} icon={Sparkles} />
      <MetricCard label="Won" value={analytics?.won ?? '—'} icon={Trophy} />
      <MetricCard
        label="Conversion"
        value={analytics ? `${analytics.conversionRate}%` : '—'}
        icon={TrendingUp}
      />
    </div>
  );
}
