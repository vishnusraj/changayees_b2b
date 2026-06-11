'use client';

import * as React from 'react';
import { TextField, PhoneField } from '@/components/form/text-field';
import { TextareaField } from '@/components/form/textarea-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';
import { WhatsAppCTA } from '@/components/navigation/whatsapp-cta';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * ProductInquiryForm — quick inquiry that captures a PRODUCT_INQUIRY lead via
 * POST /api/v1/inquiries. Used inside the product-detail inquiry drawer.
 */
export function ProductInquiryForm({
  productSlug,
  productName,
}: {
  productSlug: string;
  productName: string;
}) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [messageText, setMessageText] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || phone.trim().length < 7) return;

    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/v1/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          message: messageText,
          productSlug,
          productName,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'Could not send your inquiry.');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="Inquiry sent">
          Our team will reach out shortly. For an instant response, message us
          on WhatsApp.
        </Alert>
        <WhatsAppCTA
          fullWidth
          message={`Hi, I just inquired about ${productName}.`}
        />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextField
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={touched && !name.trim() ? 'Your name is required' : undefined}
      />
      <PhoneField
        label="Phone"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={
          touched && phone.trim().length < 7
            ? 'A valid phone number is required'
            : undefined
        }
      />
      <TextareaField
        label="Message"
        placeholder="Quantity, sizes, customization…"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      <Button type="submit" fullWidth loading={status === 'submitting'}>
        Send inquiry
      </Button>
    </form>
  );
}
