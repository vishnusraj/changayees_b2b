import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import { ProductCard } from '@/components/product/product-card';
import type { ProductCardData } from '@/components/product/types';

/** FeaturedProducts — rail on mobile, grid on desktop. */
export function FeaturedProducts({
  products,
}: {
  products: ProductCardData[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="Products of the week"
        title="Featured products"
        subtitle="Popular picks across categories."
        href="/products"
        align="center"
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="w-60 shrink-0 snap-start md:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Section>
  );
}
