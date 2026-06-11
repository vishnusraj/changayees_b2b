import * as React from 'react';
import { cn } from '@/lib/utils';
import { Container } from './container';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Wrap children in a PageContainer (default true). */
  contained?: boolean;
  as?: 'section' | 'div';
}

/** SectionContainer — consistent vertical rhythm between page sections. */
export function Section({
  className,
  contained = true,
  as = 'section',
  children,
  ...props
}: SectionProps) {
  const Comp = as;
  return (
    <Comp className={cn('section', className)} {...props}>
      {contained ? <Container>{children}</Container> : children}
    </Comp>
  );
}
