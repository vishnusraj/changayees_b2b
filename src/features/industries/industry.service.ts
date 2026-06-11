/**
 * Industries data layer — listing, detail, industry-scoped case studies, and
 * industry-based product recommendations (via the category mapping in
 * lib/industry-content). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { PublishStatus } from '@/generated/prisma';
import { getIndustryContent } from '@/lib/industry-content';
import { getProductsByCategorySlugs } from '@/features/products/product.service';
import type { CaseStudyCardData } from '@/components/marketing/case-study-card';
import type { ProductCardData } from '@/components/product/types';

export interface IndustryView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImage: string | null;
}

export async function listIndustries(): Promise<IndustryView[]> {
  const rows = await prisma.industry.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    orderBy: { name: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    bannerImage: row.bannerImage,
  }));
}

export async function getIndustryBySlug(
  slug: string,
): Promise<IndustryView | null> {
  const row = await prisma.industry.findFirst({
    where: { slug, status: 'ACTIVE', deletedAt: null },
  });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    bannerImage: row.bannerImage,
  };
}

/** Recommended products for an industry, via its mapped category slugs. */
export async function getIndustryRecommendedProducts(
  slug: string,
  limit = 8,
): Promise<ProductCardData[]> {
  const content = getIndustryContent(slug);
  return getProductsByCategorySlugs(content.categorySlugs, limit);
}

/** Published case studies tagged to this industry. */
export async function getIndustryCaseStudies(
  industryId: string,
  limit = 3,
): Promise<CaseStudyCardData[]> {
  const rows = await prisma.caseStudy.findMany({
    where: {
      industryId,
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
    },
    include: { industry: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    clientName: row.clientName ?? '',
    industry: row.industry?.name ?? '',
    result: row.results ? row.results.slice(0, 80) : 'Successful delivery',
  }));
}
