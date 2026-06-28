'use client';

import * as React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { apiGet, type ApiMeta } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/dashboard/data-table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/feedback/alert';
import { formatDate } from '@/lib/format';

const RFQ_STATUSES = [
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'UNDER_REVIEW' },
  { label: 'Quotation Sent', value: 'QUOTATION_SENT' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Closed', value: 'CLOSED' },
];

interface RfqRow {
  id: string;
  rfqNumber: string;
  organization: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  location: string | null;
  expectedQuantity: number | null;
  expectedDelivery: string | null;
  status: string;
  itemCount: number;
  leadId: string | null;
  createdAt: string;
}

export default function AdminRfqsPage() {
  const [rfqs, setRfqs] = React.useState<RfqRow[]>([]);
  const [meta, setMeta] = React.useState<ApiMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [status, setStatus] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

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
    if (search) params.set('search', search);
    params.set('page', String(page));
    return params.toString();
  }, [status, search, page]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<RfqRow[]>(`/rfqs?${query}`);
      setRfqs(res.data);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns: Column<RfqRow>[] = [
    {
      header: 'RFQ',
      cell: (row) =>
        row.leadId ? (
          <Link
            href={`/admin/leads/${row.leadId}`}
            className="font-medium text-brand hover:underline"
          >
            {row.contactPerson}
            <span className="block text-caption text-muted-foreground">
              {row.rfqNumber}
            </span>
          </Link>
        ) : (
          <span className="font-medium">
            {row.contactPerson}
            <span className="block text-caption text-muted-foreground">
              {row.rfqNumber}
            </span>
          </span>
        ),
    },
    { header: 'Organization', cell: (row) => row.organization, hideOnMobile: true },
    {
      header: 'Qty',
      cell: (row) => row.expectedQuantity ?? '—',
      hideOnMobile: true,
    },
    {
      header: 'Items',
      cell: (row) => row.itemCount || '—',
      hideOnMobile: true,
    },
    {
      header: 'Delivery by',
      cell: (row) => (row.expectedDelivery ? formatDate(row.expectedDelivery) : '—'),
      hideOnMobile: true,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Received',
      cell: (row) => formatDate(row.createdAt),
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">RFQs</h1>
      </div>

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
            placeholder="Search RFQ no., organization, contact…"
            aria-label="Search RFQs"
            className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3"
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="w-48"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[
            { label: 'All statuses', value: '' },
            ...RFQ_STATUSES,
          ]}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <DataTable
        columns={columns}
        rows={rfqs}
        getRowKey={(row) => row.id}
        loading={loading}
        emptyTitle="No RFQs found"
        emptyDescription="Quote requests submitted through the RFQ wizard appear here."
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
    </div>
  );
}
