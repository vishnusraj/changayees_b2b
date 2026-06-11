import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AppShellProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Slot rendered after the footer (e.g. bottom nav, floating actions). */
  overlays?: React.ReactNode;
  /** Extra bottom padding so content clears a mobile bottom nav. */
  hasBottomNav?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * AppShell — the application wrapper used by the public, admin, and tracking
 * surfaces. Composes header + scrollable content + footer + overlays.
 */
export function AppShell({
  header,
  footer,
  overlays,
  hasBottomNav = false,
  className,
  children,
}: AppShellProps) {
  return (
    <div className={cn('flex min-h-dvh flex-col', className)}>
      {header}
      <main className={cn('flex-1', hasBottomNav && 'pb-20 md:pb-0')}>
        {children}
      </main>
      {footer}
      {overlays}
    </div>
  );
}
