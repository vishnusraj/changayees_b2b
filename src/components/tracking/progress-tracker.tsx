import { cn } from '@/lib/utils';
import {
  getStatusMeta,
  getStatusProgress,
  TRACKING_COLOR_CLASSES,
} from '@/lib/order-status';
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
  const colors = TRACKING_COLOR_CLASSES[meta.color];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className={cn('text-body-sm font-semibold', colors.text)}>
          {meta.label}
        </span>
        <span className="text-body-sm font-semibold text-foreground">
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
          className={cn('h-full rounded-full transition-all', colors.bg)}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
