/**
 * Role → permission matrix (per the API Specification "Role Access Matrix").
 *
 * The DB `role_permissions` table is the runtime source of truth (it can be
 * edited later); this matrix is what the seed writes into it, and serves as the
 * canonical documentation of default access.
 *
 *   `allModules` → every permission (Super Admin).
 *   `modules`    → every action within the listed modules.
 *   `extra`      → individually named permissions.
 */
import { PERMISSION_CATALOG, type PermissionModule } from './permissions';

export const ROLE_NAMES = [
  'Super Admin',
  'Sales Manager',
  'Order Manager',
  'Production Manager',
  'Marketing Manager',
  'Content Manager',
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export interface RoleGrant {
  allModules?: boolean;
  modules?: PermissionModule[];
  extra?: string[];
}

export const ROLE_GRANTS: Record<RoleName, RoleGrant> = {
  'Super Admin': { allModules: true },

  'Sales Manager': {
    modules: ['leads', 'rfqs'],
    extra: [
      'dashboard.view',
      'orders.view',
      'orders.create',
      'orders.update',
      'orders.update_status',
      'contact.view',
      'analytics.view',
    ],
  },

  'Order Manager': {
    modules: ['orders', 'notifications'],
    extra: ['dashboard.view', 'contact.view', 'leads.view'],
  },

  'Production Manager': {
    extra: [
      'dashboard.view',
      'orders.view',
      'orders.update_status',
      'notifications.view',
    ],
  },

  'Marketing Manager': {
    modules: ['blogs', 'catalogs', 'case_studies', 'testimonials'],
    extra: ['dashboard.view', 'media.view', 'media.upload', 'analytics.view'],
  },

  'Content Manager': {
    modules: ['pages', 'media'],
    extra: ['dashboard.view', 'categories.view', 'industries.view'],
  },
};

/** Expand a role's grant into a concrete, de-duplicated permission name list. */
export function expandRoleGrant(role: RoleName): string[] {
  const grant = ROLE_GRANTS[role];
  const names = new Set<string>();

  if (grant.allModules) {
    for (const [mod, actions] of Object.entries(PERMISSION_CATALOG)) {
      for (const action of actions) names.add(`${mod}.${action}`);
    }
  }
  for (const mod of grant.modules ?? []) {
    for (const action of PERMISSION_CATALOG[mod]) {
      names.add(`${mod}.${action}`);
    }
  }
  for (const name of grant.extra ?? []) names.add(name);

  return [...names];
}
