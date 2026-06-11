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
        'flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-elevation-1',
        className,
      )}
    >
      <Quote className="h-6 w-6 text-primary/30" aria-hidden />
      <blockquote className="text-body flex-1 text-foreground">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-body-sm font-semibold text-primary">
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
