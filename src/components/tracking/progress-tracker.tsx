import { cn } from '@/lib/utils';
import { getStatusMeta, getStatusProgress } from '@/lib/order-status';
import type { OrderStatus } from '@/generated/prisma';

/** ProgressTracker — visual progress bar + percentage + current stage label. */
export function ProgressTracker({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const meta = getStatusMeta(status);
  const progress = getStatusProgress(status);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-semibold text-foreground">
          {meta.label}
        </span>
        <span className="text-body-sm font-semibold text-brand">
          {progress}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand/80 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
