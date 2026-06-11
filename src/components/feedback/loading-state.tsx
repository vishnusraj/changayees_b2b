import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/** LoadingState — skeleton blocks (Design System: skeletons, not bare spinners). */
export function LoadingState({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)} aria-busy="true" aria-live="polite">
      <Skeleton className="h-6 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
