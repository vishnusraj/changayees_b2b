import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { ProductGrid } from '@/components/product/product-grid';
import { CategoryChips } from '@/components/product/category-chips';
import { ProductFilterControls } from '@/components/product/product-filter-controls';
import { ProductFiltersDrawer } from '@/components/product/product-filters-drawer';
import { ProductSortSelect } from '@/components/product/product-sort-select';
import { ProductPagination } from '@/components/product/product-pagination';
import {
  listProducts,
  listCategories,
  getFilterFacets,
} from '@/features/products/product.service';
import { firstParam, listParam, intParam } from '@/lib/search-params';
import { buildMetadata } from '@/lib/seo';
import { safe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Products',
  description: 'Browse bulk institutional uniforms by category, fabric, and more.',
  path: '/products',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const category = firstParam(sp.category);
  const subcategories = listParam(sp.subcategory);
  const fabrics = listParam(sp.fabric);
  const colors = listParam(sp.color);
  const sort = firstParam(sp.sort);
  const page = intParam(sp.page, 1);
  const activeCount = subcategories.length + fabrics.length + colors.length;

  const [categories, facets, result] = await Promise.all([
    safe(listCategories(), [], 'listCategories'),
    safe(getFilterFacets(category), { subcategories: [], fabrics: [], colors: [] }, 'getFilterFacets'),
    safe(
      listProducts({ page, category, subcategories, fabrics, colors, sort }),
      { products: [], total: 0, page, limit: 24, totalPages: 1 },
      'listProducts',
    ),
  ]);

  const clearHref = category ? `/products?category=${category}` : '/products';

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-5 space-y-1">
        <h1 className="text-h2">Products</h1>
        <p className="text-body-sm text-muted-foreground">
          {result.total} products available
        </p>
      </div>

      <div className="mb-5">
        <CategoryChips categories={categories} activeSlug={category} />
      </div>

      {/* Mobile toolbar */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <ProductFiltersDrawer activeCount={activeCount}>
          <ProductFilterControls facets={facets} />
        </ProductFiltersDrawer>
        <ProductSortSelect className="ml-auto w-40" />
      </div>

      <div className="lg:flex lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-h4">Filters</h2>
              {activeCount > 0 && (
                <Link
                  href={clearHref}
                  className="text-body-sm font-semibold text-primary hover:underline"
                >
                  Clear
                </Link>
              )}
            </div>
            <ProductFilterControls facets={facets} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 hidden items-center justify-between lg:flex">
            <p className="text-body-sm text-muted-foreground">
              {result.total} results
            </p>
            <ProductSortSelect className="w-44" />
          </div>
          <ProductGrid products={result.products} />
          <ProductPagination page={result.page} totalPages={result.totalPages} />
        </div>
      </div>
    </Container>
  );
}
