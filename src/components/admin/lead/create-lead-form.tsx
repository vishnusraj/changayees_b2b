'use client';

import * as React from 'react';
import { apiSend } from '@/lib/admin-api';
import {
  TextField,
  PhoneField,
  EmailField,
} from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';

/** CreateLeadForm — manual lead creation (admin). */
export function CreateLeadForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [organization, setOrganization] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || phone.trim().length < 7) return;

    setSubmitting(true);
    setError(null);
    try {
      await apiSend('/leads', 'POST', { name, phone, email, organization });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <TextField
        label="Name"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={touched && !name.trim() ? 'Name is required' : undefined}
      />
      <PhoneField
        label="Phone"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={
          touched && phone.trim().length < 7 ? 'Valid phone required' : undefined
        }
      />
      <EmailField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Organization"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
      />
      {error && <Alert variant="danger">{error}</Alert>}
      <Button type="submit" fullWidth loading={submitting}>
        Create lead
      </Button>
    </form>
  );
}
