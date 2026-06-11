/**
 * SEO helpers — canonical URLs, Open Graph / Twitter metadata, and JSON-LD
 * structured-data builders. Used across public pages.
 */
import type { Metadata } from 'next';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export const SITE_NAME = 'Changayees';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo/images.png`;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Build page Metadata with a canonical URL, Open Graph, and a Twitter card.
 * Pass a clean `path` (no query string) so filtered list pages canonicalize to
 * one URL.
 */
export function buildMetadata(input: {
  title?: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.image || DEFAULT_OG_IMAGE;

  return {
    ...(input.title ? { title: input.title } : {}),
    ...(input.description ? { description: input.description } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? 'website',
      url,
      siteName: SITE_NAME,
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
      images: [image],
    },
    ...(input.noindex ? { robots: { index: false, follow: false } } : {}),
  };
}

// ---------------------------------------------------------------------------
// JSON-LD structured data
// ---------------------------------------------------------------------------

export function organizationSchema(): object {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    description:
      'Mobile-first B2B procurement platform for institutional uniforms.',
  };
}

export function websiteSchema(): object {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Combined site-wide graph (Organization + WebSite). */
export function siteGraph(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(), websiteSchema()],
  };
}

export function productSchema(input: {
  name: string;
  description?: string | null;
  image?: string | null;
  sku: string;
  category?: string | null;
  path: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [input.image] } : {}),
    sku: input.sku,
    ...(input.category ? { category: input.category } : {}),
    brand: { '@type': 'Brand', name: SITE_NAME },
    url: absoluteUrl(input.path),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(input: {
  type?: 'BlogPosting' | 'Article';
  headline: string;
  description?: string | null;
  image?: string | null;
  datePublished?: string | null;
  path: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': input.type ?? 'Article',
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: [input.image] } : {}),
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    url: absoluteUrl(input.path),
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE },
    },
  };
}
