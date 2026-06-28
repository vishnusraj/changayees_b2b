import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import {
  IndustryCard,
  type IndustryCardData,
} from '@/components/marketing/industry-card';

/** Industries — sector grid (2 cols mobile → 6 desktop). */
export function FeaturedIndustries({
  industries,
}: {
  industries: IndustryCardData[];
}) {
  return (
    <Section className="bg-muted/30">
      <SectionHeading
        eyebrow="Sectors"
        title="Industries we serve"
        subtitle="Tailored procurement for every sector."
        href="/industries"
        align="center"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {industries.map((industry) => (
          <IndustryCard key={industry.slug} industry={industry} />
        ))}
      </div>
    </Section>
  );
}
