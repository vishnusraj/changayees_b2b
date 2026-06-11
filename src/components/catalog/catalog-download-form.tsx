'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import {
  TextField,
  EmailField,
  PhoneField,
} from '@/components/form/text-field';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';

const STORAGE_KEY = 'cgs_lead';

type Status = 'idle' | 'submitting' | 'success' | 'error';

interface RememberedLead {
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
}

/**
 * CatalogDownloadForm — the lead-capture gate. Prefills from a remembered lead
 * (localStorage) so repeat downloads are near one-tap (reduces gate friction,
 * U-01) while still recording every download. Reveals the file on success.
 */
export function CatalogDownloadForm({
  catalogId,
  catalogTitle,
}: {
  catalogId: string;
  catalogTitle: string;
}) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [organization, setOrganization] = React.useState('');
  const [status, setStatus] = React.useState<Status>('idle');
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);

  // Prefill from a previously remembered lead.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as RememberedLead;
      setName(saved.name ?? '');
      setPhone(saved.phone ?? '');
      setEmail(saved.email ?? '');
      setOrganization(saved.organization ?? '');
    } catch {
      // ignore malformed storage
    }
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!name.trim() || phone.trim().length < 7) return;

    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/v1/catalogs/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogId, name, phone, email, organization }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'Could not prepare your download.');
      }
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ name, phone, email, organization }),
        );
      } catch {
        // ignore storage failures
      }
      setFileUrl(data.data.fileUrl as string);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success' && fileUrl) {
    return (
      <div className="space-y-4">
        <Alert variant="success" title="You're all set">
          Your catalog is ready to download.
        </Alert>
        <Button asChild fullWidth>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
            <Download className="h-4 w-4" aria-hidden />
            Download {catalogTitle}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-body-sm text-muted-foreground">
        Enter your details to download <strong>{catalogTitle}</strong>.
      </p>
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
      <Button type="submit" fullWidth loading={status === 'submitting'}>
        <Download className="h-4 w-4" aria-hidden />
        Get Download
      </Button>
    </form>
  );
}
