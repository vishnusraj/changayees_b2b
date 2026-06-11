'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { MediaPicker } from '@/components/admin/media/media-picker';
import {
  type ResourceConfig,
  type ResourceField,
  PUBLISH_STATUS_OPTIONS,
  RECORD_STATUS_OPTIONS,
} from './resource-config';

type FormValues = Record<string, string | boolean>;

interface Option {
  label: string;
  value: string;
}

export function ResourceEditor({
  config,
  id,
}: {
  config: ResourceConfig;
  id: string;
}) {
  const router = useRouter();
  const isNew = id === 'new';
  const [values, setValues] = React.useState<FormValues>({});
  const [dynamicOptions, setDynamicOptions] = React.useState<
    Record<string, Option[]>
  >({});
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Initial defaults
  React.useEffect(() => {
    if (isNew) {
      const defaults: FormValues = {};
      for (const f of config.fields) {
        defaults[f.name] =
          f.type === 'checkbox'
            ? false
            : f.type === 'status'
              ? f.statusKind === 'record'
                ? 'ACTIVE'
                : 'DRAFT'
              : '';
      }
      setValues(defaults);
    }
  }, [isNew, config.fields]);

  // Load record for editing
  React.useEffect(() => {
    if (isNew) return;
    setLoading(true);
    apiGet<Record<string, unknown>>(`${config.apiPath}/${id}`)
      .then((res) => {
        const next: FormValues = {};
        for (const f of config.fields) {
          const v = res.data[f.name];
          if (f.type === 'checkbox') next[f.name] = Boolean(v);
          else if (Array.isArray(v)) next[f.name] = v.join(', ');
          else if (v == null) next[f.name] = '';
          else next[f.name] = String(v);
        }
        setValues(next);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [isNew, id, config.apiPath, config.fields]);

  // Fetch dynamic select options
  React.useEffect(() => {
    for (const f of config.fields) {
      if (!f.optionsEndpoint) continue;
      apiGet<Array<{ id?: string; name?: string; label?: string; value?: string }>>(
        f.optionsEndpoint,
      )
        .then((res) => {
          const opts = res.data.map((o) => ({
            label: o.name ?? o.label ?? '',
            value: o.id ?? o.value ?? '',
          }));
          setDynamicOptions((prev) => ({ ...prev, [f.name]: opts }));
          // Default a required select to the first option.
          if (f.required && opts.length > 0) {
            const first = opts[0];
            setValues((prev) =>
              prev[f.name] ? prev : { ...prev, [f.name]: first?.value ?? '' },
            );
          }
        })
        .catch(() => undefined);
    }
  }, [config.fields]);

  const set = (name: string, value: string | boolean) =>
    setValues((v) => ({ ...v, [name]: value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = {};
    for (const f of config.fields) {
      const v = values[f.name];
      if (f.type === 'checkbox') payload[f.name] = Boolean(v);
      else if (f.type === 'number') {
        if (v !== '' && v != null) payload[f.name] = Number(v);
      } else {
        payload[f.name] = v ?? '';
      }
    }

    try {
      if (isNew) {
        const res = await apiSend<{ id: string }>(config.apiPath, 'POST', payload);
        router.push(`${config.basePath}/${res.data.id}`);
      } else {
        await apiSend(`${config.apiPath}/${id}`, 'PUT', payload);
        router.push(config.basePath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete this ${config.label.toLowerCase()}?`)) return;
    try {
      await apiSend(`${config.apiPath}/${id}`, 'DELETE');
      router.push(config.basePath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    }
  };

  if (loading) return <LoadingState lines={6} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={config.basePath}
        className="text-body-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to {config.labelPlural.toLowerCase()}
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-h3">
          {isNew ? `New ${config.label}` : `Edit ${config.label}`}
        </h1>
        {!isNew && (
          <Button variant="outline" size="sm" onClick={remove}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <form onSubmit={save} className="space-y-4">
        {config.fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={values[field.name]}
            options={dynamicOptions[field.name]}
            onChange={(v) => set(field.name, v)}
          />
        ))}
        <Button type="submit" loading={saving}>
          {isNew ? 'Create' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  options,
  onChange,
}: {
  field: ResourceField;
  value: string | boolean | undefined;
  options?: Option[];
  onChange: (v: string | boolean) => void;
}) {
  const id = `field-${field.name}`;

  if (field.type === 'checkbox') {
    return (
      <Checkbox
        label={field.label}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    );
  }

  const selectOptions =
    field.type === 'status'
      ? field.statusKind === 'record'
        ? RECORD_STATUS_OPTIONS
        : PUBLISH_STATUS_OPTIONS
      : (options ?? field.options ?? []);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} required={field.required}>
        {field.label}
      </Label>
      {field.type === 'media' ? (
        <MediaPicker
          value={String(value ?? '')}
          onChange={(url) => onChange(url)}
        />
      ) : field.type === 'textarea' || field.type === 'richtext' ? (
        <Textarea
          id={id}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          rows={field.type === 'richtext' ? 10 : 3}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === 'select' || field.type === 'status' ? (
        <Select
          id={id}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          options={
            field.type === 'select' && !field.required
              ? [{ label: '—', value: '' }, ...selectOptions]
              : selectOptions
          }
        />
      ) : (
        <Input
          id={id}
          type={field.type === 'number' ? 'number' : 'text'}
          inputMode={field.type === 'number' ? 'numeric' : undefined}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {field.hint && (
        <p className="text-caption text-muted-foreground">{field.hint}</p>
      )}
    </div>
  );
}
