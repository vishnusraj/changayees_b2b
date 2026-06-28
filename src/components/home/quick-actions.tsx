import Link from 'next/link';
import {
  ClipboardList,
  PackageSearch,
  Download,
  Phone,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { whatsappHref } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  /** WhatsApp keeps its brand green; everything else uses the indigo accent. */
  green?: boolean;
}

/**
 * QuickActions — app-style action cards (mobile dashboard) that also read well
 * as a desktop band. Request Quote / Track / Catalog / Call / WhatsApp.
 */
export function QuickActions() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  const actions: QuickAction[] = [
    { label: 'Request Quote', href: '/rfq', icon: ClipboardList },
    { label: 'Track Order', href: '/track', icon: PackageSearch },
    { label: 'Catalogs', href: '/catalogs', icon: Download },
    {
      label: 'Call Us',
      href: phone ? `tel:${phone}` : '/contact',
      icon: Phone,
      external: Boolean(phone),
    },
    {
      label: 'WhatsApp',
      href: whatsappHref('Hi, I have a bulk uniform requirement.'),
      icon: MessageCircle,
      external: true,
      green: true,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {actions.map((action) => {
        const inner = (
          <>
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl ring-1 transition-colors duration-200',
                action.green
                  ? 'bg-whatsapp/10 text-whatsapp ring-whatsapp/15 group-hover:bg-whatsapp group-hover:text-whatsapp-foreground'
                  : 'bg-brand-subtle text-brand ring-brand/10 group-hover:bg-brand group-hover:text-brand-foreground',
              )}
            >
              <action.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-caption font-semibold">{action.label}</span>
          </>
        );
        const className =
          'focus-ring group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-premium transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-premium-hover active:scale-95';

        return action.external ? (
          <a
            key={action.label}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {inner}
          </a>
        ) : (
          <Link key={action.label} href={action.href} className={className}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
