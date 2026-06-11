/**
 * Permission catalog — the single source of truth for every permission in the
 * system. Used by the seed (to populate the `permissions` table) and at runtime
 * (to type-check guard calls).
 *
 * Naming convention: `<module>.<action>` (e.g. "orders.update_status").
 */

export const PERMISSION_CATALOG = {
  dashboard: ['view'],
  products: ['view', 'create', 'update', 'delete', 'publish', 'import'],
  categories: ['view', 'manage'],
  industries: ['view', 'manage'],
  orders: ['view', 'create', 'update', 'delete', 'update_status'],
  leads: ['view', 'create', 'update', 'assign', 'export', 'delete'],
  rfqs: ['view', 'update', 'assign', 'update_status'],
  catalogs: ['view', 'create', 'update', 'delete'],
  blogs: ['view', 'create', 'update', 'delete', 'publish'],
  case_studies: ['view', 'create', 'update', 'delete'],
  testimonials: ['view', 'create', 'update', 'delete'],
  pages: ['view', 'update', 'publish'],
  media: ['view', 'upload', 'delete'],
  contact: ['view'],
  notifications: ['view', 'send', 'retry'],
  analytics: ['view'],
  settings: ['view', 'update'],
  users: ['view', 'create', 'update', 'delete'],
  roles: ['view', 'manage'],
} as const;

export type PermissionModule = keyof typeof PERMISSION_CATALOG;

/** Precise union of every valid permission string, e.g. "orders.update_status". */
export type Permission = {
  [M in PermissionModule]: `${M}.${(typeof PERMISSION_CATALOG)[M][number]}`;
}[PermissionModule];

/** Build a permission name. */
export function permissionName(module: PermissionModule, action: string): string {
  return `${module}.${action}`;
}

/** Flat list of every permission name. */
export const ALL_PERMISSIONS: string[] = Object.entries(
  PERMISSION_CATALOG,
).flatMap(([mod, actions]) => actions.map((action) => `${mod}.${action}`));

/** Wildcard granted to Super Admin (matches every permission). */
export const WILDCARD_PERMISSION = '*';
