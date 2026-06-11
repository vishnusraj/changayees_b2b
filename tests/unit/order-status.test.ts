import { describe, it, expect } from 'vitest';
import {
  ORDER_STATUS_SEQUENCE,
  ORDER_STATUS_OPTIONS,
  getStatusProgress,
  getStatusMeta,
  getStatusIndex,
} from '@/lib/order-status';

describe('order status workflow', () => {
  it('has all 15 stages in order', () => {
    expect(ORDER_STATUS_SEQUENCE).toHaveLength(15);
    expect(ORDER_STATUS_SEQUENCE[0]).toBe('INQUIRY_RECEIVED');
    expect(ORDER_STATUS_SEQUENCE.at(-1)).toBe('CLOSED');
  });

  it('exposes a select option per stage', () => {
    expect(ORDER_STATUS_OPTIONS).toHaveLength(15);
    expect(ORDER_STATUS_OPTIONS[0]).toEqual({
      value: 'INQUIRY_RECEIVED',
      label: 'Inquiry Received',
    });
  });

  it('derives progress percentage from stage index', () => {
    expect(getStatusProgress('INQUIRY_RECEIVED')).toBe(0);
    expect(getStatusProgress('CLOSED')).toBe(100);
    expect(getStatusProgress('QUALITY_INSPECTION')).toBe(
      Math.round((getStatusIndex('QUALITY_INSPECTION') / 14) * 100),
    );
  });

  it('maps statuses to the right colour bucket (M-09)', () => {
    expect(getStatusMeta('ORDER_CONFIRMED').color).toBe('confirmed');
    expect(getStatusMeta('FABRIC_ORDERED').color).toBe('production');
    expect(getStatusMeta('CUTTING_STARTED').color).toBe('production');
    expect(getStatusMeta('QUALITY_INSPECTION').color).toBe('quality');
    expect(getStatusMeta('PACKING').color).toBe('dispatch');
    expect(getStatusMeta('DISPATCHED').color).toBe('dispatch');
    expect(getStatusMeta('DELIVERED').color).toBe('delivered');
    expect(getStatusMeta('INQUIRY_RECEIVED').color).toBe('pending');
  });

  it('humanizes labels', () => {
    expect(getStatusMeta('FABRIC_ORDERED').label).toBe('Fabric Ordered');
  });
});
