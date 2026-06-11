'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { whatsappHref } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/analytics-client';

/**
 * WhatsAppCTA — reusable WhatsApp action (the primary communication channel).
 * Fires a whatsapp_clicked analytics beacon on click.
 */
export function WhatsAppCTA({
  message,
  label = 'Chat on WhatsApp',
  size,
  fullWidth,
  className,
  context = 'cta',
}: {
  message?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  context?: string;
}) {
  const href = whatsappHref(message);
  const external = href.startsWith('http');
  return (
    <Button
      asChild
      variant="whatsapp"
      size={size}
      fullWidth={fullWidth}
      className={cn(className)}
    >
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={() => trackEvent('whatsapp_clicked', { context })}
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        {label}
      </a>
    </Button>
  );
}
