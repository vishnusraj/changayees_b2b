'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';

/**
 * ProductFiltersDrawer — mobile "Filters" trigger + bottom drawer wrapping the
 * filter controls. Clear keeps the active category + sort; Apply just closes
 * (filters apply live).
 */
export function ProductFiltersDrawer({
  children,
  activeCount = 0,
}: {
  children: React.ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clear = () => {
    const params = new URLSearchParams();
    const category = searchParams.get('category');
    const sort = searchParams.get('sort');
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="text-caption ml-1 rounded-full bg-primary px-1.5 font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title="Filters"
      >
        {children}
        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={clear}>
            Clear
          </Button>
          <Button fullWidth onClick={() => setOpen(false)}>
            Apply
          </Button>
        </div>
      </Drawer>
    </>
  );
}
