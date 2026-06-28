'use client';

import * as React from 'react';
import { whatsappHref } from '@/lib/whatsapp';

/**
 * Carries the admin-configured WhatsApp number (resolved server-side from
 * settings) to client components, so every WhatsApp CTA opens a chat directly
 * with the right number without a build-time env var or page refresh.
 */
const WhatsAppNumberContext = React.createContext<string>('');

export function WhatsAppProvider({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <WhatsAppNumberContext.Provider value={number}>
      {children}
    </WhatsAppNumberContext.Provider>
  );
}

/** Build a context-aware wa.me link using the configured WhatsApp number. */
export function useWhatsAppHref(message?: string): string {
  const number = React.useContext(WhatsAppNumberContext);
  return whatsappHref(message, number);
}
