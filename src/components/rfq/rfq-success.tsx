import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';

/** RfqSuccess — confirmation screen with the reference number + next steps. */
export function RfqSuccess({ rfqNumber }: { rfqNumber: string }) {
  return (
    <div className="mx-auto max-w-md space-y-5 py-10 text-center">
      <span className="shadow-glow mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-subtle text-brand ring-1 ring-brand/15">
        <CheckCircle2 className="h-8 w-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-h2">RFQ submitted</h1>
        <p className="text-body text-muted-foreground">
          Thank you. Our team will review your requirements and get back to you
          shortly.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-premium">
        <p className="text-overline text-muted-foreground">
          Your reference number
        </p>
        <p className="text-h3 mt-1 font-mono tracking-wide text-brand">
          {rfqNumber}
        </p>
      </div>

      <WhatsAppCTA
        fullWidth
        label="Continue on WhatsApp"
        message={`Hi, I just submitted RFQ ${rfqNumber}.`}
      />

      <div className="flex gap-3">
        <Button asChild variant="outline" fullWidth>
          <Link href="/products">Browse products</Link>
        </Button>
        <Button asChild variant="accent" fullWidth>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
