import { CalendarClock, Package } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { getStatusMeta } from '@/lib/order-status';
import type { OrderStatus } from '@/generated/prisma';
import { ProgressTracker } from './progress-tracker';

/**
 * StatusCard — large, prominent current-status card (Design System §16:
 * high-priority component, immediate visibility).
 */
export function StatusCard({
  status,
  orderNumber,
  expectedDelivery,
}: {
  status: OrderStatus;
  orderNumber?: string;
  expectedDelivery?: Date | string | null;
}) {
  const meta = getStatusMeta(status);

  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand to-brand/70" />
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {orderNumber && (
              <p className="text-overline text-muted-foreground">
                Order {orderNumber}
              </p>
            )}
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-subtle text-brand ring-1 ring-brand/10">
                <Package className="h-5 w-5" aria-hidden />
              </span>
              <h1 className="text-h3 text-foreground">{meta.label}</h1>
            </div>
          </div>
        </div>

        <ProgressTracker status={status} />

        {expectedDelivery && (
          <div className="text-body-sm flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" aria-hidden />
            Expected delivery: {formatDate(expectedDelivery)}
          </div>
        )}
      </div>
    </Card>
  );
}
