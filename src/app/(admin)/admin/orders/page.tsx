'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { apiGet, type ApiMeta } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { DataTable, type Column } from '@/components/dashboard/data-table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/feedback/alert';
import { ORDER_STATUS_OPTIONS } from '@/lib/order-status';
import { formatDate } from '@/lib/format';

interface OrderRow {
  id: string;
  orderNumber: string;
  trackingId: string;
  customerName: string;
  organization: string | null;
  phone: string;
  currentStatus: string;
  progressPercentage: number;
  expectedDelivery: string | null;
  manager: { id: string; name: string } | null;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
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
      const res = await apiGet<OrderRow[]>(`/orders?${query}`);
      setOrders(res.data);
      setMeta(res.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns: Column<OrderRow>[] = [
    {
      header: 'Order',
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          className="font-medium text-brand hover:underline"
        >
          {row.customerName}
          <span className="block text-caption text-muted-foreground">
            {row.orderNumber}
          </span>
        </Link>
      ),
    },
    {
      header: 'Tracking ID',
      cell: (row) => (
        <span className="font-mono text-caption">{row.trackingId}</span>
      ),
      hideOnMobile: true,
    },
    { header: 'Status', cell: (row) => <StatusBadge status={row.currentStatus} /> },
    {
      header: 'Progress',
      cell: (row) => `${row.progressPercentage}%`,
      align: 'right',
    },
    {
      header: 'Delivery',
      cell: (row) => formatDate(row.expectedDelivery),
      hideOnMobile: true,
    },
    {
      header: 'Manager',
      cell: (row) => row.manager?.name ?? '—',
      hideOnMobile: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">Orders</h1>
        <Button asChild variant="accent" size="sm">
          <Link href="/admin/orders/new">
            <Plus className="h-4 w-4" aria-hidden />
            New Order
          </Link>
        </Button>
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
            placeholder="Search order #, tracking ID, customer…"
            aria-label="Search orders"
            className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3"
          />
        </div>
        <Select
          aria-label="Filter by status"
          className="w-52"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          options={[{ label: 'All statuses', value: '' }, ...ORDER_STATUS_OPTIONS]}
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <DataTable
        columns={columns}
        rows={orders}
        getRowKey={(row) => row.id}
        loading={loading}
        emptyTitle="No orders yet"
        emptyDescription="Create an order to generate a tracking ID and start the timeline."
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
