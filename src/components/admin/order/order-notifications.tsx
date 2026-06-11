'use client';

import * as React from 'react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { formatDateTime } from '@/lib/format';

interface Notif {
  id: string;
  templateName: string;
  message: string | null;
  status: string;
  retryCount: number;
  errorMessage: string | null;
  createdAt: string;
}

/** OrderNotifications — WhatsApp notification log for an order, with retry. */
export function OrderNotifications({ orderId }: { orderId: string }) {
  const [items, setItems] = React.useState<Notif[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    apiGet<Notif[]>(`/notifications/whatsapp?orderId=${orderId}`)
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [orderId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const retry = async (id: string) => {
    try {
      await apiSend(`/notifications/whatsapp/${id}/retry`, 'POST');
      load();
    } catch {
      // surfaced on next load
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-body-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-body-sm text-muted-foreground">
            No notifications yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-body-sm font-medium">
                    {n.templateName}
                  </span>
                  <StatusBadge status={n.status} />
                </div>
                <p className="text-caption text-muted-foreground">
                  {formatDateTime(n.createdAt)}
                  {n.retryCount > 0 ? ` · ${n.retryCount} retries` : ''}
                </p>
                {n.errorMessage && (
                  <p className="text-caption text-destructive">
                    {n.errorMessage}
                  </p>
                )}
                {n.status === 'FAILED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => retry(n.id)}
                  >
                    Retry
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
