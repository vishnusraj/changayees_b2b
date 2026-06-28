'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { LogOut } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

/**
 * Admin portal shell — sidebar + content, desktop-first (data-heavy).
 *
 * Auth pages (login / forgot / reset) render bare (no sidebar): they sit under
 * /admin/* so the middleware can leave them open, but they must not show the
 * authenticated chrome.
 */
const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'RFQs', href: '/admin/rfqs' },
  { label: 'Products', href: '/admin/cms/products' },
  { label: 'CMS', href: '/admin/cms' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Analytics', href: '/admin/analytics' },
  { label: 'Settings', href: '/admin/settings' },
];

const BARE_PATHS = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Auth pages: no sidebar, no header — they provide their own full-screen UI.
  if (BARE_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  async function handleLogout() {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo height={32} />
        </div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
          {ADMIN_NAV.map((item) => {
            const active =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'rounded-lg px-3 py-2 text-sm transition-colors ' +
                  (active
                    ? 'bg-brand-subtle font-semibold text-brand ring-1 ring-brand/10'
                    : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground')
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
          <h1 className="text-sm font-semibold text-foreground">Admin</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
