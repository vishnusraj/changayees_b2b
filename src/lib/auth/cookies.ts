/**
 * Auth cookie management. Access + refresh tokens are stored in httpOnly
 * cookies so they are inaccessible to JS (XSS-resistant). The access cookie is
 * also readable by the edge middleware for page protection.
 */
import type { NextResponse } from 'next/server';
import { authConfig, isProduction } from './config';

const baseCookie = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
): void {
  response.cookies.set(authConfig.cookies.access, tokens.accessToken, {
    ...baseCookie,
    maxAge: authConfig.accessTtl,
  });
  response.cookies.set(authConfig.cookies.refresh, tokens.refreshToken, {
    ...baseCookie,
    maxAge: authConfig.refreshTtl,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(authConfig.cookies.access, '', {
    ...baseCookie,
    maxAge: 0,
  });
  response.cookies.set(authConfig.cookies.refresh, '', {
    ...baseCookie,
    maxAge: 0,
  });
}
