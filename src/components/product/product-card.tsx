import Image from 'next/image';
import Link from 'next/link';
import { Shirt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';
import { cn } from '@/lib/utils';
import type { ProductCardData } from './types';

/**
 * ProductCard — image, title, MOQ, and the two procurement actions
 * (Request Quote + WhatsApp). Mobile-first, app-style.
 */
export function ProductCard({
  product,
  className,
}: {
  product: ProductCardData;
  className?: string;
}) {
  return (
    <Card interactive className={cn('flex flex-col overflow-hidden', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="focus-ring relative block aspect-[4/3] bg-muted"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 300px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <Shirt className="h-8 w-8" aria-hidden />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.categoryName && (
          <span className="text-overline text-muted-foreground">
            {product.categoryName}
          </span>
        )}
        <Link
          href={`/products/${product.slug}`}
          className="focus-ring rounded"
        >
          <h3 className="text-h4 line-clamp-2">{product.name}</h3>
        </Link>
        {product.shortDescription && (
          <p className="text-body-sm line-clamp-2 text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
        {typeof product.moq === 'number' && (
          <Badge variant="neutral" className="w-fit">
            MOQ {product.moq}
          </Badge>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
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
