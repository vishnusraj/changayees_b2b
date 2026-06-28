import Link from 'next/link';
import { ShieldCheck, Truck, Building2, ArrowRight } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { GlobalSearch } from '@/components/navigation/global-search';
import { getResolvedSettings } from '@/services/settings.service';

const STATS = [
  { icon: Building2, value: '500+', label: 'Institutions served' },
  { icon: Truck, value: '15-stage', label: 'Order tracking' },
  { icon: ShieldCheck, value: 'Pan-India', label: 'Delivery network' },
];

/**
 * Hero — desktop: premium enterprise landing (headline + CTAs + stat panel).
 * Mobile: app-dashboard intro with prominent search. Copy is CMS-driven.
 */
export async function Hero() {
  const s = await getResolvedSettings();
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Atmosphere: faint grid + indigo glow, both fading out toward edges. */}
      <div
        className="bg-grid mask-fade pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div
        className="glow-accent pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="glow-accent pointer-events-none absolute -left-40 top-32 h-[28rem] w-[28rem] rounded-full opacity-60 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-10 py-10 md:py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-5">
            <span className="text-overline inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              {s.home_hero_eyebrow}
            </span>
            <h1 className="text-display text-gradient">{s.home_hero_title}</h1>
            <p className="text-body-lg max-w-xl text-muted-foreground">
              {s.home_hero_subtitle}
            </p>

            {/* Mobile-prominent search (desktop uses the header search) */}
            <div className="lg:hidden">
              <GlobalSearch placeholder="Search uniforms, catalogs…" />
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button asChild variant="accent" size="lg">
                <Link href="/rfq">
                  Request a Quote
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/catalogs">Download Catalog</Link>
              </Button>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-brand" aria-hidden />
                  <div>
                    <dt className="text-body-sm font-semibold">{stat.value}</dt>
                    <dd className="text-caption text-muted-foreground">
                      {stat.label}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Premium stat panel — desktop only */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-8 text-white shadow-elevation-4 ring-1 ring-white/5">
              {/* inner indigo glow */}
              <div
                className="glow-accent pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-80 blur-2xl"
                aria-hidden
              />
              <div className="relative">
                <p className="text-overline text-brand">Why Changayees</p>
                <p className="text-h2 mt-2 max-w-sm text-white">
                  One supplier. Every uniform. Full transparency.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4">
                  {STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur"
                    >
                      <stat.icon className="h-5 w-5 text-brand" aria-hidden />
                      <p className="text-h4 mt-2 text-white">{stat.value}</p>
                      <p className="text-caption text-white/60">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
