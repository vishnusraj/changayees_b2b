import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { RfqWizard } from '@/components/rfq/rfq-wizard';
import { listCategories, getProductBySlug } from '@/features/products/product.service';
import { firstParam } from '@/lib/search-params';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Request a Quote',
  description:
    'Submit your bulk uniform requirements in a few quick steps and get a tailored quotation.',
  path: '/rfq',
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RfqPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const productSlug = firstParam(sp.product);

  const categories = await listCategories();
  let prefillProduct: string | undefined;
  if (productSlug) {
    const product = await getProductBySlug(productSlug);
    prefillProduct = product?.name ?? productSlug;
  }

  return (
    <Container className="py-6 md:py-10">
      <RfqWizard
        categories={categories.map((c) => c.name)}
        prefillProduct={prefillProduct}
      />
    </Container>
  );
}
