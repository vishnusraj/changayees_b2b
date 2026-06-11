'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert } from '@/components/feedback/alert';
import {
  TextField,
  PhoneField,
  EmailField,
  NumberField,
  DateField,
} from '@/components/form/text-field';
import { ORDER_STATUS_OPTIONS } from '@/lib/order-status';

interface ItemRow {
  itemLabel: string;
  quantity: string;
  remarks: string;
}

interface Assignee {
  id: string;
  name: string;
  role: string;
}

const EMPTY_ITEM: ItemRow = { itemLabel: '', quantity: '', remarks: '' };

export default function NewOrderPage() {
  const router = useRouter();
  const [customerName, setCustomerName] = React.useState('');
  const [organization, setOrganization] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [assignedManager, setAssignedManager] = React.useState('');
  const [expectedDelivery, setExpectedDelivery] = React.useState('');
  const [currentStatus, setCurrentStatus] = React.useState('ORDER_CONFIRMED');
  const [consentWhatsapp, setConsentWhatsapp] = React.useState(true);
  const [items, setItems] = React.useState<ItemRow[]>([{ ...EMPTY_ITEM }]);
  const [assignees, setAssignees] = React.useState<Assignee[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);

  React.useEffect(() => {
    apiGet<Assignee[]>('/orders/assignees')
      .then((res) => setAssignees(res.data))
      .catch(() => setAssignees([]));
  }, []);

  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  const addItem = () => setItems((rows) => [...rows, { ...EMPTY_ITEM }]);
  const removeItem = (index: number) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));

  const validItems = items.filter(
    (it) => it.itemLabel.trim() && Number(it.quantity) > 0,
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!customerName.trim() || phone.trim().length < 7) return;
    if (validItems.length === 0) {
      setError('Add at least one item with a label and quantity.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiSend<{ id: string }>('/orders', 'POST', {
        customerName,
        organization,
        phone,
        email,
        assignedManager: assignedManager || undefined,
        expectedDelivery: expectedDelivery || undefined,
        currentStatus,
        consentWhatsapp,
        items: validItems.map((it) => ({
          itemLabel: it.itemLabel,
          quantity: Number(it.quantity),
          remarks: it.remarks || undefined,
        })),
      });
      router.push(`/admin/orders/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create order.');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/admin/orders"
        className="text-body-sm inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to orders
      </Link>

      <h1 className="text-h3">New order</h1>

      <form onSubmit={submit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Customer name"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              error={touched && !customerName.trim() ? 'Required' : undefined}
            />
            <TextField
              label="Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
            <PhoneField
              label="Phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={
                touched && phone.trim().length < 7 ? 'Valid phone required' : undefined
              }
            />
            <EmailField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid items-end gap-3 sm:grid-cols-[1fr_7rem_auto]"
              >
                <TextField
                  label={index === 0 ? 'Item' : undefined}
                  placeholder="e.g. School Shirt (White)"
                  value={item.itemLabel}
                  onChange={(e) => updateItem(index, { itemLabel: e.target.value })}
                />
                <NumberField
                  label={index === 0 ? 'Qty' : undefined}
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove item"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4" aria-hidden />
              Add item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium">Initial status</label>
              <Select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                options={ORDER_STATUS_OPTIONS}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-body-sm font-medium">Manager</label>
              <Select
                value={assignedManager}
                onChange={(e) => setAssignedManager(e.target.value)}
                options={[
                  { label: 'Unassigned', value: '' },
                  ...assignees.map((u) => ({
                    label: `${u.name} (${u.role})`,
                    value: u.id,
                  })),
                ]}
              />
            </div>
            <DateField
              label="Expected delivery"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
            />
            <div className="flex items-end">
              <Checkbox
                label="Send WhatsApp updates to customer"
                checked={consentWhatsapp}
                onChange={(e) => setConsentWhatsapp(e.target.checked)}
              />
            </div>
          </CardContent>
        </Card>

        {error && <Alert variant="danger">{error}</Alert>}

        <Button type="submit" loading={submitting}>
          Create order
        </Button>
      </form>
    </div>
  );
}
