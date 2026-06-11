/**
 * Route-handler guards (the fine-grained authorization layer; the middleware
 * does coarse page protection). Use inside any `/api/v1/*` handler:
 *
 *   const auth = await requireAuth(req);
 *   requirePermission(auth, 'orders.update_status');
 */
import type { NextRequest } from 'next/server';
import { ApiError } from './errors';
import { authConfig } from '@/lib/auth/config';
import { verifyAccessToken } from '@/lib/auth/jwt';
import type { AuthContext } from '@/lib/auth/types';
import { hasAnyPermission, hasPermission } from '@/lib/rbac/authorize';

/** Extract the bearer token from the Authorization header or access cookie. */
function extractToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return req.cookies.get(authConfig.cookies.access)?.value ?? null;
}

/** Require a valid, authenticated user. Throws 401 otherwise. */
export async function requireAuth(req: NextRequest): Promise<AuthContext> {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();

  try {
    const claims = await verifyAccessToken(token);
    return {
      userId: claims.sub,
      email: claims.email,
      name: claims.name,
      roleId: claims.roleId,
      role: claims.role,
      permissions: claims.permissions,
    };
  } catch {
    throw ApiError.unauthorized('Session expired or invalid');
  }
}

/** Require a specific permission. Throws 403 if missing. */
export function requirePermission(auth: AuthContext, permission: string): void {
  if (!hasPermission(auth.permissions, permission)) {
    throw ApiError.forbidden(`Missing permission: ${permission}`);
  }
}

/** Require at least one of the given permissions. Throws 403 if none. */
export function requireAnyPermission(
  auth: AuthContext,
  permissions: string[],
): void {
  if (!hasAnyPermission(auth.permissions, permissions)) {
    throw ApiError.forbidden('Insufficient permissions');
  }
}

/** Require one of the given role names. Throws 403 otherwise. */
export function requireRole(auth: AuthContext, roles: string[]): void {
  if (!roles.includes(auth.role)) {
    throw ApiError.forbidden('Insufficient role');
  }
}

/** Convenience: authenticate and assert a permission in one call. */
export async function authorize(
  req: NextRequest,
  permission: string,
): Promise<AuthContext> {
  const auth = await requireAuth(req);
  requirePermission(auth, permission);
  return auth;
}
