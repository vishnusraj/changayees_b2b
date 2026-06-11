import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { slugify } from '@/lib/slug';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type { catalogCreateSchema, catalogUpdateSchema } from '@/lib/validation/cms';

type Create = z.infer<typeof catalogCreateSchema>;
type Update = z.infer<typeof catalogUpdateSchema>;
const MODULE = 'catalogs';

export interface CatalogListItem {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: PublishStatus;
  updatedAt: Date;
}

const getDetail = (id: string) =>
  prisma.catalog.findFirst({ where: { id, deletedAt: null } });

export const catalogAdminService: CrudService<
  CatalogListItem,
  NonNullable<Awaited<ReturnType<typeof getDetail>>>
> = {
  async list(params: CrudListParams): Promise<CrudListResult<CatalogListItem>> {
    const where: Prisma.CatalogWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as PublishStatus } : {}),
      ...(params.search ? { title: { contains: params.search, mode: 'insensitive' } } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.catalog.count({ where }),
      prisma.catalog.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, title: true, slug: true, category: true, status: true, updatedAt: true },
      }),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as Create;
    const row = await prisma.catalog.create({
      data: {
        title: data.title,
        slug: slugify(data.slug || data.title),
        description: data.description ?? null,
        thumbnail: data.thumbnail ?? null,
        fileUrl: data.fileUrl,
        category: data.category ?? null,
        status: data.status ?? PublishStatus.PUBLISHED,
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
    await prisma.catalog.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: slugify(data.slug || existing.title) } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.thumbnail !== undefined ? { thumbnail: data.thumbnail || null } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
        ...(data.category !== undefined ? { category: data.category || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.catalog.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    return res.count > 0;
  },
};
