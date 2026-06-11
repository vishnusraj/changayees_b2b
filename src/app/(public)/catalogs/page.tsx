import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { CatalogGrid } from '@/components/catalog/catalog-grid';
import { CatalogSearch } from '@/components/catalog/catalog-search';
import {
  listCatalogs,
  listCatalogCategories,
} from '@/features/catalogs/catalog.service';
import { firstParam } from '@/lib/search-params';
import { cn } from '@/lib/utils';
import { buildMetadata } from '@/lib/seo';
import { safe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Catalogs',
  description:
    'Download product catalogs and company profiles for institutional uniform procurement.',
  path: '/catalogs',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function chipHref(category: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (q) params.set('q', q);
  const qs = params.toString();
  return qs ? `/catalogs?${qs}` : '/catalogs';
}

export default async function CatalogsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = firstParam(sp.q);
  const category = firstParam(sp.category);

  const [catalogs, categories] = await Promise.all([
    safe(listCatalogs({ search: q, category }), [], 'listCatalogs'),
    safe(listCatalogCategories(), [], 'listCatalogCategories'),
  ]);

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-6 max-w-2xl space-y-2">
        <h1 className="text-h1">Catalog Center</h1>
        <p className="text-body-lg text-muted-foreground">
          Download detailed product catalogs and our company profile. Enter your
          details once and download anytime.
        </p>
      </div>

      <div className="mb-5">
        <CatalogSearch defaultValue={q ?? ''} />
      </div>

      {categories.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          <CategoryChip href={chipHref(undefined, q)} active={!category}>
            All
          </CategoryChip>
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              href={chipHref(cat, q)}
              active={cat === category}
            >
              {cat}
            </CategoryChip>
          ))}
        </div>
      )}

      <CatalogGrid catalogs={catalogs} />
    </Container>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'text-body-sm focus-ring shrink-0 rounded-full border px-4 py-2 font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
