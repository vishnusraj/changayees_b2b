import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { IndustryCard } from '@/components/marketing/industry-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { listIndustries } from '@/features/industries/industry.service';
import { getIndustryIcon } from '@/lib/industry-content';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Industries',
  description:
    'Uniform procurement solutions tailored for schools, colleges, hospitals, hotels, corporates, and industry.',
  path: '/industries',
});

export default async function IndustriesPage() {
  const industries = await listIndustries();

  return (
    <Container className="py-6 md:py-10">
      <div className="mb-8 max-w-2xl space-y-2">
        <h1 className="text-h1">Industries we serve</h1>
        <p className="text-body-lg text-muted-foreground">
          Procurement tailored to how your sector actually works — from sizing
          and fabrics to delivery timelines.
        </p>
      </div>

      {industries.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((industry) => (
            <IndustryCard
              key={industry.slug}
              industry={{
                name: industry.name,
                slug: industry.slug,
                icon: getIndustryIcon(industry.slug),
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Industries coming soon"
          description="Get in touch and we’ll tailor a solution for your sector."
        />
      )}
    </Container>
  );
}
