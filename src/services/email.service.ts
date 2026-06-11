/**
 * Transactional email service.
 *
 * MVP scope: password reset + admin invites only (architecture C-09/M-04).
 * The provider (SES / Resend) is wired in a later phase; for now sends are
 * logged in development and recorded so the auth flow is testable end-to-end.
 */

interface PasswordResetEmail {
  to: string;
  name: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export async function sendPasswordResetEmail(
  params: PasswordResetEmail,
): Promise<void> {
  // TODO(email-phase): dispatch via the configured provider + queue.
  if (process.env.NODE_ENV !== 'production') {
    console.info(
      `[email:dev] password reset for ${params.to} -> ${params.resetUrl} (expires in ${params.expiresInMinutes}m)`,
    );
  }
}
