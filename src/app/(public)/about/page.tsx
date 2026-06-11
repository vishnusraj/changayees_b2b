import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, Headphones, BadgeCheck } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { getResolvedSettings } from '@/services/settings.service';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'About Us',
  description:
    'Changayees is a mobile-first B2B procurement platform for institutional uniforms — built to make bulk uniform sourcing simple, transparent, and trackable.',
  path: '/about',
});

const VALUES = [
  {
    icon: BadgeCheck,
    title: 'Built for institutions',
    body: 'Purpose-made for schools, colleges, hospitals, hotels, and corporates procuring uniforms at scale — not a generic store.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent procurement',
    body: 'Clear product specs, fabric and sizing detail, and honest quotations — so you know exactly what you are ordering.',
  },
  {
    icon: Truck,
    title: 'Production you can track',
    body: 'Every order gets a tracking ID. Follow it from confirmation to delivery, with WhatsApp updates at each stage.',
  },
  {
    icon: Headphones,
    title: 'People, not tickets',
    body: 'A real team on WhatsApp for sizing help, customisation, reorders, and delivery questions.',
  },
];

export default async function AboutPage() {
  const s = await getResolvedSettings();

  return (
    <Container className="py-8 md:py-14">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <p className="text-body-sm font-semibold uppercase tracking-wide text-primary">
          About {s.company_name}
        </p>
        <h1 className="text-h1">{s.company_tagline}</h1>
        <p className="text-body-lg text-muted-foreground">
          {s.company_description}
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
        {VALUES.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-6 shadow-elevation-1"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-h4 mt-4">{title}</h2>
            <p className="text-body-sm mt-1.5 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-3xl space-y-4">
        <h2 className="text-h3">How we work</h2>
        <p className="text-body text-muted-foreground">
          Browse products by category or industry, request a quote with your
          exact requirements, and we respond with a tailored quotation. Once an
          order is confirmed, you get a tracking ID to follow production through
          to delivery — with updates over WhatsApp so you are never left guessing.
        </p>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondary px-6 py-10 text-center text-secondary-foreground">
        <h2 className="text-h3">Ready to procure with confidence?</h2>
        <p className="text-body-sm max-w-md text-secondary-foreground/70">
          Tell us your requirements and get a tailored quotation.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/rfq">Request a Quote</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
