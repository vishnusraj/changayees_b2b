import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageContainer — centres content and caps width at the 1440px max with
 * responsive gutters (Design System §9).
 */
export const Container = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('container-page', className)} {...props} />
));
Container.displayName = 'Container';
