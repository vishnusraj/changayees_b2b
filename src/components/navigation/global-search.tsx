'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * GlobalSearch — search input that routes to the search results page.
 * Autocomplete/suggestions are layered on in the discovery phase; this provides
 * the controlled input + submit behaviour.
 */
export function GlobalSearch({
  placeholder = 'Search products…',
  className,
  defaultValue = '',
}: {
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const [value, setValue] = React.useState(defaultValue);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className={cn('relative', className)} role="search">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-foreground placeholder:text-muted-foreground"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
