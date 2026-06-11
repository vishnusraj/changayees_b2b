import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryCardData {
  name: string;
  slug: string;
  description?: string;
  icon: LucideIcon;
}

/** CategoryCard — product category tile (icon-led, premium + app-friendly). */
export function CategoryCard({
  category,
  className,
}: {
  category: CategoryCardData;
  className?: string;
}) {
  const Icon = category.icon;
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className={cn(
        'focus-ring group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-elevation-1 transition-shadow hover:shadow-elevation-2',
        className,
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div className="flex-1 space-y-1">
        <h3 className="text-h4">{category.name}</h3>
        {category.description && (
          <p className="text-body-sm line-clamp-2 text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
      <span className="text-body-sm inline-flex items-center gap-1 font-semibold text-primary">
        Explore
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
