import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/navigation/breadcrumb';
import { ProductGallery } from '@/components/product/product-gallery';
import { ProductSpecifications } from '@/components/product/product-specifications';
import { RelatedProducts } from '@/components/product/related-products';
import { ProductActions } from '@/components/product/product-actions';
import { ProductTracker } from '@/components/analytics/product-tracker';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, productSchema, breadcrumbSchema } from '@/lib/seo';
import type {
  ProductSpec,
  ProductSpecGroup,
} from '@/components/product/types';
import {
  getProductBySlug,
  getRelatedProducts,
} from '@/features/products/product.service';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

const CUSTOMIZATION = [
  'Logo embroidery / printing',
  'Custom colours',
  'Full size sets',
  'Fabric & GSM options',
];

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product not found' };

  const description =
    product.shortDescription ?? `Request a bulk quote for ${product.name}.`;

  return buildMetadata({
    title: product.name,
    description,
    path: `/products/${product.slug}`,
    image: product.images[0]?.url ?? null,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);

  // Build specification groups
  const detailItems: ProductSpec[] = [
    { label: 'Product Code', value: product.productCode },
  ];
  if (product.fabricType)
    detailItems.push({ label: 'Fabric', value: product.fabricType });
  if (product.moq != null)
    detailItems.push({ label: 'Minimum Order', value: `${product.moq} units` });
  detailItems.push({ label: 'Category', value: product.categoryName });
  if (product.subcategoryName)
    detailItems.push({ label: 'Type', value: product.subcategoryName });

  const groups: ProductSpecGroup[] = [{ title: 'Details', items: detailItems }];

  const variantItems: ProductSpec[] = [];
  if (product.availableSizes.length)
    variantItems.push({
      label: 'Available sizes',
      value: product.availableSizes.join(', '),
    });
  if (product.availableColors.length)
    variantItems.push({
      label: 'Available colours',
      value: product.availableColors.join(', '),
    });
  if (variantItems.length)
    groups.push({ title: 'Sizes & Colours', items: variantItems });

  return (
    <Container className="py-6 md:py-10">
      <ProductTracker slug={product.slug} />
      <JsonLd
        data={productSchema({
          name: product.name,
          description: product.shortDescription,
          image: product.images[0]?.url ?? null,
          sku: product.productCode,
          category: product.categoryName,
          path: `/products/${product.slug}`,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
          { name: product.categoryName, path: `/products?category=${product.categorySlug}` },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <Breadcrumb
        className="mb-4"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          {
            label: product.categoryName,
            href: `/products?category=${product.categorySlug}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-overline text-muted-foreground">
              {product.categoryName}
            </span>
            <h1 className="text-h2">{product.name}</h1>
            {product.shortDescription && (
              <p className="text-body text-muted-foreground">
                {product.shortDescription}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {product.moq != null && <Badge>MOQ {product.moq}</Badge>}
            {product.fabricType && (
              <Badge variant="outline">{product.fabricType}</Badge>
            )}
          </div>

          <ProductActions slug={product.slug} name={product.name} />

          {product.description && (
            <p className="text-body text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h2 className="text-h4 mb-3">Customization available</h2>
            <ul className="text-body-sm grid gap-1.5 text-muted-foreground sm:grid-cols-2">
              {CUSTOMIZATION.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {product.brochureUrl && (
            <Button asChild variant="outline">
              <a
                href={product.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download Brochure
              </a>
            </Button>
          )}
        </div>
      </div>

      <section className="mt-10 space-y-3">
        <h2 className="text-h3">Specifications</h2>
        <ProductSpecifications groups={groups} />
      </section>

      <section className="mt-12">
        <RelatedProducts products={related} />
      </section>
    </Container>
  );
}
