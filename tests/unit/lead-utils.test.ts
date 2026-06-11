import { describe, it, expect } from 'vitest';
import { normalizePhone, generateLeadNumber } from '@/features/leads/lead.service';
import { generateRfqNumber } from '@/features/rfq/rfq.service';
import { statusNotifies } from '@/services/notification.service';

describe('normalizePhone', () => {
  it('strips spaces, dashes, and brackets', () => {
    expect(normalizePhone('+91 (98765) 43210')).toBe('+919876543210');
    expect(normalizePhone('98765-43210')).toBe('9876543210');
  });
  it('keeps only one leading plus', () => {
    expect(normalizePhone('++919876543210')).toBe('+919876543210');
  });
});

describe('reference number generators', () => {
  it('lead numbers are prefixed and unique-ish', () => {
    expect(generateLeadNumber()).toMatch(/^LEAD-/);
    expect(generateLeadNumber()).not.toBe(generateLeadNumber());
  });
  it('rfq numbers include the year', () => {
    expect(generateRfqNumber()).toMatch(
      new RegExp(`^RFQ-${new Date().getFullYear()}-`),
    );
  });
});

describe('notification trigger map (canonical §7.2)', () => {
  it('notifies on customer-facing production stages', () => {
    expect(statusNotifies('ORDER_CONFIRMED')).toBe(true);
    expect(statusNotifies('DISPATCHED')).toBe(true);
    expect(statusNotifies('DELIVERED')).toBe(true);
  });
  it('does not notify on internal-only stages', () => {
    expect(statusNotifies('INQUIRY_RECEIVED')).toBe(false);
    expect(statusNotifies('CUTTING_COMPLETED')).toBe(false);
    expect(statusNotifies('CLOSED')).toBe(false);
  });
});
