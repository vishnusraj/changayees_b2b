import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { slugify } from '@/lib/slug';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type { productCreateSchema, productUpdateSchema } from '@/lib/validation/cms';

type Create = z.infer<typeof productCreateSchema>;
type Update = z.infer<typeof productUpdateSchema>;
const MODULE = 'products';

export interface ProductAdminListItem {
  id: string;
  name: string;
  productCode: string;
  slug: string;
  status: PublishStatus;
  isFeatured: boolean;
  updatedAt: Date;
}

const csvToArray = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const getDetail = (id: string) =>
  prisma.product.findFirst({ where: { id, deletedAt: null } });

export const productAdminService: CrudService<
  ProductAdminListItem,
  NonNullable<Awaited<ReturnType<typeof getDetail>>>
> = {
  async list(params: CrudListParams): Promise<CrudListResult<ProductAdminListItem>> {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as PublishStatus } : {}),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { productCode: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, name: true, productCode: true, slug: true, status: true, isFeatured: true, updatedAt: true },
      }),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as Create;
    const row = await prisma.product.create({
      data: {
        productCode: data.productCode,
        name: data.name,
        slug: slugify(data.slug || data.name),
        shortDescription: data.shortDescription ?? null,
        description: data.description ?? null,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        fabricType: data.fabricType ?? null,
        moq: data.moq ?? null,
        availableSizes: csvToArray(data.availableSizes),
        availableColors: csvToArray(data.availableColors),
        isFeatured: data.isFeatured ?? false,
        status: data.status ?? PublishStatus.DRAFT,
        createdBy: actorId,
        updatedBy: actorId,
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
    await prisma.product.update({
      where: { id },
      data: {
        ...(data.productCode !== undefined ? { productCode: data.productCode } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: slugify(data.slug || existing.name) } : {}),
        ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription || null } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
        ...(data.subcategoryId !== undefined ? { subcategoryId: data.subcategoryId || null } : {}),
        ...(data.fabricType !== undefined ? { fabricType: data.fabricType || null } : {}),
        ...(data.moq !== undefined ? { moq: data.moq } : {}),
        ...(data.availableSizes !== undefined ? { availableSizes: csvToArray(data.availableSizes) } : {}),
        ...(data.availableColors !== undefined ? { availableColors: csvToArray(data.availableColors) } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        updatedBy: actorId,
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.product.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    return res.count > 0;
  },
};
