'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, X, Clock } from 'lucide-react';

const QUICK_LINKS = [
  'School Uniforms',
  'Corporate Uniforms',
  'Lab Coats',
  'Sports Uniforms',
];

/**
 * SearchOverlay — full-screen mobile search sheet (native pattern).
 * Autofocuses the input, closes on Escape / back, and routes to the results
 * page on submit. Suggestions/recent-searches are wired in the discovery phase.
 */
export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const go = (q: string) => {
    const term = q.trim();
    if (!term) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-[70] flex animate-fade-in flex-col bg-background md:hidden"
    >
      <div className="pt-safe border-b border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            go(value);
          }}
          className="flex h-14 items-center gap-2 px-2"
          role="search"
        >
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="focus-ring tap-target rounded-lg text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="text-body h-11 w-full rounded-lg border border-input bg-muted/40 pl-9 pr-9 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {value && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="scroll-touch flex-1 overflow-y-auto p-4">
        <p className="text-overline mb-2 text-muted-foreground">Popular</p>
        <ul className="flex flex-col">
          {QUICK_LINKS.map((label) => (
            <li key={label}>
              <button
                onClick={() => go(label)}
                className="text-body flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left hover:bg-muted"
              >
                <Clock className="h-4 w-4 text-muted-foreground" aria-hidden />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
