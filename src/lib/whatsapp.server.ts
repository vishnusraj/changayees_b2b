import { getResolvedSettings } from '@/services/settings.service';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

/**
 * Resolve the public WhatsApp number for click-to-chat links from admin
 * settings — uses `whatsapp_number`, falling back to the contact phone — and
 * returns it normalized for wa.me. Returns '' when WhatsApp is disabled or no
 * number is set (callers then fall back to /contact).
 *
 * Server-only: reads settings (Prisma). Do not import from client components.
 */
export async function getWhatsAppNumber(): Promise<string> {
  const s = await getResolvedSettings();
  if (s.whatsapp_enabled === 'false') return '';
  return normalizeWhatsAppNumber(s.whatsapp_number || s.contact_phone);
}
