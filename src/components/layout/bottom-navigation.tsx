'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, MapPin, FileText, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants';
import { useMobileShell } from '@/components/mobile/mobile-shell-context';

const ICONS = {
  '/': Home,
  '/products': Package,
  '/track': MapPin,
  '/catalogs': FileText,
  '/contact': Phone,
} as const;

/**
 * Persistent mobile bottom navigation (critical mobile component).
 * Hidden on desktop, and suppressed when a page-level StickyCTA is active so the
 * two bars never stack (layering rule — architecture §2.3).
 */
export function BottomNavigation() {
  const pathname = usePathname();
  const { stickyActive } = useMobileShell();

  if (stickyActive) return null;

  return (
    <nav
      aria-label="Primary mobile"
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.href as keyof typeof ICONS] ?? Home;
          const active =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95',
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon
                  className={cn('h-5 w-5', active && 'scale-110')}
                  aria-hidden
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
