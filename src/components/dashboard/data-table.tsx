import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/empty-state';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  /** Hide this column in the mobile card view. */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => React.Key;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

/**
 * DataTable — desktop table that collapses to a stacked card list on mobile
 * (Design System §19: mobile uses card lists, never horizontal scroll).
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
}: DataTableProps<T>) {
  const alignClass = (align?: Column<T>['align']) =>
    align === 'right'
      ? 'text-right'
      : align === 'center'
        ? 'text-center'
        : 'text-left';

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((column, i) => (
                <th
                  key={i}
                  className={cn(
                    'text-caption px-4 py-3 font-semibold uppercase tracking-wide text-muted-foreground',
                    alignClass(column.align),
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-border last:border-0 hover:bg-muted/30"
              >
                {columns.map((column, i) => (
                  <td
                    key={i}
                    className={cn(
                      'text-body-sm px-4 py-3',
                      alignClass(column.align),
                      column.className,
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={getRowKey(row)}
            className="rounded-lg border border-border bg-card p-4"
          >
            <dl className="space-y-1.5">
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((column, i) => (
                  <div key={i} className="flex justify-between gap-3">
                    <dt className="text-caption text-muted-foreground">
                      {column.header}
                    </dt>
                    <dd className="text-body-sm text-right">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
