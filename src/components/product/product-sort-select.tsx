'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/select';

const OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Name (A–Z)', value: 'name' },
  { label: 'Featured', value: 'featured' },
];

/** ProductSortSelect — URL-driven sort control. */
export function ProductSortSelect({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('sort') ?? 'newest';

  return (
    <Select
      aria-label="Sort products"
      className={className}
      options={OPTIONS}
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', e.target.value);
        params.delete('page');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }}
    />
  );
}
