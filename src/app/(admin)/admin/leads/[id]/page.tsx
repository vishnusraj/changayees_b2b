'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { LEAD_STATUSES } from '@/features/leads/lead-constants';
import { formatDateTime } from '@/lib/format';

interface LeadDetailData {
  id: string;
  leadNumber: string;
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  designation: string | null;
  industryName: string | null;
  source: string;
  status: string;
  assignee: { id: string; name: string } | null;
  notes: string | null;
  consentWhatsapp: boolean;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  action: string;
  actorName: string | null;
  newValue: unknown;
  createdAt: string;
}

interface Assignee {
  id: string;
  name: string;
  role: string;
}

export default function AdminLeadDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [lead, setLead] = React.useState<LeadDetailData | null>(null);
  const [activity, setActivity] = React.useState<ActivityItem[]>([]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [notes, setNotes] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savingNotes, setSavingNotes] = React.useState(false);

  const refreshActivity = React.useCallback(() => {
    apiGet<ActivityItem[]>(`/leads/${id}/activity`)
      .then((res) => setActivity(res.data))
      .catch(() => undefined);
  }, [id]);

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet<LeadDetailData>(`/leads/${id}`)
      .then((res) => {
        setLead(res.data);
        setNotes(res.data.notes ?? '');
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load lead'),
      )
      .finally(() => setLoading(false));
    refreshActivity();
    apiGet<Assignee[]>('/leads/assignees')
      .then((res) => setAssignees(res.data))
      .catch(() => setAssignees([]));
  }, [id, refreshActivity]);

  const onAfterMutation = (updated: LeadDetailData) => {
    setLead(updated);
    refreshActivity();
  };

  const changeStatus = async (status: string) => {
    try {
      const res = await apiSend<LeadDetailData>(
        `/leads/${id}/status`,
        'PATCH',
        { status },
      );
      onAfterMutation(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const changeAssignee = async (assignedTo: string) => {
    try {
      const res = await apiSend<LeadDetailData>(
        `/leads/${id}/assign`,
        'PATCH',
        { assignedTo: assignedTo || null },
      );
      onAfterMutation(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign lead');
    }
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await apiSend<LeadDetailData>(`/leads/${id}`, 'PUT', { notes });
      onAfterMutation(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return <LoadingState lines={6} />;
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <BackLink />
        <Alert variant="danger">{error ?? 'Lead not found'}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-h3">{lead.name}</h1>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-caption text-muted-foreground">
            {lead.leadNumber} · {lead.source}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${lead.phone}`}>
              <Phone className="h-4 w-4" aria-hidden />
              Call
            </a>
          </Button>
          {lead.email && (
            <Button asChild variant="outline" size="sm">
              <a href={`mailto:${lead.email}`}>
                <Mail className="h-4 w-4" aria-hidden />
                Email
              </a>
            </Button>
          )}
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: details + notes */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label="Phone" value={lead.phone} />
                <Field label="Email" value={lead.email ?? '—'} />
                <Field label="Organization" value={lead.organization ?? '—'} />
                <Field label="Designation" value={lead.designation ?? '—'} />
                <Field label="Industry" value={lead.industryName ?? '—'} />
                <Field
                  label="WhatsApp consent"
                  value={lead.consentWhatsapp ? 'Yes' : 'No'}
                />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this lead…"
                rows={5}
              />
              <Button size="sm" loading={savingNotes} onClick={saveNotes}>
                Save notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: status + assignment + activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium">Status</label>
                <Select
                  value={lead.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  options={LEAD_STATUSES.map((s) => ({
                    label: s.label,
                    value: s.value,
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-body-sm font-medium">Assigned to</label>
                <Select
                  value={lead.assignee?.id ?? ''}
                  onChange={(e) => changeAssignee(e.target.value)}
                  options={[
                    { label: 'Unassigned', value: '' },
                    ...assignees.map((u) => ({
                      label: `${u.name} (${u.role})`,
                      value: u.id,
                    })),
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-body-sm text-muted-foreground">
                  No activity yet.
                </p>
              ) : (
                <ol className="space-y-3">
                  {activity.map((item) => (
                    <li key={item.id} className="text-body-sm">
                      <span className="font-medium capitalize">
                        {item.action}
                      </span>
                      {item.actorName && (
                        <span className="text-muted-foreground">
                          {' '}
                          by {item.actorName}
                        </span>
                      )}
                      <span className="block text-caption text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/leads"
      className="text-body-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to leads
    </Link>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-caption text-muted-foreground">{label}</dt>
      <dd className="text-body-sm font-medium">{value}</dd>
    </div>
  );
}
