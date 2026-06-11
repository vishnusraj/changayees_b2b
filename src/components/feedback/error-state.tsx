import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ErrorState — friendly, actionable error with a recovery action
 * (Design System §25).
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again, or contact support if the problem persists.',
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-border px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="text-h4">{title}</h3>
      <p className="text-body-sm max-w-sm text-muted-foreground">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
