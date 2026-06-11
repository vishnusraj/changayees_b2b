import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { requireAuth } from '@/lib/api/guards';

/** GET /api/v1/auth/me — the authenticated user + effective permissions. */
export const GET = withApi(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  return ok(
    {
      id: auth.userId,
      name: auth.name,
      email: auth.email,
      role: auth.role,
      roleId: auth.roleId,
      permissions: auth.permissions,
    },
    'Authenticated',
  );
});
