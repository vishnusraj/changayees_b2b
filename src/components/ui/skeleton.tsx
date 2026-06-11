import { cn } from '@/lib/utils';

/** Skeleton loader. Design System: prefer skeletons over bare spinners. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('skeleton', className)} {...props} />;
}
