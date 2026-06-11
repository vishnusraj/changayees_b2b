'use client';

import * as React from 'react';
import Link from 'next/link';
import { Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { StickyCTA } from '@/components/mobile/sticky-cta';
import { whatsappHref } from '@/lib/whatsapp';
import { ProductInquiryForm } from './product-inquiry-form';

/**
 * ProductActions — the product-detail conversion actions.
 *   Desktop: inline button row (Request Quote / WhatsApp / Call / Quick Inquiry).
 *   Mobile : a StickyCTA bar (Request Quote + WhatsApp) that takes over the
 *            bottom region for a native-app feel; Quick Inquiry opens a drawer.
 */
export function ProductActions({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const [inquiryOpen, setInquiryOpen] = React.useState(false);

  const rfqHref = `/rfq?product=${slug}`;
  const waMessage = `Hi, I'm interested in ${name} (bulk order). Please share a quote.`;
  const waHref = whatsappHref(waMessage);
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  return (
    <>
      {/* Desktop inline actions */}
      <div className="hidden flex-wrap gap-3 md:flex">
        <Button asChild size="lg">
          <Link href={rfqHref}>Request Quote</Link>
        </Button>
        <Button asChild size="lg" variant="whatsapp">
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </a>
        </Button>
        {phone && (
          <Button asChild size="lg" variant="outline">
            <a href={`tel:${phone}`}>
              <Phone className="h-4 w-4" aria-hidden />
              Call Sales
            </a>
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          onClick={() => setInquiryOpen(true)}
        >
          Quick Inquiry
        </Button>
      </div>

      {/* Mobile sticky CTA (suppresses bottom nav + floating WhatsApp) */}
      <StickyCTA>
        <Button asChild fullWidth>
          <Link href={rfqHref}>Request Quote</Link>
        </Button>
        <Button asChild fullWidth variant="whatsapp">
          <a href={waHref} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp
          </a>
        </Button>
      </StickyCTA>

      <Drawer
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        side="bottom"
        title="Quick inquiry"
      >
        <ProductInquiryForm productSlug={slug} productName={name} />
      </Drawer>
    </>
  );
}
