'use client';

import * as React from 'react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { SETTING_GROUPS } from '@/lib/cms/settings-schema';

export default function AdminSettingsPage() {
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    apiGet<Record<string, string>>('/cms/settings')
      .then((res) => setValues(res.data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload: Record<string, string> = {};
      for (const group of SETTING_GROUPS) {
        for (const field of group.fields) {
          payload[field.key] = values[field.key] ?? '';
        }
      }
      await apiSend('/cms/settings', 'PUT', payload);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState lines={8} />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-h3">Settings</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      {saved && <Alert variant="success">Settings saved.</Alert>}

      {SETTING_GROUPS.map((group) => (
        <Card key={group.id}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.fields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.key}
                    value={values[field.key] ?? ''}
                    placeholder={field.fallback}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={values[field.key] ?? ''}
                    placeholder={field.fallback}
                    onChange={(e) => set(field.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button loading={saving} onClick={save}>
        Save settings
      </Button>
    </div>
  );
}
