/**
 * Resolves a user's effective permissions from the database (the runtime source
 * of truth — `role_permissions`). Super Admin collapses to the wildcard `["*"]`
 * to keep tokens small.
 */
import { prisma } from '@/lib/prisma';
import { WILDCARD_PERMISSION } from '@/lib/rbac/permissions';

const SUPER_ADMIN_ROLE = 'Super Admin';

export async function resolvePermissions(userId: string): Promise<{
  role: string;
  roleId: string;
  permissions: string[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      roleId: true,
      role: {
        select: {
          name: true,
          rolePermissions: {
            select: { permission: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    return { role: '', roleId: '', permissions: [] };
  }

  if (user.role.name === SUPER_ADMIN_ROLE) {
    return {
      role: user.role.name,
      roleId: user.roleId,
      permissions: [WILDCARD_PERMISSION],
    };
  }

  return {
    role: user.role.name,
    roleId: user.roleId,
    permissions: user.role.rolePermissions.map((rp) => rp.permission.name),
  };
}
