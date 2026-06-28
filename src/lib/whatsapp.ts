/** Generic opener used when a click carries no specific context. */
export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi! I'd like to know more about Changayees uniforms.";

/**
 * Normalize a raw phone string into a WhatsApp-ready digit string.
 * Bare 10-digit numbers are assumed Indian and get the +91 country code.
 */
export function normalizeWhatsAppNumber(raw?: string | null): string {
  const digits = (raw ?? '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
}

/**
 * Build a WhatsApp click-to-chat link (wa.me) that opens a chat directly with a
 * prefilled, context-aware message. Pass `number` to override the build-time
 * env number (e.g. the admin-configured number resolved from settings). Only
 * falls back to /contact when no number is available anywhere.
 *
 * Pure — safe in both server and client components.
 */
export function whatsappHref(message?: string, number?: string): string {
  const num = normalizeWhatsAppNumber(
    number ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  );
  if (!num) return '/contact';
  const text = encodeURIComponent(message || DEFAULT_WHATSAPP_MESSAGE);
  return `https://wa.me/${num}?text=${text}`;
}
