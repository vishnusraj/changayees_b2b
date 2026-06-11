'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** ProductPagination — prev/next with page indicator (URL-driven). */
export function ProductPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    return `${pathname}?${params.toString()}`;
  };

  const base =
    'inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-body-sm font-medium';
  const disabled = 'pointer-events-none opacity-40';

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-3"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={cn(base, 'hover:bg-muted')}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </Link>
      ) : (
        <span className={cn(base, disabled)} aria-disabled>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Prev
        </span>
      )}

      <span className="text-body-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={cn(base, 'hover:bg-muted')}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : (
        <span className={cn(base, disabled)} aria-disabled>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
