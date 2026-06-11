import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
} from '@/lib/rbac/authorize';
import { ALL_PERMISSIONS } from '@/lib/rbac/permissions';
import { expandRoleGrant, ROLE_NAMES } from '@/lib/rbac/matrix';

describe('hasPermission', () => {
  it('grants everything to the wildcard (Super Admin)', () => {
    expect(hasPermission(['*'], 'orders.delete')).toBe(true);
  });
  it('grants exact matches', () => {
    expect(hasPermission(['orders.view'], 'orders.view')).toBe(true);
  });
  it('honours module wildcards', () => {
    expect(hasPermission(['orders.*'], 'orders.update_status')).toBe(true);
  });
  it('denies unrelated permissions', () => {
    expect(hasPermission(['leads.view'], 'orders.delete')).toBe(false);
  });
});

describe('hasAll/hasAny', () => {
  it('hasAllPermissions requires every permission', () => {
    expect(hasAllPermissions(['*'], ['a.b', 'c.d'])).toBe(true);
    expect(hasAllPermissions(['a.b'], ['a.b', 'c.d'])).toBe(false);
  });
  it('hasAnyPermission requires one', () => {
    expect(hasAnyPermission(['a.b'], ['a.b', 'c.d'])).toBe(true);
    expect(hasAnyPermission(['x.y'], ['a.b', 'c.d'])).toBe(false);
  });
});

describe('role matrix', () => {
  it('defines the six roles', () => {
    expect(ROLE_NAMES).toHaveLength(6);
    expect(ROLE_NAMES).toContain('Super Admin');
    expect(ROLE_NAMES).toContain('Production Manager');
  });

  it('Super Admin expands to every permission', () => {
    expect(expandRoleGrant('Super Admin').sort()).toEqual(
      [...ALL_PERMISSIONS].sort(),
    );
  });

  it('Sales Manager gets all lead permissions but not media.delete', () => {
    const sales = expandRoleGrant('Sales Manager');
    expect(sales).toContain('leads.view');
    expect(sales).toContain('leads.assign');
    expect(sales).toContain('orders.update_status');
    expect(sales).not.toContain('media.delete');
  });

  it('Production Manager can only update order status, not delete orders', () => {
    const prod = expandRoleGrant('Production Manager');
    expect(prod).toContain('orders.update_status');
    expect(prod).not.toContain('orders.delete');
  });
});
