'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/feedback/alert';
import {
  TextField,
  EmailField,
  PhoneField,
  NumberField,
  DateField,
} from '@/components/form/text-field';
import { TextareaField } from '@/components/form/textarea-field';
import { FileUpload } from '@/components/form/file-upload';
import { RfqProgress } from './rfq-progress';
import { RfqSuccess } from './rfq-success';

const DRAFT_KEY = 'cgs_rfq_draft';
const STEP_LABELS = [
  'Institution',
  'Products',
  'Quantity',
  'Attachments',
  'Review',
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RfqForm {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
  categories: string[];
  requirements: string;
  expectedQuantity: string;
  studentCount: string;
  staffCount: string;
  expectedDelivery: string;
  consentWhatsapp: boolean;
}

const EMPTY_FORM: RfqForm = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  location: '',
  categories: [],
  requirements: '',
  expectedQuantity: '',
  studentCount: '',
  staffCount: '',
  expectedDelivery: '',
  consentWhatsapp: false,
};

type Errors = Partial<Record<keyof RfqForm, string>>;

export function RfqWizard({
  categories,
  prefillProduct,
}: {
  categories: string[];
  prefillProduct?: string;
}) {
  const [form, setForm] = React.useState<RfqForm>(EMPTY_FORM);
  const [files, setFiles] = React.useState<File[]>([]);
  const [step, setStep] = React.useState(1);
  const [errors, setErrors] = React.useState<Errors>({});
  const [ready, setReady] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [rfqNumber, setRfqNumber] = React.useState<string | null>(null);

  // Hydrate from draft (or apply prefill) — runs once on the client.
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setForm({ ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<RfqForm>) });
      } else if (prefillProduct) {
        setForm((f) => ({
          ...f,
          requirements: `Interested in: ${prefillProduct}`,
        }));
      }
    } catch {
      // ignore malformed draft
    }
    setReady(true);
  }, [prefillProduct]);

  // Autosave the draft (text fields only) after hydration.
  React.useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    } catch {
      // ignore storage failures
    }
  }, [form, ready]);

  const update = (patch: Partial<RfqForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const key of Object.keys(patch)) delete next[key as keyof RfqForm];
      return next;
    });
  };

  const toggleCategory = (category: string) =>
    update({
      categories: form.categories.includes(category)
        ? form.categories.filter((c) => c !== category)
        : [...form.categories, category],
    });

  function validate(target: number): Errors {
    const e: Errors = {};
    if (target === 1) {
      if (!form.name.trim()) e.name = 'Institution name is required';
      if (!form.contactPerson.trim())
        e.contactPerson = 'Contact person is required';
      if (form.email && !EMAIL_RE.test(form.email))
        e.email = 'Enter a valid email';
      if (form.phone.trim().length < 7)
        e.phone = 'A valid phone number is required';
    }
    if (target === 2) {
      if (form.categories.length === 0 && !form.requirements.trim())
        e.requirements = 'Select a category or describe your requirement';
    }
    if (target === 3) {
      const qty = Number(form.expectedQuantity);
      if (!form.expectedQuantity || !Number.isFinite(qty) || qty <= 0)
        e.expectedQuantity = 'Enter an estimated quantity';
    }
    return e;
  }

  const next = () => {
    const e = validate(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(5, s + 1));
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    // Re-validate every gated step before submitting.
    const allErrors = { ...validate(1), ...validate(2), ...validate(3) };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      setStep(
        allErrors.name || allErrors.contactPerson || allErrors.email || allErrors.phone
          ? 1
          : allErrors.requirements
            ? 2
            : 3,
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/v1/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: form.name,
          contactPerson: form.contactPerson,
          email: form.email || undefined,
          phone: form.phone,
          location: form.location || undefined,
          requirements: form.requirements || undefined,
          expectedQuantity: form.expectedQuantity
            ? Number(form.expectedQuantity)
            : undefined,
          studentCount: form.studentCount
            ? Number(form.studentCount)
            : undefined,
          staffCount: form.staffCount ? Number(form.staffCount) : undefined,
          expectedDelivery: form.expectedDelivery || undefined,
          consentWhatsapp: form.consentWhatsapp,
          items: form.categories.map((c) => ({ customLabel: c })),
          files: files.map((f) => ({
            fileName: f.name,
            fileType: f.type,
            fileSize: f.size,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'Could not submit your RFQ.');
      }
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setRfqNumber(data.data.rfqNumber as string);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (rfqNumber) {
    return <RfqSuccess rfqNumber={rfqNumber} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-h2">Request a Quote</h1>
        {ready && (
          <span className="text-caption text-muted-foreground">
            Draft auto-saved
          </span>
        )}
      </div>

      <Card className="p-5 md:p-6">
        <RfqProgress step={step} labels={STEP_LABELS} />

        <div className="mt-6 min-h-[18rem]">
          {step === 1 && (
            <div className="space-y-4">
              <TextField
                label="Institution name"
                required
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                error={errors.name}
              />
              <TextField
                label="Contact person"
                required
                value={form.contactPerson}
                onChange={(e) => update({ contactPerson: e.target.value })}
                error={errors.contactPerson}
              />
              <EmailField
                label="Email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                error={errors.email}
              />
              <PhoneField
                label="Phone"
                required
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                error={errors.phone}
              />
              <TextField
                label="Location"
                placeholder="City / State"
                value={form.location}
                onChange={(e) => update({ location: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {categories.length > 0 && (
                <div className="space-y-2">
                  <p className="text-body-sm font-medium">
                    What are you looking for?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const active = form.categories.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => toggleCategory(category)}
                          aria-pressed={active}
                          className={cn(
                            'text-body-sm focus-ring rounded-full border px-3 py-1.5 font-medium transition-colors',
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border text-muted-foreground hover:text-foreground',
                          )}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <TextareaField
                label="Custom requirements"
                placeholder="Describe fabric, colours, customization, branding…"
                value={form.requirements}
                onChange={(e) => update({ requirements: e.target.value })}
                error={errors.requirements}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <NumberField
                label="Estimated quantity"
                required
                min={1}
                placeholder="e.g. 500"
                value={form.expectedQuantity}
                onChange={(e) => update({ expectedQuantity: e.target.value })}
                error={errors.expectedQuantity}
              />
              <div className="grid grid-cols-2 gap-4">
                <NumberField
                  label="Student count"
                  min={0}
                  value={form.studentCount}
                  onChange={(e) => update({ studentCount: e.target.value })}
                />
                <NumberField
                  label="Staff count"
                  min={0}
                  value={form.staffCount}
                  onChange={(e) => update({ staffCount: e.target.value })}
                />
              </div>
              <DateField
                label="Expected delivery"
                value={form.expectedDelivery}
                onChange={(e) => update({ expectedDelivery: e.target.value })}
              />
            </div>
          )}

          {step === 4 && (
            <FileUpload
              label="Attachments (optional)"
              hint="Reference designs, size charts, or specs. PDF, Excel, or images."
              value={files}
              onChange={setFiles}
            />
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-h4">Review your request</h2>
              <dl className="divide-y divide-border rounded-lg border border-border">
                <ReviewRow label="Institution" value={form.name} />
                <ReviewRow label="Contact" value={form.contactPerson} />
                <ReviewRow label="Phone" value={form.phone} />
                {form.email && <ReviewRow label="Email" value={form.email} />}
                {form.location && (
                  <ReviewRow label="Location" value={form.location} />
                )}
                {form.categories.length > 0 && (
                  <ReviewRow
                    label="Categories"
                    value={form.categories.join(', ')}
                  />
                )}
                {form.requirements && (
                  <ReviewRow label="Requirements" value={form.requirements} />
                )}
                <ReviewRow
                  label="Quantity"
                  value={form.expectedQuantity || '—'}
                />
                {form.expectedDelivery && (
                  <ReviewRow label="Delivery by" value={form.expectedDelivery} />
                )}
                {files.length > 0 && (
                  <ReviewRow
                    label="Attachments"
                    value={`${files.length} file(s)`}
                  />
                )}
              </dl>

              <Checkbox
                label="Send me order updates on WhatsApp"
                checked={form.consentWhatsapp}
                onChange={(e) =>
                  update({ consentWhatsapp: e.target.checked })
                }
              />

              {submitError && <Alert variant="danger">{submitError}</Alert>}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="outline" fullWidth onClick={back}>
              Back
            </Button>
          )}
          {step < 5 ? (
            <Button fullWidth onClick={next}>
              Continue
            </Button>
          ) : (
            <Button fullWidth loading={submitting} onClick={submit}>
              Submit RFQ
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 p-3">
      <dt className="text-body-sm text-muted-foreground">{label}</dt>
      <dd className="text-body-sm whitespace-pre-wrap text-right font-medium">
        {value}
      </dd>
    </div>
  );
}
