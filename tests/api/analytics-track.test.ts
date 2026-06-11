import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/services/analytics.service', () => ({
  track: vi.fn(),
  PUBLIC_TRACKABLE: new Set(['product_viewed', 'whatsapp_clicked']),
}));

import { POST } from '@/app/api/v1/analytics/track/route';
import { track } from '@/services/analytics.service';

function postReq(body: unknown) {
  return new NextRequest('http://localhost/api/v1/analytics/track', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/v1/analytics/track (public beacon)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('records a whitelisted event and returns 204', async () => {
    const res = await POST(
      postReq({ event: 'product_viewed', visitorId: 'v1', metadata: { slug: 'shirt' } }),
    );
    expect(res.status).toBe(204);
    expect(track).toHaveBeenCalledWith(
      'product_viewed',
      expect.objectContaining({ userIdentifier: 'v1' }),
    );
  });

  it('silently ignores non-whitelisted events (anti-spam)', async () => {
    const res = await POST(postReq({ event: 'evil_event' }));
    expect(res.status).toBe(204);
    expect(track).not.toHaveBeenCalled();
  });
});
