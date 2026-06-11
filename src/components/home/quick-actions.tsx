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
  accent: string;
}

/**
 * QuickActions — app-style action cards (mobile dashboard) that also read well
 * as a desktop band. Request Quote / Track / Catalog / Call / WhatsApp.
 */
export function QuickActions() {
  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

  const actions: QuickAction[] = [
    {
      label: 'Request Quote',
      href: '/rfq',
      icon: ClipboardList,
      accent: 'bg-primary/10 text-primary',
    },
    {
      label: 'Track Order',
      href: '/track',
      icon: PackageSearch,
      accent: 'bg-status-dispatch/10 text-status-dispatch',
    },
    {
      label: 'Catalogs',
      href: '/catalogs',
      icon: Download,
      accent: 'bg-status-production/10 text-status-production',
    },
    {
      label: 'Call Us',
      href: phone ? `tel:${phone}` : '/contact',
      icon: Phone,
      external: Boolean(phone),
      accent: 'bg-brand-magenta/10 text-brand-magenta',
    },
    {
      label: 'WhatsApp',
      href: whatsappHref('Hi, I have a bulk uniform requirement.'),
      icon: MessageCircle,
      external: true,
      accent: 'bg-whatsapp/10 text-whatsapp',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {actions.map((action) => {
        const inner = (
          <>
            <span
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl',
                action.accent,
              )}
            >
              <action.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="text-caption font-semibold">{action.label}</span>
          </>
        );
        const className =
          'focus-ring flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center shadow-elevation-1 transition-shadow hover:shadow-elevation-2 active:scale-95';

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
