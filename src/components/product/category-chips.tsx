import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { CategoryNav } from './types';

/** CategoryChips — horizontal, scrollable category filter (app-style). */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: CategoryNav[];
  activeSlug?: string;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      <Chip href="/products" active={!activeSlug}>
        All
      </Chip>
      {categories.map((category) => (
        <Chip
          key={category.slug}
          href={`/products?category=${category.slug}`}
          active={category.slug === activeSlug}
        >
          {category.name}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-body-sm focus-ring shrink-0 rounded-full border px-4 py-2 font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
