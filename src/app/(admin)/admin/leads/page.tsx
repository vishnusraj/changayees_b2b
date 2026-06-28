'use client';

import * as React from 'react';
import Link from 'next/link';
import { Download, Plus, Search } from 'lucide-react';
import { apiGet, type ApiMeta } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Drawer } from '@/components/ui/drawer';
import { DataTable, type Column } from '@/components/dashboard/data-table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/feedback/alert';
import {
  LeadAnalyticsCards,
  type LeadAnalyticsData,
} from '@/components/admin/lead/lead-analytics-cards';
import { CreateLeadForm } from '@/components/admin/lead/create-lead-form';
import { LEAD_STATUSES, LEAD_SOURCES } from '@/features/leads/lead-constants';
import { formatDate } from '@/lib/format';

interface LeadRow {
  id: string;
  leadNumber: string;
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  source: string;
  status: string;
  assignee: { id: string; name: string } | null;
  createdAt: string;
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = React.useState<LeadRow[]>([]);
  const [meta, setMeta] = React.useState<ApiMeta | null>(null);
  const [analytics, setAnalytics] = React.useState<LeadAnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState('');
  const [source, setSource] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);

  // Debounce search input.
  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const query = React.useMemo(() => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (source) params.set('source', source);
    if (search) params.set('search', search);
    params.set('page', String(page));
    return params.toString();
  }, [status, source, search, page]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<LeadRow[]>(`/leads?${query}`);
      setLeads(res.data);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    apiGet<LeadAnalyticsData>('/analytics/leads')
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null));
  }, []);

  const columns: Column<LeadRow>[] = [
    {
      header: 'Lead',
      cell: (row) => (
        <Link
          href={`/admin/leads/${row.id}`}
          className="font-medium text-brand hover:underline"
        >
          {row.name}
          <span className="block text-caption text-muted-foreground">
            {row.leadNumber}
          </span>
        </Link>
      ),
    },
    {
      header: 'Organization',
      cell: (row) => row.organization ?? '—',
      hideOnMobile: true,
    },
    { header: 'Source', cell: (row) => <StatusBadge status={row.source} /> },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Assignee',
      cell: (row) => row.assignee?.name ?? 'Unassigned',
      hideOnMobile: true,
    },
    {
      header: 'Created',
      cell: (row) => formatDate(row.createdAt),
      hideOnMobile: true,
    },
  ];

  const exportHref = `/api/v1/leads/export?${new URLSearchParams({
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(search ? { search } : {}),
  }).toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">Leads</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={exportHref}>
              <Download className="h-4 w-4" aria-hidden />
              Export
            </a>
          </Button>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            New Lead
          </Button>
        </div>
      </div>

      <LeadAnalyticsCards analytics={analytics} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name, phone, email…"
            aria-label="Search leads"
            className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3"
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="w-44"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All statuses', value: '' },
            ...LEAD_STATUSES.map((s) => ({ label: s.label, value: s.value })),
          ]}
        />
        <Select
          aria-label="Filter by source"
          className="w-44"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All sources', value: '' },
            ...LEAD_SOURCES.map((s) => ({ label: s.label, value: s.value })),
          ]}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <DataTable
        columns={columns}
        rows={leads}
        getRowKey={(row) => row.id}
        loading={loading}
        emptyTitle="No leads found"
        emptyDescription="Leads from RFQs, inquiries, and catalog downloads appear here."
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-body-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        side="right"
        title="New lead"
      >
        <CreateLeadForm
          onCreated={() => {
            setCreateOpen(false);
            setPage(1);
            load();
          }}
        />
      </Drawer>
    </div>
  );
}
