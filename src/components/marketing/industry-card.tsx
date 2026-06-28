import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IndustryCardData {
  name: string;
  slug: string;
  icon: LucideIcon;
}

/** IndustryCard — compact industry tile linking to its sector page. */
export function IndustryCard({
  industry,
  className,
}: {
  industry: IndustryCardData;
  className?: string;
}) {
  const Icon = industry.icon;
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className={cn(
        'focus-ring group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-premium transition-all duration-200 ease-out hover:-translate-y-1 hover:border-foreground/15 hover:shadow-premium-hover',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-subtle text-brand ring-1 ring-brand/10 transition-colors duration-200 group-hover:bg-brand group-hover:text-brand-foreground">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="text-body-sm font-semibold">{industry.name}</span>
    </Link>
  );
}
