import { prisma } from '@/lib/prisma';
import { type Prisma, RecordStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { slugify } from '@/lib/slug';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type { industryCreateSchema, industryUpdateSchema } from '@/lib/validation/cms';

type Create = z.infer<typeof industryCreateSchema>;
type Update = z.infer<typeof industryUpdateSchema>;
const MODULE = 'industries';

export interface IndustryListItem {
  id: string;
  name: string;
  slug: string;
  status: RecordStatus;
  updatedAt: Date;
}

const getDetail = (id: string) =>
  prisma.industry.findFirst({ where: { id, deletedAt: null } });

export const industryAdminService: CrudService<
  IndustryListItem,
  NonNullable<Awaited<ReturnType<typeof getDetail>>>
> = {
  async list(params: CrudListParams): Promise<CrudListResult<IndustryListItem>> {
    const where: Prisma.IndustryWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as RecordStatus } : {}),
      ...(params.search ? { name: { contains: params.search, mode: 'insensitive' } } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.industry.count({ where }),
      prisma.industry.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, name: true, slug: true, status: true, updatedAt: true },
      }),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as Create;
    const row = await prisma.industry.create({
      data: {
        name: data.name,
        slug: slugify(data.slug || data.name),
        description: data.description ?? null,
        bannerImage: data.bannerImage ?? null,
        status: data.status ?? RecordStatus.ACTIVE,
      },
      select: { id: true },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'create', entityId: row.id });
    return { id: row.id };
  },

  async update(id, input, actorId) {
    const data = input as Update;
    const existing = await getDetail(id);
    if (!existing) return null;
    await prisma.industry.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: slugify(data.slug || existing.name) } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.bannerImage !== undefined ? { bannerImage: data.bannerImage || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.industry.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    return res.count > 0;
  },
};
