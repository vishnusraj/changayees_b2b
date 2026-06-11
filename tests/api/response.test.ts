import { describe, it, expect } from 'vitest';
import { ok, created, okWithMeta, message } from '@/lib/api/response';

describe('API response envelope', () => {
  it('ok → 200 success envelope', async () => {
    const res = ok({ a: 1 }, 'done');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: 'done',
      data: { a: 1 },
    });
  });

  it('created → 201', async () => {
    const res = created({ id: 'x' });
    expect(res.status).toBe(201);
    expect((await res.json()).data).toEqual({ id: 'x' });
  });

  it('okWithMeta includes pagination meta', async () => {
    const res = okWithMeta([1, 2], { page: 1, limit: 20, total: 2, totalPages: 1 });
    expect((await res.json()).meta.total).toBe(2);
  });

  it('message → null-data envelope', async () => {
    expect(await message('hi').json()).toEqual({
      success: true,
      message: 'hi',
      data: null,
    });
  });
});
