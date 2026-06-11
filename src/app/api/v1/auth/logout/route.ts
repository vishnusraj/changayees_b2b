import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { authConfig } from '@/lib/auth/config';
import { clearAuthCookies } from '@/lib/auth/cookies';
import { logout } from '@/features/auth/auth.service';

/** POST /api/v1/auth/logout — revoke the session and clear cookies. */
export const POST = withApi(async (req: NextRequest) => {
  const refreshToken = req.cookies.get(authConfig.cookies.refresh)?.value;
  await logout(refreshToken);

  const response = message('Signed out');
  clearAuthCookies(response);
  return response;
});
