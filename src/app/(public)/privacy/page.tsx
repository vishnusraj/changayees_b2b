import type { Metadata } from 'next';
import { Container } from '@/components/layout/container';
import { SITE } from '@/lib/constants';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Privacy Policy',
  description: `How ${SITE.name} collects, uses, and protects the information you share when requesting quotes, downloading catalogs, or tracking orders.`,
  path: '/privacy',
});

const SECTIONS = [
  {
    heading: 'Information we collect',
    body: `We collect the details you provide when you request a quote, submit an enquiry, download a catalog, or track an order — such as your name, institution, phone number, email, and the requirements you share. We do not operate customer accounts and do not collect payment information on this website.`,
  },
  {
    heading: 'How we use your information',
    body: `Your information is used solely to respond to your enquiry, prepare quotations, fulfil and track orders, and send order-related updates (including over WhatsApp where you have shared your number for that purpose). We do not sell your data.`,
  },
  {
    heading: 'WhatsApp & communications',
    body: `If you contact us or place an order, we may use your phone number to send procurement and order-status updates via WhatsApp or call. You can ask us to stop these messages at any time.`,
  },
  {
    heading: 'Analytics',
    body: `We collect anonymous usage data (such as page views and catalog downloads) to improve the website. This data is aggregated and is not used to identify individuals.`,
  },
  {
    heading: 'Data sharing',
    body: `We share your information only with our internal team and trusted partners involved in preparing quotations and fulfilling your order. We may disclose information where required by law.`,
  },
  {
    heading: 'Data retention',
    body: `We retain enquiry and order information for as long as needed to serve you and to meet our legal and business obligations.`,
  },
  {
    heading: 'Your choices',
    body: `You can request access to, correction of, or deletion of the information you have shared with us by contacting us through the details on our Contact page.`,
  },
  {
    heading: 'Contact',
    body: `For any privacy questions or requests, please reach out via our Contact page.`,
  },
];

export default function PrivacyPage() {
  return (
    <Container className="py-8 md:py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h1">Privacy Policy</h1>
        <p className="text-body-sm mt-2 text-muted-foreground">
          How {SITE.name} handles the information you share with us.
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
