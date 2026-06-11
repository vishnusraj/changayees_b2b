import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { authorize } from '@/lib/api/guards';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/v1/users — list admin users.
 * Demonstrates the RBAC guard: requires the `users.view` permission
 * (granted to Super Admin only by the default matrix).
 */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'users.view');

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      lastLogin: true,
      role: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(users);
});
