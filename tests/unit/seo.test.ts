import { describe, it, expect } from 'vitest';
import {
  absoluteUrl,
  buildMetadata,
  productSchema,
  breadcrumbSchema,
} from '@/lib/seo';

describe('absoluteUrl', () => {
  it('prefixes the site URL', () => {
    expect(absoluteUrl('/products')).toBe('http://localhost:3000/products');
  });
});

describe('buildMetadata', () => {
  it('sets a canonical URL', () => {
    const meta = buildMetadata({ title: 'Products', path: '/products' });
    expect(meta.alternates?.canonical).toBe('http://localhost:3000/products');
  });
  it('produces Open Graph + Twitter cards', () => {
    const meta = buildMetadata({
      title: 'X',
      description: 'desc',
      path: '/x',
      image: 'https://cdn/x.jpg',
    });
    expect(meta.openGraph?.images).toEqual([{ url: 'https://cdn/x.jpg' }]);
    // @ts-expect-error twitter card shape is loose in Next's type
    expect(meta.twitter?.card).toBe('summary_large_image');
  });
  it('applies noindex when requested', () => {
    const meta = buildMetadata({ path: '/search', noindex: true });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });
});

describe('structured data', () => {
  it('productSchema is a valid schema.org Product', () => {
    const schema = productSchema({
      name: 'Shirt',
      sku: 'SH-1',
      path: '/products/shirt',
    }) as Record<string, unknown>;
    expect(schema['@type']).toBe('Product');
    expect(schema.sku).toBe('SH-1');
    expect(schema.url).toBe('http://localhost:3000/products/shirt');
  });

  it('breadcrumbSchema numbers items from 1', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Products', path: '/products' },
    ]) as { itemListElement: { position: number; name: string }[] };
    expect(schema.itemListElement[0]?.position).toBe(1);
    expect(schema.itemListElement[1]?.name).toBe('Products');
  });
});
