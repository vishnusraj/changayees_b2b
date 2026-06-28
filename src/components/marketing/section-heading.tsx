import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SectionHeading — editorial section title (uppercase, letter-spaced) with an
 * optional eyebrow and "view all" link.
 *
 * `align="center"` stacks everything centred (eyebrow → title → subtitle →
 * link), matching the modern monochrome reference; the default left layout
 * keeps the title and link on a single justified row.
 */
export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  href,
  linkLabel = 'View all',
  align = 'left',
  className,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  const centered = align === 'center';

  const link = href ? (
    <Link
      href={href}
      className={cn(
        'text-body-sm focus-ring shrink-0 items-center gap-1 rounded font-semibold text-foreground underline-offset-4 hover:underline',
        centered ? 'inline-flex' : 'hidden sm:inline-flex',
      )}
    >
      {linkLabel}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  ) : null;

  return (
    <div
      className={cn(
        'mb-8 gap-4',
        centered
          ? 'flex flex-col items-center text-center'
          : 'flex items-end justify-between',
        className,
      )}
    >
      <div className={cn('space-y-2', centered && 'max-w-2xl')}>
        {eyebrow && (
          <p className="text-overline text-muted-foreground">{eyebrow}</p>
        )}
        <h2 className="text-h2 font-bold uppercase tracking-[0.06em]">{title}</h2>
        {subtitle && (
          <p
            className={cn(
              'text-body text-muted-foreground',
              centered ? 'mx-auto max-w-xl' : 'max-w-2xl',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {link}
    </div>
  );
}
