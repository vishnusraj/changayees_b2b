'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Side = 'left' | 'right' | 'bottom';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: Side;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const sideClasses: Record<Side, string> = {
  left: 'inset-y-0 left-0 h-full w-80 max-w-[85vw] data-[state=closed]:-translate-x-full',
  right:
    'inset-y-0 right-0 h-full w-80 max-w-[85vw] data-[state=closed]:translate-x-full',
  bottom:
    'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl data-[state=closed]:translate-y-full',
};

/**
 * Lightweight, dependency-free drawer (mobile filters / navigation / details).
 * Handles overlay click, Escape, and body scroll-lock. Mounted via portal.
 */
export function Drawer({
  open,
  onClose,
  side = 'right',
  title,
  children,
  className,
}: DrawerProps) {
  const [mounted, setMounted] = React.useState(false);

  const panelRef = React.useRef<HTMLDivElement>(null);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog; restore it to the trigger on close (a11y).
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.clearTimeout(t);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-black/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        data-state="open"
        className={cn(
          'absolute flex flex-col bg-background shadow-elevation-4 outline-none transition-transform duration-200 ease-out-soft',
          sideClasses[side],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-h4">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="focus-ring tap-target rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
