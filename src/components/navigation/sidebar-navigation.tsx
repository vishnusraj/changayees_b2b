'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

/** SidebarNavigation — admin portal primary navigation. */
export function SidebarNavigation({
  items,
  className,
}: {
  items: SidebarItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className={cn('flex flex-col gap-1', className)}>
      {items.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'text-body-sm focus-ring flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {Icon && <Icon className="h-4 w-4" aria-hidden />}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
