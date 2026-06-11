/**
 * Lead service — public capture (with dedup) + admin management
 * (list / detail / create / update / assign / status / activity / analytics).
 *
 * Note: `assignedTo` / actor columns are scalar UUIDs (no relation), so user
 * names are resolved with a follow-up query. Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type Prisma, type LeadStatus, LeadSource } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { track, ANALYTICS_EVENTS } from '@/services/analytics.service';

const AUDIT_MODULE = 'leads';

// ---------------------------------------------------------------------------
// Public capture (dedup by phone + source)
// ---------------------------------------------------------------------------

export interface CaptureLeadInput {
  name: string;
  phone: string;
  email?: string | null;
  organization?: string | null;
  designation?: string | null;
  industryId?: string | null;
  source: LeadSource;
  notes?: string | null;
  consentWhatsapp?: boolean;
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.trim().replace(/[^\d+]/g, '');
  return cleaned.startsWith('+')
    ? `+${cleaned.slice(1).replace(/\+/g, '')}`
    : cleaned.replace(/\+/g, '');
}

export function generateLeadNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(Math.random() * 900 + 100);
  return `LEAD-${ts}-${rand}`;
}

export async function captureLead(input: CaptureLeadInput): Promise<string> {
  const phone = normalizePhone(input.phone);

  const existing = await prisma.lead.findUnique({
    where: { phone_source: { phone, source: input.source } },
    select: { id: true },
  });
  if (existing) return existing.id;

  const lead = await prisma.lead.create({
    data: {
      leadNumber: generateLeadNumber(),
      name: input.name,
      phone,
      email: input.email ?? null,
      organization: input.organization ?? null,
      designation: input.designation ?? null,
      industryId: input.industryId ?? null,
      source: input.source,
      notes: input.notes ?? null,
      consentWhatsapp: input.consentWhatsapp ?? false,
    },
    select: { id: true },
  });

  // Lead-source analytics (only on a genuinely new lead).
  await track(ANALYTICS_EVENTS.LEAD_CREATED, {
    eventType: 'conversion',
    metadata: { source: input.source },
  });

  return lead.id;
}

// ---------------------------------------------------------------------------
// Admin: types
// ---------------------------------------------------------------------------

export interface LeadAssignee {
  id: string;
  name: string;
}

export interface LeadListItem {
  id: string;
  leadNumber: string;
  name: string;
  phone: string;
  email: string | null;
  organization: string | null;
  source: LeadSource;
  status: LeadStatus;
  assignee: LeadAssignee | null;
  createdAt: Date;
}

export interface LeadDetail extends LeadListItem {
  designation: string | null;
  industryName: string | null;
  notes: string | null;
  consentWhatsapp: boolean;
  updatedAt: Date;
}

export interface LeadListResult {
  leads: LeadListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  status?: LeadStatus;
  source?: LeadSource;
  assignedTo?: string;
  search?: string;
}

// ---------------------------------------------------------------------------
// Admin: helpers
// ---------------------------------------------------------------------------

async function resolveAssignees(
  ids: (string | null)[],
): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();
  const users = await prisma.user.findMany({
    where: { id: { in: unique } },
    select: { id: true, name: true },
  });
  return new Map(users.map((u) => [u.id, u.name]));
}

// ---------------------------------------------------------------------------
// Admin: read
// ---------------------------------------------------------------------------

export async function listLeads(
  params: ListLeadsParams = {},
): Promise<LeadListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? 20;

  const where: Prisma.LeadWhereInput = {
    deletedAt: null,
    ...(params.status ? { status: params.status } : {}),
    ...(params.source ? { source: params.source } : {}),
    ...(params.assignedTo ? { assignedTo: params.assignedTo } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { phone: { contains: params.search } },
            { email: { contains: params.search, mode: 'insensitive' } },
            { organization: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        leadNumber: true,
        name: true,
        phone: true,
        email: true,
        organization: true,
        source: true,
        status: true,
        assignedTo: true,
        createdAt: true,
      },
    }),
  ]);

  const assignees = await resolveAssignees(rows.map((r) => r.assignedTo));

  return {
    leads: rows.map((row) => ({
      id: row.id,
      leadNumber: row.leadNumber,
      name: row.name,
      phone: row.phone,
      email: row.email,
      organization: row.organization,
      source: row.source,
      status: row.status,
      assignee: row.assignedTo
        ? { id: row.assignedTo, name: assignees.get(row.assignedTo) ?? 'Unknown' }
        : null,
      createdAt: row.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getLeadById(id: string): Promise<LeadDetail | null> {
  const row = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    include: { industry: { select: { name: true } } },
  });
  if (!row) return null;

  const assignees = await resolveAssignees([row.assignedTo]);

  return {
    id: row.id,
    leadNumber: row.leadNumber,
    name: row.name,
    phone: row.phone,
    email: row.email,
    organization: row.organization,
    source: row.source,
    status: row.status,
    assignee: row.assignedTo
      ? { id: row.assignedTo, name: assignees.get(row.assignedTo) ?? 'Unknown' }
      : null,
    designation: row.designation,
    industryName: row.industry?.name ?? null,
    notes: row.notes,
    consentWhatsapp: row.consentWhatsapp,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export interface LeadActivityItem {
  id: string;
  action: string;
  actorName: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: Date;
}

export async function getLeadActivity(
  id: string,
): Promise<LeadActivityItem[]> {
  const logs = await prisma.auditLog.findMany({
    where: { module: AUDIT_MODULE, entityId: id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const actors = await resolveAssignees(logs.map((l) => l.userId));

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    actorName: log.userId ? (actors.get(log.userId) ?? null) : null,
    oldValue: log.oldValue,
    newValue: log.newValue,
    createdAt: log.createdAt,
  }));
}

export async function getAssignableUsers(): Promise<
  { id: string; name: string; role: string }[]
> {
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, name: true, role: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });
  return users.map((u) => ({ id: u.id, name: u.name, role: u.role.name }));
}

// ---------------------------------------------------------------------------
// Admin: write
// ---------------------------------------------------------------------------

export async function createLeadManual(
  input: {
    name: string;
    phone: string;
    email?: string | null;
    organization?: string | null;
    designation?: string | null;
  },
  actorId: string,
): Promise<string> {
  const id = await captureLead({ ...input, source: LeadSource.MANUAL });
  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'create',
    entityId: id,
    newValue: { name: input.name, phone: input.phone },
  });
  return id;
}

export async function updateLead(
  id: string,
  patch: {
    name?: string;
    email?: string | null;
    organization?: string | null;
    designation?: string | null;
    notes?: string | null;
    industryId?: string | null;
  },
  actorId: string,
): Promise<LeadDetail | null> {
  const before = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
  });
  if (!before) return null;

  await prisma.lead.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.email !== undefined ? { email: patch.email || null } : {}),
      ...(patch.organization !== undefined
        ? { organization: patch.organization || null }
        : {}),
      ...(patch.designation !== undefined
        ? { designation: patch.designation || null }
        : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.industryId !== undefined
        ? { industryId: patch.industryId || null }
        : {}),
    },
  });

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'update',
    entityId: id,
    oldValue: { notes: before.notes, name: before.name },
    newValue: { notes: patch.notes ?? before.notes, name: patch.name ?? before.name },
  });

  return getLeadById(id);
}

export async function assignLead(
  id: string,
  assignedTo: string | null,
  actorId: string,
): Promise<LeadDetail | null> {
  const before = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    select: { assignedTo: true },
  });
  if (!before) return null;

  if (assignedTo) {
    const user = await prisma.user.findFirst({
      where: { id: assignedTo, status: 'ACTIVE', deletedAt: null },
      select: { id: true },
    });
    if (!user) return null;
  }

  await prisma.lead.update({ where: { id }, data: { assignedTo } });

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'assign',
    entityId: id,
    oldValue: { assignedTo: before.assignedTo },
    newValue: { assignedTo },
  });

  return getLeadById(id);
}

export async function changeLeadStatus(
  id: string,
  status: LeadStatus,
  actorId: string,
): Promise<LeadDetail | null> {
  const before = await prisma.lead.findFirst({
    where: { id, deletedAt: null },
    select: { status: true },
  });
  if (!before) return null;

  await prisma.lead.update({ where: { id }, data: { status } });

  await writeAudit({
    userId: actorId,
    module: AUDIT_MODULE,
    action: 'status',
    entityId: id,
    oldValue: { status: before.status },
    newValue: { status },
  });

  return getLeadById(id);
}

// ---------------------------------------------------------------------------
// Admin: analytics
// ---------------------------------------------------------------------------

export interface LeadAnalytics {
  total: number;
  newLeads: number;
  won: number;
  lost: number;
  conversionRate: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}

export async function getLeadAnalytics(): Promise<LeadAnalytics> {
  const [total, byStatusRaw, bySourceRaw] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { deletedAt: null },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      _count: { _all: true },
      where: { deletedAt: null },
    }),
  ]);

  const byStatus = Object.fromEntries(
    byStatusRaw.map((r) => [r.status, r._count._all]),
  );
  const bySource = Object.fromEntries(
    bySourceRaw.map((r) => [r.source, r._count._all]),
  );

  const won = byStatus['WON'] ?? 0;

  return {
    total,
    newLeads: byStatus['NEW'] ?? 0,
    won,
    lost: byStatus['LOST'] ?? 0,
    conversionRate: total > 0 ? Math.round((won / total) * 100) : 0,
    byStatus,
    bySource,
  };
}

/** All leads (filtered) flattened for CSV export. */
export async function getLeadsForExport(
  params: Omit<ListLeadsParams, 'page' | 'limit'> = {},
): Promise<LeadListItem[]> {
  const result = await listLeads({ ...params, page: 1, limit: 5000 });
  return result.leads;
}
