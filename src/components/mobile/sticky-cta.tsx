'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useMobileShell } from './mobile-shell-context';

/**
 * StickyCTA — the page-level sticky bottom action bar (product detail, RFQ,
 * tracking). Mobile-only: on registering it suppresses the bottom nav + floating
 * WhatsApp so it is the single bottom element (native-app feel). On desktop the
 * page renders its actions inline instead.
 *
 * Usage (mobile):
 *   <StickyCTA>
 *     <Button fullWidth>Request Quote</Button>
 *     <WhatsAppCTA fullWidth />
 *   </StickyCTA>
 */
export function StickyCTA({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { registerSticky } = useMobileShell();

  React.useEffect(() => registerSticky(), [registerSticky]);

  return (
    <div
      className={cn(
        'pb-safe fixed inset-x-0 bottom-0 z-50 animate-slide-up border-t border-border bg-background/95 backdrop-blur md:hidden',
        className,
      )}
    >
      <div className="flex items-center gap-2 p-3">{children}</div>
    </div>
  );
}
