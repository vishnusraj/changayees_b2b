/**
 * Edge middleware — coarse authentication for the admin portal pages.
 *
 * Responsibilities (kept minimal so it stays edge-safe — no Prisma, no bcrypt):
 *   • Verify the access-token cookie on /admin/* page requests.
 *   • Redirect unauthenticated users to the login page (preserving intended URL).
 *   • Leave the public auth pages open.
 *
 * Fine-grained permission checks happen in the route handlers (see lib/api/guards).
 * API authorization is also handled per-route in handlers, not here.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth/config';
import { verifyAccessToken } from '@/lib/auth/jwt';

const PUBLIC_ADMIN_PATHS = [
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only the admin portal pages are gated here.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }
  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(authConfig.cookies.access)?.value;
  if (token) {
    try {
      await verifyAccessToken(token);
      return NextResponse.next();
    } catch {
      // fall through to redirect
    }
  }

  const loginUrl = new URL('/admin/login', req.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Run on admin pages only; exclude Next internals and static assets.
  matcher: ['/admin/:path*'],
};
