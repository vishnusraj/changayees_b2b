import { MobileShellProvider } from '@/components/mobile/mobile-shell-context';
import { JsonLd } from '@/components/seo/json-ld';
import { siteGraph } from '@/lib/seo';
import { DesktopHeader } from '@/components/layout/desktop-header';
import { MobileHeader } from '@/components/layout/mobile-header';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import { FloatingWhatsApp } from '@/components/layout/floating-whatsapp';
import { SiteFooter } from '@/components/layout/site-footer';

/**
 * Public app shell.
 *   Desktop = enterprise website (top header + footer).
 *   Mobile  = native-app feel: compact safe-area header, momentum-scroll
 *             content, persistent bottom nav, floating WhatsApp, and a sticky
 *             CTA system — all coordinated by MobileShellProvider so the bottom
 *             bars never stack (layering rule).
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileShellProvider>
      <JsonLd data={siteGraph()} />
      <a
        href="#main-content"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <div className="flex min-h-dvh flex-col">
        <DesktopHeader />
        <MobileHeader />

        {/* pb-20 keeps content clear of the mobile bottom nav / sticky CTA */}
        <main
          id="main-content"
          tabIndex={-1}
          className="scroll-touch flex-1 overflow-x-hidden pb-20 outline-none md:pb-0"
        >
          {children}
        </main>

        {/* Footer is desktop chrome — hidden on mobile for an app-like feel. */}
        <div className="hidden md:block">
          <SiteFooter />
        </div>

        <FloatingWhatsApp />
        <BottomNavigation />
      </div>
    </MobileShellProvider>
  );
}
