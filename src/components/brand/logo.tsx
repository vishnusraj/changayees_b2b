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
/** Intrinsic aspect ratio of /logo/images.png (1536 × 611). */
const LOGO_ASPECT = 1536 / 611;

export function Logo({
  className,
  height = 40,
  priority = false,
}: {
  className?: string;
  height?: number;
  priority?: boolean;
}) {
  // Width is derived from the requested height so the box matches the asset's
  // real aspect ratio (prevents layout shift). The image is then constrained
  // to `height`, with width auto-scaling, and never overflows its container.
  const width = Math.round(height * LOGO_ASPECT);
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
        style={{ height, width: 'auto' }}
        className="block max-w-full object-contain"
      />
    </Link>
  );
}
