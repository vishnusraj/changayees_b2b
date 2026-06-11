import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Container } from '@/components/layout/container';
import {
  Hero,
  QuickActions,
  FeaturedCategories,
  FeaturedIndustries,
  FeaturedProducts,
  CaseStudiesSection,
  TestimonialsSection,
  CatalogCta,
  ContactCta,
} from '@/components/home';
import {
  FEATURED_CATEGORIES,
  INDUSTRIES,
  FEATURED_PRODUCTS,
  CASE_STUDIES,
  TESTIMONIALS,
} from '@/lib/home-data';

// Homepage copy + footer are CMS-driven (DB reads) → render dynamically.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  description: SITE.description,
  path: '/',
});

/**
 * Homepage.
 *   Desktop = premium enterprise landing (hero panel, mega-nav, multi-column).
 *   Mobile  = native app dashboard (search-led hero, quick-action cards,
 *             horizontal rails, persistent bottom nav).
 * Content is placeholder today; the CMS phase swaps `home-data` for live data.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      {/* App-style quick actions, overlapping the hero edge */}
      <Container>
        <div className="py-8">
          <QuickActions />
        </div>
      </Container>

      <FeaturedCategories categories={FEATURED_CATEGORIES} />
      <FeaturedIndustries industries={INDUSTRIES} />
      <FeaturedProducts products={FEATURED_PRODUCTS} />
      <CaseStudiesSection caseStudies={CASE_STUDIES} />
      <TestimonialsSection testimonials={TESTIMONIALS} />
      <CatalogCta />
      <ContactCta />
    </>
  );
}
