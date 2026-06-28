'use client';

import * as React from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductImage } from './types';

/**
 * ProductGallery — main image + thumbnail strip. On mobile the main image is a
 * swipeable, snap-scrolling track; thumbnails jump to an image on desktop.
 */
export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = React.useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImageOff className="h-10 w-10" aria-hidden />
      </div>
    );
  }

  const current = images[active] ?? images[0]!;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted shadow-premium">
        <Image
          src={current.url}
          alt={current.alt ?? 'Product image'}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                'focus-ring relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                index === active
                  ? 'border-brand'
                  : 'border-border hover:border-foreground/30',
              )}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
