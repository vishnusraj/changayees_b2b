import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { resetPasswordSchema } from '@/lib/validation/auth';
import { resetPassword } from '@/features/auth/auth.service';

/** POST /api/v1/auth/reset-password */
export const POST = withApi(async (req: NextRequest) => {
  const body = resetPasswordSchema.parse(await readJson(req));
  await resetPassword(body.token, body.password);
  return message('Your password has been reset. Please sign in.');
});
