import * as React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyState — every empty state should guide the next action (Design System §24).
 */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-h4">{title}</h3>
      {description && (
        <p className="text-body-sm max-w-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
