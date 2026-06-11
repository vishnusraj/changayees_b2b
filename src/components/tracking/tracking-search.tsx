'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField, PhoneField } from '@/components/form/text-field';

export interface TrackingSearchValues {
  trackingId: string;
  phone: string;
}

/**
 * TrackingSearch — Order ID + phone lookup (Design System / UX Screen 09).
 * Controlled by the parent via onSubmit; surfaces validation + error states.
 */
export function TrackingSearch({
  onSubmit,
  loading = false,
  error,
}: {
  onSubmit: (values: TrackingSearchValues) => void;
  loading?: boolean;
  error?: string;
}) {
  const [trackingId, setTrackingId] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [touched, setTouched] = React.useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!trackingId.trim() || !phone.trim()) return;
    onSubmit({ trackingId: trackingId.trim(), phone: phone.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextField
        label="Order ID"
        required
        placeholder="CHG-SCH-2026-00124"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        error={
          touched && !trackingId.trim() ? 'Order ID is required' : undefined
        }
      />
      <PhoneField
        label="Phone number"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={touched && !phone.trim() ? 'Phone number is required' : undefined}
      />
      {error && (
        <p className="text-body-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth loading={loading}>
        <Search className="h-4 w-4" aria-hidden />
        Track Order
      </Button>
    </form>
  );
}
