import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { getResolvedSettings } from '@/services/settings.service';

const PRODUCT_LINKS = [
  { label: 'School Uniforms', href: '/products?category=school-uniforms' },
  { label: 'College Uniforms', href: '/products?category=college-uniforms' },
  { label: 'Corporate Uniforms', href: '/products?category=corporate-uniforms' },
  { label: 'Lab Coats', href: '/products?category=lab-coats' },
  { label: 'All Products', href: '/products' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Industries', href: '/industries' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

const RESOURCE_LINKS = [
  { label: 'Catalogs', href: '/catalogs' },
  { label: 'Request a Quote', href: '/rfq' },
  { label: 'Track Order', href: '/track' },
];

/** SiteFooter — premium enterprise footer; all content read from CMS settings. */
export async function SiteFooter() {
  const s = await getResolvedSettings();
  const socials = [
    { label: 'Facebook', href: s.social_facebook, icon: Facebook },
    { label: 'Instagram', href: s.social_instagram, icon: Instagram },
    { label: 'LinkedIn', href: s.social_linkedin, icon: Linkedin },
  ].filter((social) => Boolean(social.href));

  return (
    <footer className="border-t border-border bg-secondary text-secondary-foreground">
      <div className="container grid gap-10 py-14 md:grid-cols-12">
        <div className="space-y-4 md:col-span-4">
          <Logo height={36} />
          <p className="text-body-sm max-w-xs text-secondary-foreground/70">
            {s.footer_about}
          </p>
          <ul className="text-body-sm space-y-2 text-secondary-foreground/70">
            {s.contact_phone && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" aria-hidden />
                <a href={`tel:${s.contact_phone}`} className="hover:text-secondary-foreground">
                  {s.contact_phone}
                </a>
              </li>
            )}
            {s.contact_email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" aria-hidden />
                <a href={`mailto:${s.contact_email}`} className="hover:text-secondary-foreground">
                  {s.contact_email}
                </a>
              </li>
            )}
            {s.address && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden />
                {s.address}
              </li>
            )}
          </ul>
        </div>

        <FooterColumn title="Products" links={PRODUCT_LINKS} className="md:col-span-3" />
        <FooterColumn title="Company" links={COMPANY_LINKS} className="md:col-span-2" />
        <FooterColumn title="Resources" links={RESOURCE_LINKS} className="md:col-span-3" />
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <span className="text-caption text-secondary-foreground/60">
            © {new Date().getFullYear()} {s.company_name}. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-caption text-secondary-foreground/60 hover:text-secondary-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="text-caption text-secondary-foreground/60 hover:text-secondary-foreground">
              Terms
            </Link>
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-secondary-foreground/60 transition-colors hover:text-secondary-foreground"
                >
                  <social.icon className="h-4 w-4" aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-overline mb-4 text-secondary-foreground/50">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-body-sm text-secondary-foreground/70 transition-colors hover:text-secondary-foreground"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
