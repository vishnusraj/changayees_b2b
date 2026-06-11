import Link from 'next/link';
import { ShieldCheck, Truck, Building2 } from 'lucide-react';
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
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background">
      <Container>
        <div className="grid items-center gap-10 py-10 md:py-16 lg:grid-cols-2 lg:py-24">
          <div className="space-y-5">
            <span className="text-overline inline-flex items-center rounded-full bg-brand-teal/10 px-3 py-1 text-brand-teal">
              {s.home_hero_eyebrow}
            </span>
            <h1 className="text-display">{s.home_hero_title}</h1>
            <p className="text-body-lg max-w-xl text-muted-foreground">
              {s.home_hero_subtitle}
            </p>

            {/* Mobile-prominent search (desktop uses the header search) */}
            <div className="lg:hidden">
              <GlobalSearch placeholder="Search uniforms, catalogs…" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/rfq">Request a Quote</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/catalogs">Download Catalog</Link>
              </Button>
            </div>

            <dl className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <stat.icon className="h-5 w-5 text-primary" aria-hidden />
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
            <div className="relative rounded-2xl border border-border bg-gradient-to-br from-brand-blue to-brand-navy p-8 text-white shadow-elevation-3">
              <p className="text-overline text-white/70">Why Changayees</p>
              <p className="text-h2 mt-2 max-w-sm text-white">
                One supplier. Every uniform. Full transparency.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/10 p-4 backdrop-blur"
                  >
                    <stat.icon className="h-5 w-5 text-white" aria-hidden />
                    <p className="text-h4 mt-2 text-white">{stat.value}</p>
                    <p className="text-caption text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
