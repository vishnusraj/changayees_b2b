import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import { ProductCard } from '@/components/product/product-card';
import { CaseStudyCard } from '@/components/marketing/case-study-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { ContactCta } from '@/components/home/cta-bands';
import type { ProductCardData } from '@/components/product/types';
import type { CaseStudyCardData } from '@/components/marketing/case-study-card';
import type { IndustryContent } from '@/lib/industry-content';
import type { IndustryView } from '@/features/industries/industry.service';
import { IndustryHero } from './industry-hero';
import { IndustryChallenges } from './industry-challenges';

/**
 * IndustryTemplate — the single dynamic template that renders any industry page
 * from the DB record + content config + recommended products + case studies.
 * (UX Spec Screen 06: Hero, Challenges, Products, Case Studies, Contact CTA.)
 */
export function IndustryTemplate({
  industry,
  content,
  recommendedProducts,
  caseStudies,
}: {
  industry: IndustryView;
  content: IndustryContent;
  recommendedProducts: ProductCardData[];
  caseStudies: CaseStudyCardData[];
}) {
  return (
    <>
      <IndustryHero
        name={industry.name}
        intro={industry.description ?? content.intro}
        bannerImage={industry.bannerImage}
      />

      <IndustryChallenges challenges={content.challenges} />

      {/* Recommended products */}
      <Section className="bg-muted/30">
        <SectionHeading
          title={`Recommended for ${industry.name}`}
          subtitle="Popular products matched to your sector."
          href="/products"
          linkLabel="All products"
        />
        {recommendedProducts.length > 0 ? (
          <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
            {recommendedProducts.map((product) => (
              <div
                key={product.id}
                className="w-60 shrink-0 snap-start md:w-auto"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Products coming soon"
            description="Contact us for a tailored recommendation for your requirement."
          />
        )}
      </Section>

      {/* Case studies (only if present) */}
      {caseStudies.length > 0 && (
        <Section>
          <SectionHeading
            title="Success stories"
            subtitle={`How ${industry.name.toLowerCase()} procure with confidence.`}
            href="/case-studies"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {caseStudies.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </Section>
      )}

      <ContactCta />
    </>
  );
}
