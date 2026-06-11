import { Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';

/**
 * TrackingActions — quick support actions on the tracking page
 * (Call / WhatsApp / Email).
 */
export function TrackingActions({
  phone,
  email,
  whatsappMessage,
}: {
  phone?: string;
  email?: string;
  whatsappMessage?: string;
}) {
  const contactPhone = phone ?? process.env.NEXT_PUBLIC_CONTACT_PHONE ?? '';

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <WhatsAppCTA fullWidth label="WhatsApp" message={whatsappMessage} />
      {contactPhone && (
        <Button asChild variant="outline" fullWidth>
          <a href={`tel:${contactPhone}`}>
            <Phone className="h-4 w-4" aria-hidden />
            Call
          </a>
        </Button>
      )}
      {email && (
        <Button asChild variant="outline" fullWidth>
          <a href={`mailto:${email}`}>
            <Mail className="h-4 w-4" aria-hidden />
            Email
          </a>
        </Button>
      )}
    </div>
  );
}
