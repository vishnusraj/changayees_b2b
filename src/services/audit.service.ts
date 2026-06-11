/**
 * Audit log writer — records admin actions to the append-only `audit_logs`
 * table (architecture §8). Failures are swallowed (logged) so auditing never
 * breaks the primary operation. Node runtime only.
 */
import { prisma } from '@/lib/prisma';
import { type Prisma } from '@/generated/prisma';

export interface AuditInput {
  userId?: string | null;
  module: string;
  action: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
}

export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      module: input.module,
      action: input.action,
    };
    if (input.userId) data.userId = input.userId;
    if (input.entityId) data.entityId = input.entityId;
    if (input.oldValue !== undefined)
      data.oldValue = input.oldValue as Prisma.InputJsonValue;
    if (input.newValue !== undefined)
      data.newValue = input.newValue as Prisma.InputJsonValue;

    await prisma.auditLog.create({ data });
  } catch (error) {
    console.error('[audit] failed to write log:', error);
  }
}
