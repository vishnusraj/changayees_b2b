'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { FEATURED_CATEGORIES } from '@/lib/home-data';
import { cn } from '@/lib/utils';

const LINKS = [
  { label: 'Industries', href: '/industries' },
  { label: 'Catalogs', href: '/catalogs' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'About', href: '/about' },
];

/**
 * DesktopNav — primary desktop navigation with a Products mega-dropdown
 * (premium enterprise pattern). Closes on outside click / Escape / mouse-leave.
 */
export function DesktopNav() {
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
    <nav aria-label="Primary" className="flex items-center gap-6">
      <div
        ref={ref}
        className="relative"
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          onMouseEnter={() => setOpen(true)}
          className="text-body-sm focus-ring flex items-center gap-1 rounded font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Products
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute left-0 top-full z-50 w-[30rem] animate-fade-in pt-3"
          >
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-popover p-2 shadow-elevation-3">
              {FEATURED_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={category.slug}
                    href={`/products?category=${category.slug}`}
                    className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span>
                      <span className="text-body-sm block font-semibold">
                        {category.name}
                      </span>
                      <span className="text-caption line-clamp-1 block text-muted-foreground">
                        {category.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
              <Link
                href="/products"
                className="text-body-sm col-span-2 rounded-lg p-3 text-center font-semibold text-primary hover:bg-muted"
              >
                View all products →
              </Link>
            </div>
          </div>
        )}
      </div>

      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-body-sm focus-ring rounded font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
