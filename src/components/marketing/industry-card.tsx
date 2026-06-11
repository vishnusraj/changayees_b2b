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
        'focus-ring group flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-elevation-1 transition-colors hover:border-primary/40 hover:bg-primary/5',
        className,
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal transition-transform group-hover:scale-105">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <span className="text-body-sm font-semibold">{industry.name}</span>
    </Link>
  );
}
