'use client';

import * as React from 'react';
import { MoreHorizontal, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
}

/**
 * ActionMenu — row/entity actions dropdown (Edit / Delete / View / Assign).
 * Dependency-free; closes on outside click and Escape.
 */
export function ActionMenu({
  items,
  label = 'Actions',
}: {
  items: ActionMenuItem[];
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="focus-ring tap-target rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-5 w-5" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-elevation-3"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                role="menuitem"
                onClick={() => {
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  'text-body-sm flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-muted',
                  item.destructive && 'text-destructive hover:bg-destructive/10',
                )}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
