import { MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/format';

/**
 * CustomerNoteCard — an update shown to the customer on the tracking page
 * (admin → customer; labelled to avoid the "who wrote this" ambiguity).
 */
export function CustomerNoteCard({
  message,
  date,
}: {
  message: string;
  date?: Date | string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-premium">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand ring-1 ring-brand/10">
        <MessageSquare className="h-4 w-4" aria-hidden />
      </span>
      <div className="space-y-1">
        <p className="text-overline text-muted-foreground">Update for you</p>
        <p className="text-body-sm text-foreground">{message}</p>
        {date && (
          <p className="text-caption text-muted-foreground">
            {formatDate(date)}
          </p>
        )}
      </div>
    </div>
  );
}
