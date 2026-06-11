/**
 * Order-status domain model — maps the 15-stage production workflow to its
 * label, tracking-colour bucket, and progress percentage (architecture M-09).
 * Shared by tracking + admin order components.
 */
import type { OrderStatus } from '@/generated/prisma';

export type TrackingColor =
  | 'pending'
  | 'confirmed'
  | 'production'
  | 'quality'
  | 'dispatch'
  | 'delivered';

export interface OrderStatusMeta {
  label: string;
  color: TrackingColor;
}

/** Canonical workflow order (index drives the progress percentage). */
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'INQUIRY_RECEIVED',
  'QUOTATION_SENT',
  'QUOTATION_APPROVED',
  'ORDER_CONFIRMED',
  'FABRIC_ORDERED',
  'FABRIC_RECEIVED',
  'CUTTING_STARTED',
  'CUTTING_COMPLETED',
  'STITCHING_STARTED',
  'STITCHING_COMPLETED',
  'QUALITY_INSPECTION',
  'PACKING',
  'DISPATCHED',
  'DELIVERED',
  'CLOSED',
];

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  INQUIRY_RECEIVED: { label: 'Inquiry Received', color: 'pending' },
  QUOTATION_SENT: { label: 'Quotation Sent', color: 'pending' },
  QUOTATION_APPROVED: { label: 'Quotation Approved', color: 'pending' },
  ORDER_CONFIRMED: { label: 'Order Confirmed', color: 'confirmed' },
  FABRIC_ORDERED: { label: 'Fabric Ordered', color: 'production' },
  FABRIC_RECEIVED: { label: 'Fabric Received', color: 'production' },
  CUTTING_STARTED: { label: 'Cutting Started', color: 'production' },
  CUTTING_COMPLETED: { label: 'Cutting Completed', color: 'production' },
  STITCHING_STARTED: { label: 'Stitching Started', color: 'production' },
  STITCHING_COMPLETED: { label: 'Stitching Completed', color: 'production' },
  QUALITY_INSPECTION: { label: 'Quality Inspection', color: 'quality' },
  PACKING: { label: 'Packing', color: 'dispatch' },
  DISPATCHED: { label: 'Dispatched', color: 'dispatch' },
  DELIVERED: { label: 'Delivered', color: 'delivered' },
  CLOSED: { label: 'Closed', color: 'delivered' },
};

export function getStatusMeta(status: OrderStatus): OrderStatusMeta {
  return ORDER_STATUS_META[status];
}

/** Select options for the 15-stage workflow, in order. */
export const ORDER_STATUS_OPTIONS = ORDER_STATUS_SEQUENCE.map((status) => ({
  value: status,
  label: ORDER_STATUS_META[status].label,
}));

export function getStatusIndex(status: OrderStatus): number {
  return ORDER_STATUS_SEQUENCE.indexOf(status);
}

/** Progress 0–100, derived from the stage index. */
export function getStatusProgress(status: OrderStatus): number {
  const index = getStatusIndex(status);
  if (index < 0) return 0;
  return Math.round((index / (ORDER_STATUS_SEQUENCE.length - 1)) * 100);
}

/** Literal Tailwind classes per tracking colour (kept literal for JIT). */
export const TRACKING_COLOR_CLASSES: Record<
  TrackingColor,
  { text: string; bg: string; soft: string; dot: string }
> = {
  pending: {
    text: 'text-neutral-600',
    bg: 'bg-neutral-500',
    soft: 'bg-neutral-100 text-neutral-700',
    dot: 'bg-neutral-400',
  },
  confirmed: {
    text: 'text-status-confirmed',
    bg: 'bg-status-confirmed',
    soft: 'bg-status-confirmed/10 text-status-confirmed',
    dot: 'bg-status-confirmed',
  },
  production: {
    text: 'text-status-production',
    bg: 'bg-status-production',
    soft: 'bg-status-production/10 text-status-production',
    dot: 'bg-status-production',
  },
  quality: {
    text: 'text-status-quality',
    bg: 'bg-status-quality',
    soft: 'bg-status-quality/10 text-status-quality',
    dot: 'bg-status-quality',
  },
  dispatch: {
    text: 'text-status-dispatch',
    bg: 'bg-status-dispatch',
    soft: 'bg-status-dispatch/10 text-status-dispatch',
    dot: 'bg-status-dispatch',
  },
  delivered: {
    text: 'text-status-delivered',
    bg: 'bg-status-delivered',
    soft: 'bg-status-delivered/10 text-status-delivered',
    dot: 'bg-status-delivered',
  },
};
