import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { CaseStudyCard } from '@/components/marketing/case-study-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { listPublishedCaseStudies } from '@/features/cms/case-study.service';
import { buildMetadata } from '@/lib/seo';
import { safe } from '@/lib/safe-data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Case Studies',
  description: 'How institutions procure uniforms with confidence.',
  path: '/case-studies',
});

export default async function CaseStudiesPage() {
  const rows = await safe(listPublishedCaseStudies(), [], 'listPublishedCaseStudies');

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-h1">Case Studies</h1>
        <p className="text-body-lg text-muted-foreground">
          Real procurement outcomes across schools, hospitals, and corporates.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No case studies yet"
          description="Success stories will appear here soon."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <CaseStudyCard
              key={row.slug}
              caseStudy={{
                slug: row.slug,
                title: row.title,
                clientName: row.clientName ?? '',
                industry: row.industry?.name ?? '',
                result: row.results ? row.results.slice(0, 80) : 'Successful delivery',
              }}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
