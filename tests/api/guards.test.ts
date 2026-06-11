import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { requireAuth, requirePermission } from '@/lib/api/guards';
import { ApiError } from '@/lib/api/errors';
import type { AuthContext } from '@/lib/auth/types';

const auth: AuthContext = {
  userId: 'u',
  email: 'a@b.c',
  name: 'A',
  roleId: 'r',
  role: 'Sales Manager',
  permissions: ['leads.view', 'leads.assign'],
};

describe('requirePermission (RBAC guard)', () => {
  it('passes when the permission is present', () => {
    expect(() => requirePermission(auth, 'leads.view')).not.toThrow();
  });

  it('throws 403 when the permission is missing', () => {
    try {
      requirePermission(auth, 'orders.delete');
      throw new Error('expected to throw');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(403);
      expect((e as ApiError).code).toBe('FORBIDDEN');
    }
  });
});

describe('requireAuth', () => {
  it('throws 401 when no token is present', async () => {
    const request = new NextRequest('http://localhost/api/v1/leads');
    await expect(requireAuth(request)).rejects.toMatchObject({ status: 401 });
  });
});
