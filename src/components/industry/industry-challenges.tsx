import { CheckCircle2 } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { SectionHeading } from '@/components/marketing/section-heading';
import type { IndustryChallenge } from '@/lib/industry-content';

/** IndustryChallenges — the "challenges we solve" grid. */
export function IndustryChallenges({
  challenges,
}: {
  challenges: IndustryChallenge[];
}) {
  if (challenges.length === 0) return null;

  return (
    <Section>
      <SectionHeading
        title="Challenges we solve"
        subtitle="Procurement built around how your institution actually operates."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {challenges.map((challenge) => (
          <div
            key={challenge.title}
            className="rounded-xl border border-border bg-card p-6 shadow-elevation-1"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="text-h4 mt-4">{challenge.title}</h3>
            <p className="text-body-sm mt-1 text-muted-foreground">
              {challenge.description}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
