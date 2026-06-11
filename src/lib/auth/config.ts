/**
 * Auth configuration — read from the environment.
 * Kept dependency-light (no Prisma, no zod) so it is safe to import from the
 * edge middleware runtime as well as Node route handlers.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const authConfig = {
  accessSecret: requireEnv('JWT_ACCESS_SECRET'),
  refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  /** Access-token lifetime in seconds (default 15m). */
  accessTtl: Number(process.env.JWT_ACCESS_TTL ?? 900),
  /** Refresh-token lifetime in seconds (default 30d). */
  refreshTtl: Number(process.env.JWT_REFRESH_TTL ?? 2592000),
  issuer: 'changayees',
  audience: 'changayees-admin',
  cookies: {
    access: 'cgs_access',
    refresh: 'cgs_refresh',
  },
  /** Password reset token lifetime in seconds (default 1h). */
  resetTtl: Number(process.env.PASSWORD_RESET_TTL ?? 3600),
} as const;

export const isProduction = process.env.NODE_ENV === 'production';
