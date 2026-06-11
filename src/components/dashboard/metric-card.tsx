import * as React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  trend?: { direction: 'up' | 'down'; value: string };
}

/**
 * MetricCard / DashboardCard — a KPI tile for the admin dashboard
 * (Component Library §14).
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  trend,
}: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <p className="text-body-sm text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
      <p className="text-h2 mt-2 tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend && (
          <span
            className={cn(
              'text-caption inline-flex items-center gap-0.5 font-semibold',
              trend.direction === 'up' ? 'text-success' : 'text-danger',
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden />
            )}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-caption text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  );
}

/** Alias — the Component Library lists both names. */
export { MetricCard as DashboardCard };
