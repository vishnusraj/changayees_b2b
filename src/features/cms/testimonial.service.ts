import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type {
  testimonialCreateSchema,
  testimonialUpdateSchema,
} from '@/lib/validation/cms';

type Create = z.infer<typeof testimonialCreateSchema>;
type Update = z.infer<typeof testimonialUpdateSchema>;
const MODULE = 'testimonials';

export interface TestimonialListItem {
  id: string;
  name: string;
  organization: string | null;
  status: PublishStatus;
  updatedAt: Date;
}

const getDetail = (id: string) =>
  prisma.testimonial.findFirst({ where: { id, deletedAt: null } });

export const testimonialService: CrudService<
  TestimonialListItem,
  NonNullable<Awaited<ReturnType<typeof getDetail>>>
> = {
  async list(params: CrudListParams): Promise<CrudListResult<TestimonialListItem>> {
    const where: Prisma.TestimonialWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as PublishStatus } : {}),
      ...(params.search ? { name: { contains: params.search, mode: 'insensitive' } } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.testimonial.count({ where }),
      prisma.testimonial.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, name: true, organization: true, status: true, updatedAt: true },
      }),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as Create;
    const row = await prisma.testimonial.create({
      data: {
        name: data.name,
        organization: data.organization ?? null,
        designation: data.designation ?? null,
        testimonial: data.testimonial,
        photo: data.photo ?? null,
        sortOrder: data.sortOrder ?? 0,
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
    await prisma.testimonial.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.organization !== undefined ? { organization: data.organization || null } : {}),
        ...(data.designation !== undefined ? { designation: data.designation || null } : {}),
        ...(data.testimonial !== undefined ? { testimonial: data.testimonial } : {}),
        ...(data.photo !== undefined ? { photo: data.photo || null } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.testimonial.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    return res.count > 0;
  },
};
