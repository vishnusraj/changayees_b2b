import { WILDCARD_PERMISSION } from './permissions';

/**
 * Core authorization check.
 *
 * `granted` is the permission list carried on the access token (or resolved
 * from the DB). Super Admin carries `["*"]`. Module wildcards ("orders.*") are
 * also honoured.
 */
export function hasPermission(granted: string[], required: string): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) return true;
  if (granted.includes(required)) return true;

  const moduleWildcard = `${required.split('.')[0]}.*`;
  return granted.includes(moduleWildcard);
}

/** True if the subject has *every* required permission. */
export function hasAllPermissions(
  granted: string[],
  required: string[],
): boolean {
  return required.every((permission) => hasPermission(granted, permission));
}

/** True if the subject has *any* of the required permissions. */
export function hasAnyPermission(
  granted: string[],
  required: string[],
): boolean {
  return required.some((permission) => hasPermission(granted, permission));
}
