import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { getRequestMeta, readJson } from '@/lib/api/request';
import { setAuthCookies } from '@/lib/auth/cookies';
import { loginSchema } from '@/lib/validation/auth';
import { login } from '@/features/auth/auth.service';

/** POST /api/v1/auth/login */
export const POST = withApi(async (req: NextRequest) => {
  const body = loginSchema.parse(await readJson(req));
  const result = await login(body.email, body.password, getRequestMeta(req));

  const response = ok(
    { user: result.user, accessToken: result.accessToken },
    'Signed in',
  );
  setAuthCookies(response, result);
  return response;
});
