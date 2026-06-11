import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { absoluteUrl } from '@/lib/seo';

// Regenerate periodically (and degrade to static routes if the DB is down).
export const revalidate = 3600;

type Freq = MetadataRoute.Sitemap[number]['changeFrequency'];

function entry(
  path: string,
  lastModified: Date,
  changeFrequency: Freq,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

const STATIC_ROUTES: { path: string; freq: Freq; priority: number }[] = [
  { path: '/', freq: 'daily', priority: 1 },
  { path: '/products', freq: 'daily', priority: 0.9 },
  { path: '/industries', freq: 'weekly', priority: 0.7 },
  { path: '/catalogs', freq: 'weekly', priority: 0.7 },
  { path: '/case-studies', freq: 'weekly', priority: 0.6 },
  { path: '/blog', freq: 'weekly', priority: 0.6 },
  { path: '/about', freq: 'monthly', priority: 0.5 },
  { path: '/contact', freq: 'monthly', priority: 0.5 },
  { path: '/rfq', freq: 'monthly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) =>
    entry(r.path, now, r.freq, r.priority),
  );

  try {
    const [products, industries, blogs, caseStudies] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.industry.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blog.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
      prisma.caseStudy.findMany({
        where: { status: 'PUBLISHED', deletedAt: null },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    routes.push(
      ...products.map((p) => entry(`/products/${p.slug}`, p.updatedAt, 'weekly', 0.8)),
      ...industries.map((i) => entry(`/industries/${i.slug}`, i.updatedAt, 'monthly', 0.6)),
      ...blogs.map((b) => entry(`/blog/${b.slug}`, b.updatedAt, 'monthly', 0.6)),
      ...caseStudies.map((c) => entry(`/case-studies/${c.slug}`, c.updatedAt, 'monthly', 0.6)),
    );
  } catch (error) {
    console.error('[sitemap] DB unavailable, serving static routes only:', error);
  }

  return routes;
}
