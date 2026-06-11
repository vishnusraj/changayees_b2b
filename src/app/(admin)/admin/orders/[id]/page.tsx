'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/feedback/alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { StatusCard } from '@/components/tracking/status-card';
import { TrackingTimeline } from '@/components/tracking/tracking-timeline';
import { OrderNotifications } from '@/components/admin/order/order-notifications';
import { ORDER_STATUS_OPTIONS } from '@/lib/order-status';
import { formatDateTime } from '@/lib/format';
import type { OrderStatus } from '@/generated/prisma';

interface OrderItemRow {
  id: string;
  productName: string | null;
  itemLabel: string | null;
  quantity: number;
  remarks: string | null;
}
interface TimelineRow {
  id: string;
  status: OrderStatus;
  customerNote: string | null;
  internalNote: string | null;
  updatedByName: string | null;
  createdAt: string;
}
interface CustomerNoteRow {
  id: string;
  message: string;
  visibleToCustomer: boolean;
  createdByName: string | null;
  createdAt: string;
}
interface OrderDetailData {
  id: string;
  orderNumber: string;
  trackingId: string;
  customerName: string;
  organization: string | null;
  phone: string;
  email: string | null;
  currentStatus: OrderStatus;
  progressPercentage: number;
  expectedDelivery: string | null;
  consentWhatsapp: boolean;
  trackingToken: string | null;
  items: OrderItemRow[];
  timeline: TimelineRow[];
  customerNotes: CustomerNoteRow[];
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';

  const [order, setOrder] = React.useState<OrderDetailData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // status updater
  const [status, setStatus] = React.useState<string>('');
  const [customerNote, setCustomerNote] = React.useState('');
  const [internalNote, setInternalNote] = React.useState('');
  const [sendNotification, setSendNotification] = React.useState(true);
  const [savingStatus, setSavingStatus] = React.useState(false);

  // note adder
  const [noteText, setNoteText] = React.useState('');
  const [noteVisible, setNoteVisible] = React.useState(true);
  const [savingNote, setSavingNote] = React.useState(false);

  const [copied, setCopied] = React.useState(false);

  const apply = (data: OrderDetailData) => {
    setOrder(data);
    setStatus(data.currentStatus);
  };

  React.useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet<OrderDetailData>(`/orders/${id}`)
      .then((res) => apply(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load order'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const saveStatus = async () => {
    setSavingStatus(true);
    setError(null);
    try {
      const res = await apiSend<OrderDetailData>(
        `/orders/${id}/status`,
        'PATCH',
        { status, customerNote, internalNote, sendNotification },
      );
      apply(res.data);
      setCustomerNote('');
      setInternalNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await apiSend<OrderDetailData>(`/orders/${id}/notes`, 'POST', {
        message: noteText,
        visibleToCustomer: noteVisible,
      });
      apply(res.data);
      setNoteText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const trackingUrl =
    order?.trackingToken && typeof window !== 'undefined'
      ? `${window.location.origin}/track/${order.trackingToken}`
      : '';

  const copyLink = () => {
    if (!trackingUrl) return;
    navigator.clipboard?.writeText(trackingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  if (loading) return <LoadingState lines={6} />;
  if (!order)
    return (
      <div className="space-y-4">
        <BackLink />
        <Alert variant="danger">{error ?? 'Order not found'}</Alert>
      </div>
    );

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-h3">{order.customerName}</h1>
          <StatusBadge status={order.currentStatus} />
        </div>
        <p className="text-caption text-muted-foreground">
          {order.orderNumber} · {order.organization ?? '—'} · {order.phone}
        </p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <StatusCard
        status={order.currentStatus}
        orderNumber={order.orderNumber}
        expectedDelivery={order.expectedDelivery}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Update status */}
          <Card>
            <CardHeader>
              <CardTitle>Update status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={ORDER_STATUS_OPTIONS}
                aria-label="New status"
              />
              <Textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Customer-visible note (optional)"
                rows={2}
              />
              <Textarea
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Internal note (not shown to customer)"
                rows={2}
              />
              <div className="flex items-center justify-between">
                <Checkbox
                  label="Send WhatsApp update to customer"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                />
                <Button size="sm" loading={savingStatus} onClick={saveStatus}>
                  Save update
                </Button>
              </div>
              {!order.consentWhatsapp && (
                <p className="text-caption text-muted-foreground">
                  Customer has not opted in to WhatsApp — notifications are
                  skipped.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-border">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-body-sm">
                      {item.productName ?? item.itemLabel ?? 'Item'}
                      {item.remarks && (
                        <span className="block text-caption text-muted-foreground">
                          {item.remarks}
                        </span>
                      )}
                    </span>
                    <span className="text-body-sm font-medium">
                      × {item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Customer notes */}
          <Card>
            <CardHeader>
              <CardTitle>Customer notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add an update for the customer…"
                  rows={2}
                />
                <div className="flex items-center justify-between">
                  <Checkbox
                    label="Visible to customer"
                    checked={noteVisible}
                    onChange={(e) => setNoteVisible(e.target.checked)}
                  />
                  <Button size="sm" loading={savingNote} onClick={addNote}>
                    Add note
                  </Button>
                </div>
              </div>
              {order.customerNotes.length > 0 && (
                <ul className="space-y-2">
                  {order.customerNotes.map((note) => (
                    <li
                      key={note.id}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-body-sm">{note.message}</span>
                        <Badge variant={note.visibleToCustomer ? 'success' : 'neutral'}>
                          {note.visibleToCustomer ? 'Visible' : 'Internal'}
                        </Badge>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        {formatDateTime(note.createdAt)}
                        {note.createdByName ? ` · ${note.createdByName}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tracking link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-caption text-muted-foreground">
                Tracking ID: <span className="font-mono">{order.trackingId}</span>
              </p>
              {trackingUrl && (
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={trackingUrl}
                    className="text-caption focus-ring h-10 flex-1 rounded-lg border border-input bg-muted/40 px-2 font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Copy tracking link"
                    onClick={copyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-success" aria-hidden />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TrackingTimeline
                events={order.timeline.map((t) => ({
                  status: t.status,
                  date: t.createdAt,
                  note: t.customerNote ?? t.internalNote,
                }))}
              />
            </CardContent>
          </Card>

          <OrderNotifications orderId={order.id} />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/orders"
      className="text-body-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
      Back to orders
    </Link>
  );
}
