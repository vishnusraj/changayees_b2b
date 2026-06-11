import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/layout/container';
import { Badge } from '@/components/ui/badge';
import { ContactCta } from '@/components/home/cta-bands';
import { getPublishedCaseStudy } from '@/features/cms/case-study.service';
import { JsonLd } from '@/components/seo/json-ld';
import { buildMetadata, articleSchema } from '@/lib/seo';

export const revalidate = 3600;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const cs = await getPublishedCaseStudy(slug);
  if (!cs) return { title: 'Case study not found' };
  return buildMetadata({
    title: cs.title,
    description:
      cs.results ?? `How ${cs.clientName ?? 'an institution'} procures with Changayees.`,
    path: `/case-studies/${cs.slug}`,
    image: cs.featuredImage,
    type: 'article',
  });
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const cs = await getPublishedCaseStudy(slug);
  if (!cs) notFound();

  const sections = [
    { title: 'Challenge', body: cs.challenge },
    { title: 'Solution', body: cs.solution },
    { title: 'Results', body: cs.results },
  ].filter((s) => Boolean(s.body));

  return (
    <>
      <JsonLd
        data={articleSchema({
          type: 'Article',
          headline: cs.title,
          description: cs.results,
          image: cs.featuredImage,
          path: `/case-studies/${cs.slug}`,
        })}
      />
      <Container className="py-6 md:py-10">
        <article className="mx-auto max-w-3xl space-y-6">
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {cs.industry?.name && <Badge variant="primary">{cs.industry.name}</Badge>}
              {cs.location && <Badge variant="neutral">{cs.location}</Badge>}
            </div>
            <h1 className="text-h1">{cs.title}</h1>
            {cs.clientName && (
              <p className="text-body-lg text-muted-foreground">{cs.clientName}</p>
            )}
          </header>

          {cs.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cs.featuredImage}
              alt={cs.title}
              className="w-full rounded-xl object-cover"
            />
          )}

          {sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-h3">{section.title}</h2>
              <p className="text-body whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </article>
      </Container>

      <ContactCta />
    </>
  );
}
