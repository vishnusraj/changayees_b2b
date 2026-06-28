import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import {
  TestimonialCard,
  type TestimonialData,
} from '@/components/marketing/testimonial-card';

/** TestimonialsSection — social proof rail/grid. */
export function TestimonialsSection({
  testimonials,
}: {
  testimonials: TestimonialData[];
}) {
  return (
    <Section>
      <SectionHeading
        eyebrow="Testimonials"
        title="Trusted by institutions"
        align="center"
      />
      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="w-80 shrink-0 snap-start md:w-auto"
          >
            <TestimonialCard testimonial={testimonial} />
          </div>
        ))}
      </div>
    </Section>
  );
}
