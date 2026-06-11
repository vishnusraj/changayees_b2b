import { Badge, type BadgeProps } from '@/components/ui/badge';

type Tone = NonNullable<BadgeProps['variant']>;

/** Default tone per known status across leads / RFQs / orders / content. */
const STATUS_TONE: Record<string, Tone> = {
  // Lead
  NEW: 'info',
  CONTACTED: 'primary',
  NEGOTIATION: 'warning',
  WON: 'success',
  LOST: 'danger',
  // RFQ
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  QUOTATION_SENT: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  // Order (coarse)
  INQUIRY_RECEIVED: 'neutral',
  ORDER_CONFIRMED: 'info',
  DISPATCHED: 'info',
  DELIVERED: 'success',
  CLOSED: 'neutral',
  // Record / content
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
  // Notifications
  QUEUED: 'neutral',
  SENT: 'info',
  READ: 'success',
  FAILED: 'danger',
};

function humanize(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * StatusBadge — renders a status enum value with a sensible default tone.
 * Pass `tone` to override; `label` to override the humanized text.
 */
export function StatusBadge({
  status,
  tone,
  label,
}: {
  status: string;
  tone?: Tone;
  label?: string;
}) {
  return (
    <Badge variant={tone ?? STATUS_TONE[status] ?? 'neutral'} dot>
      {label ?? humanize(status)}
    </Badge>
  );
}
