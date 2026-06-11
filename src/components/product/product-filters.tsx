'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

/**
 * ProductFilters — responsive filter shell. Desktop: a left sidebar. Mobile: a
 * "Filters" button that opens a drawer. The actual filter controls are passed
 * as children so the component is reusable across listings.
 */
export function ProductFilters({
  children,
  onApply,
  onClear,
  activeCount = 0,
}: {
  children: React.ReactNode;
  onApply?: () => void;
  onClear?: () => void;
  activeCount?: number;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-20 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-h4">Filters</h2>
            {onClear && (
              <Button variant="link" size="sm" onClick={onClear}>
                Clear
              </Button>
            )}
          </div>
          {children}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="text-caption ml-1 rounded-full bg-primary px-1.5 text-primary-foreground">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} side="bottom" title="Filters">
        <div className="space-y-5">{children}</div>
        <div className="mt-6 flex gap-3">
          {onClear && (
            <Button variant="outline" fullWidth onClick={onClear}>
              Clear
            </Button>
          )}
          <Button
            fullWidth
            onClick={() => {
              onApply?.();
              setOpen(false);
            }}
          >
            Apply
          </Button>
        </div>
      </Drawer>
    </>
  );
}
