import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * GridSystem — responsive layout grid (4 cols mobile → 8 tablet → 12 desktop).
 * Children place themselves with `col-span-*` utilities.
 */
export function Grid({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('layout-grid', className)} {...props}>
      {children}
    </div>
  );
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: 'sm' | 'md' | 'lg';
  direction?: 'row' | 'col';
}

const gapMap = { sm: 'gap-2', md: 'gap-4', lg: 'gap-6' } as const;

/** Stack — simple flex layout helper for vertical/horizontal spacing. */
export function Stack({
  className,
  gap = 'md',
  direction = 'col',
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row items-center',
        gapMap[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
