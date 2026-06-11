/**
 * Authentication service — login, token refresh (with rotation), logout, and
 * password reset. Implements stateful session management on top of stateless
 * JWTs: refresh tokens are bound to a `sessions` row (hashed), so logout and
 * password-reset can revoke them, and refresh rotates the stored fingerprint.
 *
 * Node runtime only (uses Prisma + bcrypt + node:crypto).
 */
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/api/errors';
import { authConfig } from '@/lib/auth/config';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/lib/auth/jwt';
import { generateSecret, hashToken } from '@/lib/auth/tokens';
import type { AuthUser } from '@/lib/auth/types';
import { RecordStatus } from '@/generated/prisma';
import { resolvePermissions } from './rbac.service';
import { sendPasswordResetEmail } from '@/services/email.service';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult extends IssuedTokens {
  user: AuthUser;
}

interface RequestMeta {
  userAgent?: string | null;
  ip?: string | null;
}

function secondsFromNow(seconds: number): Date {
  return new Date(Date.now() + seconds * 1000);
}

/** Issue an access token + a refresh token bound to a new session row. */
async function issueSession(
  user: { id: string; email: string; name: string },
  meta: RequestMeta,
): Promise<IssuedTokens> {
  const { role, roleId, permissions } = await resolvePermissions(user.id);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: '', // set below once we have the token
      userAgent: meta.userAgent ?? null,
      ip: meta.ip ?? null,
      expiresAt: secondsFromNow(authConfig.refreshTtl),
    },
  });

  const refreshToken = await signRefreshToken({ sub: user.id, sid: session.id });
  await prisma.session.update({
    where: { id: session.id },
    data: { tokenHash: hashToken(refreshToken) },
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    roleId,
    role,
    permissions,
  });

  return { accessToken, refreshToken };
}

export async function login(
  email: string,
  password: string,
  meta: RequestMeta,
): Promise<LoginResult> {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: { role: { select: { name: true } } },
  });

  // Constant-ish failure path — same error whether the user exists or not.
  if (!user || user.status !== RecordStatus.ACTIVE) {
    throw ApiError.invalidCredentials();
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) throw ApiError.invalidCredentials();

  const tokens = await issueSession(user, meta);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return {
    ...tokens,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
    },
  };
}

/** Validate + rotate a refresh token, returning a fresh token pair. */
export async function refresh(
  refreshToken: string,
  meta: RequestMeta,
): Promise<IssuedTokens> {
  let claims;
  try {
    claims = await verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const session = await prisma.session.findUnique({
    where: { id: claims.sid },
    include: {
      user: { include: { role: { select: { name: true } } } },
    },
  });

  const fingerprint = hashToken(refreshToken);
  const isValidSession =
    session &&
    !session.revokedAt &&
    session.expiresAt > new Date() &&
    session.tokenHash === fingerprint &&
    !session.user.deletedAt &&
    session.user.status === RecordStatus.ACTIVE;

  if (!isValidSession) {
    // Reuse / tampering: if the session exists, revoke it defensively.
    if (session) {
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
    }
    throw ApiError.unauthorized('Session expired or revoked');
  }

  // Rotate: new refresh token, updated fingerprint + expiry on the same row.
  const { role, roleId, permissions } = await resolvePermissions(
    session.user.id,
  );
  const newRefresh = await signRefreshToken({
    sub: session.user.id,
    sid: session.id,
  });
  await prisma.session.update({
    where: { id: session.id },
    data: {
      tokenHash: hashToken(newRefresh),
      expiresAt: secondsFromNow(authConfig.refreshTtl),
      userAgent: meta.userAgent ?? session.userAgent,
      ip: meta.ip ?? session.ip,
    },
  });

  const accessToken = await signAccessToken({
    sub: session.user.id,
    email: session.user.email,
    name: session.user.name,
    roleId,
    role,
    permissions,
  });

  return { accessToken, refreshToken: newRefresh };
}

/** Revoke the session associated with a refresh token (idempotent). */
export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;
  try {
    const claims = await verifyRefreshToken(refreshToken);
    await prisma.session.updateMany({
      where: { id: claims.sid, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Invalid token — nothing to revoke; logout is best-effort.
  }
}

/**
 * Begin password reset. Always resolves successfully (no account enumeration);
 * only sends an email when the account actually exists.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null, status: RecordStatus.ACTIVE },
  });
  if (!user) return;

  const rawToken = generateSecret(32);
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: secondsFromNow(authConfig.resetTtl),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetUrl: `${appUrl}/admin/reset-password?token=${rawToken}`,
    expiresInMinutes: Math.round(authConfig.resetTtl / 60),
  });
}

/** Complete password reset: validate token, set new password, revoke sessions. */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.validation('This reset link is invalid or has expired.');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate every existing session for this user (force re-login).
    prisma.session.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
}
