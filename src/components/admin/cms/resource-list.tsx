'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { apiGet, type ApiMeta } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/dashboard/data-table';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Alert } from '@/components/feedback/alert';
import { formatDate } from '@/lib/format';
import type { ResourceConfig } from './resource-config';

type Row = Record<string, unknown>;

/** Generic CMS list — search, paginated table, new/edit links. */
export function ResourceList({ config }: { config: ResourceConfig }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [meta, setMeta] = React.useState<ApiMeta | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
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

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    apiGet<Row[]>(`${config.apiPath}?${params.toString()}`)
      .then((res) => {
        setRows(res.data);
        setMeta(res.meta ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [config.apiPath, search, page]);

  const columns: Column<Row>[] = config.columns.map((col) => ({
    header: col.header,
    cell: (row) => {
      const value = row[col.field];
      if (col.field === config.titleField) {
        return (
          <Link
            href={`${config.basePath}/${String(row.id)}`}
            className="font-medium text-primary hover:underline"
          >
            {String(value ?? '—')}
          </Link>
        );
      }
      if (col.badge) return <StatusBadge status={String(value ?? '')} />;
      if (typeof value === 'string' && /\d{4}-\d{2}-\d{2}T/.test(value)) {
        return formatDate(value);
      }
      return value == null || value === '' ? '—' : String(value);
    },
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-h3">{config.labelPlural}</h1>
        <Button asChild size="sm">
          <Link href={`${config.basePath}/new`}>
            <Plus className="h-4 w-4" aria-hidden />
            New {config.label}
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={`Search ${config.labelPlural.toLowerCase()}…`}
          aria-label="Search"
          className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3"
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => String(row.id)}
        loading={loading}
        emptyTitle={`No ${config.labelPlural.toLowerCase()} yet`}
        emptyDescription={`Create your first ${config.label.toLowerCase()}.`}
      />

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </Button>
          <span className="text-body-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
