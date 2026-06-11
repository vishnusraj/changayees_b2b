import Link from 'next/link';
import { ArrowRight, Quote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CaseStudyCardData {
  slug: string;
  title: string;
  clientName: string;
  industry: string;
  result: string;
}

/** CaseStudyCard — credibility card with a coloured header band. */
export function CaseStudyCard({
  caseStudy,
  className,
}: {
  caseStudy: CaseStudyCardData;
  className?: string;
}) {
  return (
    <Link
      href={`/case-studies/${caseStudy.slug}`}
      className={cn(
        'focus-ring group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1 transition-shadow hover:shadow-elevation-2',
        className,
      )}
    >
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-brand-blue to-brand-navy">
        <Quote className="h-8 w-8 text-white/40" aria-hidden />
        <Badge variant="outline" className="absolute left-3 top-3 border-white/30 text-white">
          {caseStudy.industry}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-h4 line-clamp-2">{caseStudy.title}</h3>
        <p className="text-body-sm text-muted-foreground">{caseStudy.clientName}</p>
        <p className="text-body-sm font-medium text-status-delivered">
          {caseStudy.result}
        </p>
        <span className="text-body-sm mt-auto inline-flex items-center gap-1 pt-2 font-semibold text-primary">
          Read case study
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
