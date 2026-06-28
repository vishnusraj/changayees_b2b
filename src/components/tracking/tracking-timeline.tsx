import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { getStatusMeta } from '@/lib/order-status';
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
        const isLatest = index === 0;
        return (
          <li key={`${event.status}-${index}`} className="relative">
            <span
              className={cn(
                'absolute top-1 rounded-full ring-4 ring-background transition-colors',
                isLatest
                  ? '-left-[26px] h-4 w-4 bg-brand shadow-glow'
                  : '-left-6 top-1.5 h-3 w-3 bg-neutral-300',
              )}
              aria-hidden
            />
            <div className="space-y-0.5">
              <p
                className={cn(
                  'text-body-sm font-semibold',
                  isLatest ? 'text-brand' : 'text-foreground',
                )}
              >
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
