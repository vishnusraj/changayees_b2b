import { Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TestimonialData {
  name: string;
  organization: string;
  designation?: string;
  quote: string;
}

/** TestimonialCard — social proof quote with attribution. */
export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: TestimonialData;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        'flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-premium transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-premium-hover',
        className,
      )}
    >
      <Quote className="h-6 w-6 text-brand/40" aria-hidden />
      <blockquote className="text-body flex-1 text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-subtle text-body-sm font-semibold text-brand ring-1 ring-brand/10">
          {testimonial.name.charAt(0)}
        </span>
        <span className="text-body-sm">
          <span className="block font-semibold text-foreground">
            {testimonial.name}
          </span>
          <span className="block text-muted-foreground">
            {testimonial.designation
              ? `${testimonial.designation}, ${testimonial.organization}`
              : testimonial.organization}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
