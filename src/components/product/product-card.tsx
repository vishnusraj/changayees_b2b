import Image from 'next/image';
import Link from 'next/link';
import { Shirt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';
import { cn } from '@/lib/utils';
import type { ProductCardData } from './types';

/**
 * ProductCard — clean editorial product tile: image (zooms on hover), category
 * overline, name, MOQ, and the two procurement actions (Request Quote +
 * WhatsApp). Mobile-first, app-style.
 */
export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  return (
    <Card
      interactive
      className={cn('group flex flex-col overflow-hidden', className)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="focus-ring relative block aspect-[4/5] overflow-hidden bg-muted"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <Shirt className="h-8 w-8" aria-hidden />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.categoryName && (
          <span className="text-overline text-muted-foreground">
            {product.categoryName}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="focus-ring rounded">
          <h3 className="text-h4 line-clamp-2 transition-colors group-hover:text-foreground/70">
            {product.name}
          </h3>
        </Link>
        {typeof product.moq === 'number' && (
          <p className="text-body-sm text-muted-foreground">
            MOQ {product.moq} pcs
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <Button asChild size="sm" fullWidth>
            <Link href={`/rfq?product=${product.slug}`}>Request Quote</Link>
          </Button>
          <WhatsAppCTA
            size="sm"
            fullWidth
            label="WhatsApp"
            message={`Hi, I'm interested in ${product.name} (bulk order).`}
          />
        </div>
      </div>
    </Card>
  );
}
