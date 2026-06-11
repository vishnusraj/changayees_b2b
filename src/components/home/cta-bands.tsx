import Link from 'next/link';
import { Phone } from 'lucide-react';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';

/** CatalogCta — lead-gen band prompting catalog downloads. */
export function CatalogCta() {
  return (
    <Section>
      <div className="flex flex-col gap-5 rounded-2xl bg-secondary p-8 text-secondary-foreground md:flex-row md:items-center md:justify-between md:p-12">
        <div className="space-y-2">
          <h2 className="text-h2 text-secondary-foreground">
            Explore our product catalogs
          </h2>
          <p className="text-body text-secondary-foreground/80">
            Download detailed catalogs for schools, colleges, corporates, and
            more.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0">
          <Link href="/catalogs">Download Catalogs</Link>
        </Button>
      </div>
    </Section>
  );
}

/** ContactCta — primary conversion band (Request Quote / Call / WhatsApp). */
export function ContactCta() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;
  return (
    <Section>
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-navy p-8 text-center text-white md:p-14">
        <h2 className="text-h1 max-w-2xl text-white">
          Have a bulk uniform requirement?
        </h2>
        <p className="text-body-lg max-w-xl text-white/80">
          Get a tailored quotation within hours. No cart, no checkout — just
          procurement that works.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="secondary">
            <Link href="/rfq">Request a Quote</Link>
          </Button>
          {phone && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
            >
              <a href={`tel:${phone}`}>
                <Phone className="h-4 w-4" aria-hidden />
                Call Sales
              </a>
            </Button>
          )}
          <WhatsAppCTA
            size="lg"
            message="Hi, I have a bulk uniform requirement."
          />
        </div>
      </div>
    </Section>
  );
}
