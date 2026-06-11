import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { getRequestMeta } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authConfig } from '@/lib/auth/config';
import { setAuthCookies } from '@/lib/auth/cookies';
import { refresh } from '@/features/auth/auth.service';

/** POST /api/v1/auth/refresh — rotate the refresh token, return a new access token. */
export const POST = withApi(async (req: NextRequest) => {
  const refreshToken = req.cookies.get(authConfig.cookies.refresh)?.value;
  if (!refreshToken) throw ApiError.unauthorized('No active session');

  const tokens = await refresh(refreshToken, getRequestMeta(req));

  const response = ok({ accessToken: tokens.accessToken }, 'Session refreshed');
  setAuthCookies(response, tokens);
  return response;
});
