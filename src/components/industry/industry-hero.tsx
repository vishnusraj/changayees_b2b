import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';

/**
 * IndustryHero — premium gradient hero for an industry, with an optional banner
 * image overlay (from the CMS) and the primary CTAs.
 */
export function IndustryHero({
  name,
  intro,
  bannerImage,
}: {
  name: string;
  intro: string;
  bannerImage?: string | null;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-brand-blue to-brand-navy text-white">
      {bannerImage && (
        <Image
          src={bannerImage}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
          priority
        />
      )}
      <Container>
        <div className="relative space-y-4 py-14 md:py-20">
          <span className="text-overline text-white/70">Industry</span>
          <h1 className="text-display text-white">{name} Uniforms</h1>
          <p className="text-body-lg max-w-2xl text-white/80">{intro}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild size="lg" variant="secondary">
              <Link href={`/rfq?industry=${encodeURIComponent(name)}`}>
                Request a Quote
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/catalogs">Download Catalog</Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
