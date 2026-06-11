/** Build a wa.me deep link with an optional prefilled message. Pure — safe in
 *  both server and client components. */
export function whatsappHref(message?: string): string {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(
    /[^0-9]/g,
    '',
  );
  if (!number) return '/contact';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${number}${text}`;
}
