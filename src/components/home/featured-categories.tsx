import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import {
  CategoryCard,
  type CategoryCardData,
} from '@/components/marketing/category-card';

/** FeaturedCategories — horizontal rail on mobile, grid on desktop. */
export function FeaturedCategories({
  categories,
}: {
  categories: CategoryCardData[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="Catalog"
        title="Shop by category"
        subtitle="Bulk uniforms engineered for every institution."
        href="/products"
        linkLabel="All products"
        align="center"
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.slug}
            className="w-60 shrink-0 snap-start md:w-auto"
          >
            <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </Section>
  );
}
