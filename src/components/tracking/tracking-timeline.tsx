import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { getStatusMeta, TRACKING_COLOR_CLASSES } from '@/lib/order-status';
import type { OrderStatus } from '@/generated/prisma';

export interface TimelineEvent {
  status: OrderStatus;
  date: Date | string;
  note?: string | null;
}

/**
 * TrackingTimeline — vertical, chronological order history with coloured nodes
 * (Design System §16: vertical timeline, mobile-friendly).
 */
export function TrackingTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <ol className="relative space-y-6 pl-6">
      <span
        className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border"
        aria-hidden
      />
      {events.map((event, index) => {
        const meta = getStatusMeta(event.status);
        const colors = TRACKING_COLOR_CLASSES[meta.color];
        const isLatest = index === 0;
        return (
          <li key={`${event.status}-${index}`} className="relative">
            <span
              className={cn(
                'absolute -left-6 top-1 h-3.5 w-3.5 rounded-full ring-4 ring-background',
                colors.dot,
                isLatest && 'animate-pulse',
              )}
              aria-hidden
            />
            <div className="space-y-0.5">
              <p className="text-body-sm font-semibold text-foreground">
                {meta.label}
              </p>
              <p className="text-caption text-muted-foreground">
                {formatDateTime(event.date)}
              </p>
              {event.note && (
                <p className="text-body-sm pt-1 text-muted-foreground">
                  {event.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
