import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { forgotPasswordSchema } from '@/lib/validation/auth';
import { requestPasswordReset } from '@/features/auth/auth.service';

/**
 * POST /api/v1/auth/forgot-password
 * Always returns success (no account enumeration).
 */
export const POST = withApi(async (req: NextRequest) => {
  const body = forgotPasswordSchema.parse(await readJson(req));
  await requestPasswordReset(body.email);
  return message(
    'If an account exists for that email, a reset link has been sent.',
  );
});
