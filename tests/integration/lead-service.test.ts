import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks must be hoisted before importing the service under test.
const { mockLead } = vi.hoisted(() => ({
  mockLead: { findUnique: vi.fn(), create: vi.fn() },
}));
vi.mock('@/lib/prisma', () => ({ prisma: { lead: mockLead } }));
vi.mock('@/services/analytics.service', () => ({
  track: vi.fn(),
  ANALYTICS_EVENTS: { LEAD_CREATED: 'lead_created' },
}));
vi.mock('@/services/audit.service', () => ({ writeAudit: vi.fn() }));

import { captureLead } from '@/features/leads/lead.service';
import { track } from '@/services/analytics.service';

describe('captureLead — dedup by (phone, source)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reuses an existing lead and skips create + analytics', async () => {
    mockLead.findUnique.mockResolvedValue({ id: 'existing-id' });

    const id = await captureLead({ name: 'A', phone: '98765 43210', source: 'RFQ' });

    expect(id).toBe('existing-id');
    expect(mockLead.create).not.toHaveBeenCalled();
    expect(track).not.toHaveBeenCalled();
  });

  it('creates a new lead with a normalized phone and tracks the source', async () => {
    mockLead.findUnique.mockResolvedValue(null);
    mockLead.create.mockResolvedValue({ id: 'new-id' });

    const id = await captureLead({
      name: 'B',
      phone: '+91 (98765) 43211',
      source: 'CONTACT_FORM',
    });

    expect(id).toBe('new-id');
    expect(mockLead.create).toHaveBeenCalledTimes(1);

    // dedup lookup uses the normalized phone
    const lookup = mockLead.findUnique.mock.calls[0][0];
    expect(lookup.where.phone_source).toEqual({
      phone: '+919876543211',
      source: 'CONTACT_FORM',
    });

    expect(track).toHaveBeenCalledWith(
      'lead_created',
      expect.objectContaining({ metadata: { source: 'CONTACT_FORM' } }),
    );
  });
});
