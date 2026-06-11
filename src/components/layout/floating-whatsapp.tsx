'use client';

import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMobileShell } from '@/components/mobile/mobile-shell-context';
import { trackEvent } from '@/lib/analytics-client';

/**
 * Globally-visible WhatsApp action (primary communication channel).
 * Desktop: floats bottom-right. Mobile: sits above the bottom nav, and hides
 * when a page-level StickyCTA is active (which carries its own WhatsApp action) —
 * the layering rule (architecture §2.3).
 */
export function FloatingWhatsApp() {
  const { stickyActive } = useMobileShell();
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const href = number
    ? `https://wa.me/${number.replace(/[^0-9]/g, '')}`
    : '/contact';

  return (
    <a
      href={href}
      target={number ? '_blank' : undefined}
      rel={number ? 'noopener noreferrer' : undefined}
      onClick={() => trackEvent('whatsapp_clicked', { context: 'floating' })}
      aria-label="Chat on WhatsApp"
      className={cn(
        'focus-ring fixed bottom-20 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-elevation-3 transition-transform hover:scale-105 active:scale-95 md:bottom-6',
        stickyActive && 'hidden md:inline-flex',
      )}
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </a>
  );
}
