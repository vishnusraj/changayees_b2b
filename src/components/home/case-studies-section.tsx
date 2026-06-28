import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import {
  CaseStudyCard,
  type CaseStudyCardData,
} from '@/components/marketing/case-study-card';

/** CaseStudiesSection — credibility rail/grid. */
export function CaseStudiesSection({
  caseStudies,
}: {
  caseStudies: CaseStudyCardData[];
}) {
  return (
    <Section className="bg-muted/30">
      <SectionHeading
        eyebrow="Case studies"
        title="Proven results"
        subtitle="How institutions procure with confidence."
        href="/case-studies"
        align="center"
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {caseStudies.map((caseStudy) => (
          <div
            key={caseStudy.slug}
            className="w-72 shrink-0 snap-start md:w-auto"
          >
            <CaseStudyCard caseStudy={caseStudy} />
          </div>
        ))}
      </div>
    </Section>
  );
}
