import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IndustryTemplate } from '@/components/industry/industry-template';
import { getIndustryContent } from '@/lib/industry-content';
import { buildMetadata } from '@/lib/seo';
import {
  getIndustryBySlug,
  getIndustryRecommendedProducts,
  getIndustryCaseStudies,
} from '@/features/industries/industry.service';
import { safe } from '@/lib/safe-data';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = await safe(getIndustryBySlug(slug), null, 'getIndustryBySlug');
  if (!industry) return { title: 'Industry not found' };

  const description = industry.description ?? getIndustryContent(slug).intro;

  return buildMetadata({
    title: `${industry.name} Uniforms`,
    description,
    path: `/industries/${industry.slug}`,
    image: industry.bannerImage,
  });
}

export default async function IndustryDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const industry = await safe(getIndustryBySlug(slug), null, 'getIndustryBySlug');
  if (!industry) notFound();

  const content = getIndustryContent(slug);
  const [recommendedProducts, caseStudies] = await Promise.all([
    safe(getIndustryRecommendedProducts(slug), [], 'getIndustryRecommendedProducts'),
    safe(getIndustryCaseStudies(industry.id), [], 'getIndustryCaseStudies'),
  ]);

  return (
    <IndustryTemplate
      industry={industry}
      content={content}
      recommendedProducts={recommendedProducts}
      caseStudies={caseStudies}
    />
  );
}
