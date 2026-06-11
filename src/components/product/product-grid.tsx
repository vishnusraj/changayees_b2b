import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';
import { ProductCard } from './product-card';
import type { ProductCardData } from './types';

export interface ProductGridProps {
  products: ProductCardData[];
  loading?: boolean;
  skeletonCount?: number;
}

/** ProductGrid — responsive collection of ProductCards with loading + empty states. */
export function ProductGrid({
  products,
  loading = false,
  skeletonCount = 6,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products found"
        description="Try adjusting your filters or contact us for a custom requirement."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
