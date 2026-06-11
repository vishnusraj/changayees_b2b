/**
 * Opaque secret-token helpers (refresh-token fingerprints, password-reset
 * tokens). We never store the raw token — only its SHA-256 hash — so a DB leak
 * does not expose usable credentials. Node runtime only.
 */
import { createHash, randomBytes } from 'node:crypto';

/** Generate a URL-safe random secret (default 32 bytes -> 64 hex chars). */
export function generateSecret(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/** Stable SHA-256 fingerprint used for DB storage / lookup. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
