import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** SectionHeading — consistent section title + optional "view all" link. */
export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = 'View all',
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex items-end justify-between gap-4', className)}>
      <div className="space-y-1">
        <h2 className="text-h2">{title}</h2>
        {subtitle && (
          <p className="text-body max-w-2xl text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-body-sm focus-ring hidden shrink-0 items-center gap-1 rounded font-semibold text-primary hover:underline sm:inline-flex"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
