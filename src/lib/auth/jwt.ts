/**
 * JWT signing & verification using `jose` (Web Crypto — works in both the Node
 * and edge runtimes, so the same verify path is used by route handlers and the
 * middleware).
 */
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { authConfig } from './config';
import type { AccessTokenClaims, RefreshTokenClaims } from './types';

const encoder = new TextEncoder();
const accessKey = encoder.encode(authConfig.accessSecret);
const refreshKey = encoder.encode(authConfig.refreshSecret);

export async function signAccessToken(
  claims: AccessTokenClaims,
): Promise<string> {
  return new SignJWT({ ...claims, typ: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer(authConfig.issuer)
    .setAudience(authConfig.audience)
    .setExpirationTime(`${authConfig.accessTtl}s`)
    .sign(accessKey);
}

export async function signRefreshToken(
  claims: RefreshTokenClaims,
): Promise<string> {
  return new SignJWT({ ...claims, typ: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer(authConfig.issuer)
    .setAudience(authConfig.audience)
    .setExpirationTime(`${authConfig.refreshTtl}s`)
    .sign(refreshKey);
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, accessKey, {
    issuer: authConfig.issuer,
    audience: authConfig.audience,
  });
  assertType(payload, 'access');
  return {
    sub: String(payload.sub),
    email: String(payload.email),
    name: String(payload.name),
    roleId: String(payload.roleId),
    role: String(payload.role),
    permissions: Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : [],
  };
}

export async function verifyRefreshToken(
  token: string,
): Promise<RefreshTokenClaims> {
  const { payload } = await jwtVerify(token, refreshKey, {
    issuer: authConfig.issuer,
    audience: authConfig.audience,
  });
  assertType(payload, 'refresh');
  return { sub: String(payload.sub), sid: String(payload.sid) };
}

function assertType(payload: JWTPayload, expected: 'access' | 'refresh'): void {
  if (payload.typ !== expected) {
    throw new Error(`Invalid token type: expected ${expected}`);
  }
}
