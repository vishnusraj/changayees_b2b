import { Logo } from '@/components/brand/logo';
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp';

/**
 * Order-tracking portal shell — minimal, no login, SSR (architecture §6).
 * Deliberately lightweight: no full site nav, app-like single-column focus.
 */
export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <header className="flex h-14 items-center border-b border-border bg-background px-4">
        <Logo height={30} />
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {children}
      </main>
      <FloatingWhatsApp />
    </div>
  );
}
