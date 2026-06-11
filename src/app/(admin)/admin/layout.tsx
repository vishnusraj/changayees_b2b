import Link from 'next/link';
import { Logo } from '@/components/brand/logo';

/**
 * Admin portal shell — client-rendered area behind auth + RBAC (wired in the
 * auth phase). Sidebar + content, desktop-first (data-heavy).
 */
const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Orders', href: '/admin/orders' },
  { label: 'Leads', href: '/admin/leads' },
  { label: 'RFQs', href: '/admin/rfqs' },
  { label: 'Products', href: '/admin/products' },
  { label: 'CMS', href: '/admin/cms' },
  { label: 'Media', href: '/admin/media' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-muted/30">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-background md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo height={32} />
        </div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 p-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center border-b border-border bg-background px-6">
          <h1 className="text-sm font-semibold text-foreground">Admin</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
