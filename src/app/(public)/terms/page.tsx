import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { SITE } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Terms of Service',
  description: `The terms governing your use of the ${SITE.name} website and procurement services.`,
  path: '/terms',
});

const SECTIONS = [
  {
    heading: 'About these terms',
    body: `These terms govern your use of the ${SITE.name} website and the procurement services offered through it. By using the site or submitting an enquiry, you agree to these terms.`,
  },
  {
    heading: 'Our service',
    body: `${SITE.name} is a B2B platform for institutional uniform procurement. The website lets you browse products, request quotations, download catalogs, and track orders. Product listings, prices, and availability are indicative and confirmed only in a formal quotation.`,
  },
  {
    heading: 'Quotations & orders',
    body: `Requesting a quote does not create a binding order. An order is confirmed only when both parties agree on specifications, quantities, pricing, and delivery terms in writing. Minimum order quantities and customisation options vary by product.`,
  },
  {
    heading: 'Pricing',
    body: `Prices shown on the website, where present, are indicative. Final pricing depends on quantity, customisation, fabric, and delivery requirements, and is provided in your quotation.`,
  },
  {
    heading: 'Order tracking',
    body: `Order tracking is provided for your convenience using your tracking ID and phone verification. Status timelines are estimates and may change due to production or delivery factors.`,
  },
  {
    heading: 'Intellectual property',
    body: `All content on this website — including text, images, logos, and catalogs — belongs to ${SITE.name} or its licensors and may not be reproduced without permission.`,
  },
  {
    heading: 'Limitation of liability',
    body: `The website is provided "as is". To the extent permitted by law, ${SITE.name} is not liable for indirect or consequential losses arising from use of the website.`,
  },
  {
    heading: 'Changes to these terms',
    body: `We may update these terms from time to time. Continued use of the website constitutes acceptance of the updated terms.`,
  },
  {
    heading: 'Contact',
    body: `For any questions about these terms, please reach out via our Contact page.`,
  },
];

export default function TermsPage() {
  return (
    <Container className="py-8 md:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h1">Terms of Service</h1>
        <p className="text-body-sm mt-2 text-muted-foreground">
          The terms governing your use of {SITE.name}.
        </p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map(({ heading, body }) => (
            <section key={heading} className="space-y-2">
              <h2 className="text-h4">{heading}</h2>
              <p className="text-body text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
