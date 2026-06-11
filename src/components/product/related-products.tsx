import { ProductCard } from './product-card';
import type { ProductCardData } from './types';

/** RelatedProducts — horizontally scrollable carousel (mobile-optimised). */
export function RelatedProducts({
  products,
  title = 'Related products',
}: {
  products: ProductCardData[];
  title?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-h3">{title}</h2>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-56 shrink-0 snap-start sm:w-64"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
