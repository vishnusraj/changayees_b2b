import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { DesktopNav } from '@/components/navigation/desktop-nav';
import { GlobalSearch } from '@/components/navigation/global-search';

/**
 * DesktopHeader — premium enterprise top navigation. Logo + mega-nav, global
 * search, Track Order, and the primary Request Quote CTA. Hidden on mobile,
 * where MobileHeader + BottomNavigation take over.
 */
export function DesktopHeader() {
  return (
    <header className="sticky top-0 z-40 hidden w-full border-b border-border bg-background/80 backdrop-blur md:block">
      <div className="container flex h-16 items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <Logo priority height={48} />
          <DesktopNav />
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch className="hidden w-56 lg:block" />
          <Link
            href="/track"
            className="text-body-sm focus-ring rounded font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Track Order
          </Link>
          <Button asChild variant="accent">
            <Link href="/rfq">Request Quote</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
