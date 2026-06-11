'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';

/**
 * CatalogSearch — searches within the catalog center (updates ?q= on /catalogs,
 * preserving the active category). Submits on Enter.
 */
export function CatalogSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(defaultValue);

  const push = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    router.push(`/catalogs?${params.toString()}`, { scroll: false });
  };

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        push(value);
      }}
      className="relative max-w-md"
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search catalogs…"
        aria-label="Search catalogs"
        className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-foreground placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue('');
            push('');
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
