import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ApiError } from '@/lib/api/errors';

const req = () =>
  new NextRequest('http://localhost/api/v1/x', { method: 'POST' });

describe('withApi error mapping', () => {
  it('maps an ApiError to its status + errorCode', async () => {
    const handler = withApi(async () => {
      throw ApiError.forbidden('nope');
    });
    const res = await handler(req());
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({
      success: false,
      errorCode: 'FORBIDDEN',
      message: 'nope',
    });
  });

  it('maps a ZodError to 422 with field errors', async () => {
    const handler = withApi(async () => {
      z.object({ email: z.string().email() }).parse({ email: 'bad' });
      return NextResponse.json({});
    });
    const res = await handler(req());
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.errorCode).toBe('VALIDATION');
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it('maps unknown errors to 500', async () => {
    const handler = withApi(async () => {
      throw new Error('boom');
    });
    const res = await handler(req());
    expect(res.status).toBe(500);
    expect((await res.json()).errorCode).toBe('INTERNAL');
  });

  it('passes a successful response through', async () => {
    const handler = withApi(async () => NextResponse.json({ ok: true }));
    expect((await handler(req())).status).toBe(200);
  });
});
