import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/navigation/global-search';
import { ProductGrid } from '@/components/product/product-grid';
import { EmptyState } from '@/components/feedback/empty-state';
import { searchProducts } from '@/features/products/product.service';
import { firstParam, intParam } from '@/lib/search-params';
import { safe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q)?.trim() ?? '';
  const page = intParam(sp.page, 1);

  const emptyResult = { products: [], total: 0, page: 1, limit: 24, totalPages: 1 };
  const result = q
    ? await safe(searchProducts(q, { page, limit: 24 }), emptyResult, 'searchProducts')
    : emptyResult;

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-6 max-w-xl space-y-3">
        <h1 className="text-h2">Search</h1>
        <GlobalSearch defaultValue={q} placeholder="Search products…" />
      </div>

      {!q ? (
        <EmptyState
          title="Search our catalog"
          description="Find uniforms by name, fabric, or category."
        />
      ) : result.products.length > 0 ? (
        <>
          <p className="text-body-sm mb-4 text-muted-foreground">
            {result.total} result{result.total === 1 ? '' : 's'} for “{q}”
          </p>
          <ProductGrid products={result.products} />
        </>
      ) : (
        <EmptyState
          title={`No results for “${q}”`}
          description="Try a different term or browse all products."
          action={
            <Button asChild>
              <Link href="/products">Browse products</Link>
            </Button>
          }
        />
      )}
    </Container>
  );
}
