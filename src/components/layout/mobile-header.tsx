'use client';

import * as React from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { SearchOverlay } from '@/components/mobile/search-overlay';
import { whatsappHref } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics-client';

/**
 * MobileHeader — app-style top bar (mobile only). Provides Search Access (opens
 * a full-screen search sheet) and WhatsApp Access (quick deep link). Pairs with
 * the BottomNavigation. Safe-area aware for notched devices.
 */
export function MobileHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);
  const waHref = whatsappHref();
  const waExternal = waHref.startsWith('http');

  return (
    <>
      <header className="pt-safe sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo priority height={40} />
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="focus-ring tap-target rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Search className="h-5 w-5" aria-hidden />
            </button>
            <a
              href={waHref}
              target={waExternal ? '_blank' : undefined}
              rel={waExternal ? 'noopener noreferrer' : undefined}
              onClick={() => trackEvent('whatsapp_clicked', { context: 'header' })}
              aria-label="Chat on WhatsApp"
              className="focus-ring tap-target rounded-full text-whatsapp hover:bg-whatsapp/10"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
