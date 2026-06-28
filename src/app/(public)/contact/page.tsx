import type { Metadata } from 'next';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { getResolvedSettings } from '@/services/settings.service';
import { whatsappHref } from '@/lib/whatsapp';
import { getWhatsAppNumber } from '@/lib/whatsapp.server';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Get in touch with the Changayees team for bulk uniform procurement, quotations, sizing help, and order support.',
  path: '/contact',
});

export default async function ContactPage() {
  const s = await getResolvedSettings();
  const waNumber = await getWhatsAppNumber();
  const waHref = whatsappHref(
    'Hi, I have an enquiry about uniform procurement.',
    waNumber,
  );
  const waExternal = waHref.startsWith('http');

  const methods = [
    s.contact_phone && {
      icon: Phone,
      label: 'Call us',
      value: s.contact_phone,
      href: `tel:${s.contact_phone}`,
    },
    s.contact_email && {
      icon: Mail,
      label: 'Email us',
      value: s.contact_email,
      href: `mailto:${s.contact_email}`,
    },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href: string }[];

  return (
    <Container className="py-8 md:py-14">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h1 className="text-h1">Get in touch</h1>
        <p className="text-body-lg text-muted-foreground">
          Questions about products, bulk pricing, sizing, or an existing order?
          Our team is here to help.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {/* Quick contact methods */}
        <div className="space-y-4">
          {methods.map(({ icon: Icon, label, value, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-elevation-1 transition-colors hover:bg-muted"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="text-body-sm block text-muted-foreground">{label}</span>
                <span className="text-body block font-semibold text-foreground">
                  {value}
                </span>
              </span>
            </a>
          ))}

          <a
            href={waHref}
            target={waExternal ? '_blank' : undefined}
            rel={waExternal ? 'noopener noreferrer' : undefined}
            className="flex items-center gap-4 rounded-2xl border border-whatsapp/30 bg-whatsapp/5 p-5 shadow-elevation-1 transition-colors hover:bg-whatsapp/10"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-whatsapp/15 text-whatsapp">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="text-body-sm block text-muted-foreground">Chat on WhatsApp</span>
              <span className="text-body block font-semibold text-foreground">
                Fastest way to reach us
              </span>
            </span>
          </a>
        </div>

        {/* Address + hours */}
        <div className="space-y-4">
          {s.address && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-h4 mt-3">Visit us</h2>
              <p className="text-body-sm mt-1 whitespace-pre-line text-muted-foreground">
                {s.address}
              </p>
            </div>
          )}
          {s.business_hours && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-elevation-1">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="text-h4 mt-3">Business hours</h2>
              <p className="text-body-sm mt-1 text-muted-foreground">
                {s.business_hours}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl flex-col items-center justify-between gap-4 rounded-lg bg-neutral-900 px-6 py-8 text-center text-neutral-50 md:flex-row md:text-left">
        <div>
          <h2 className="text-h3">Have a bulk requirement?</h2>
          <p className="text-body-sm mt-1 text-neutral-300">
            Share your specs and get a tailored quotation.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="shrink-0 bg-white text-neutral-900 shadow-sm hover:bg-neutral-200"
        >
          <Link href="/rfq">Request a Quote</Link>
        </Button>
      </div>
    </Container>
  );
}
