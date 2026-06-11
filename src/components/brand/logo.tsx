import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SITE } from '@/lib/constants';
import { brandAsset } from '@/lib/design-tokens';

/**
 * Changayees brand mark.
 *
 * NOTE: currently rendered from the supplied raster asset (/logo/images.png).
 * Per CHANGAYEES_FINAL_TECHNICAL_ARCHITECTURE.md (R-01 / M-02) this must be
 * replaced with an SVG kit (+ mono / reversed / favicon variants) before launch.
 */
export function Logo({
  className,
  width = 160,
  height = 48,
  priority = false,
}: {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${SITE.name} home`}
      className={cn('inline-flex items-center', className)}
    >
      <Image
        src={brandAsset.logo}
        alt={SITE.name}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-auto object-contain"
      />
    </Link>
  );
}
