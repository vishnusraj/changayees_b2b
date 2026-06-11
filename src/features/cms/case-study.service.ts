import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { slugify } from '@/lib/slug';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type {
  caseStudyCreateSchema,
  caseStudyUpdateSchema,
} from '@/lib/validation/cms';

type Create = z.infer<typeof caseStudyCreateSchema>;
type Update = z.infer<typeof caseStudyUpdateSchema>;
const MODULE = 'case_studies';

export interface CaseStudyListItem {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  updatedAt: Date;
}

const getDetail = (id: string) =>
  prisma.caseStudy.findFirst({ where: { id, deletedAt: null } });

export const caseStudyService: CrudService<
  CaseStudyListItem,
  NonNullable<Awaited<ReturnType<typeof getDetail>>>
> = {
  async list(params: CrudListParams): Promise<CrudListResult<CaseStudyListItem>> {
    const where: Prisma.CaseStudyWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as PublishStatus } : {}),
      ...(params.search ? { title: { contains: params.search, mode: 'insensitive' } } : {}),
    };
    const [total, items] = await Promise.all([
      prisma.caseStudy.count({ where }),
      prisma.caseStudy.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, title: true, slug: true, status: true, updatedAt: true },
      }),
    ]);
    return { items, total, page: params.page, limit: params.limit, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as Create;
    const row = await prisma.caseStudy.create({
      data: {
        title: data.title,
        slug: slugify(data.slug || data.title),
        industryId: data.industryId || null,
        clientName: data.clientName ?? null,
        location: data.location ?? null,
        challenge: data.challenge ?? null,
        solution: data.solution ?? null,
        results: data.results ?? null,
        featuredImage: data.featuredImage ?? null,
        status: data.status ?? PublishStatus.DRAFT,
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
    await prisma.caseStudy.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: slugify(data.slug || existing.title) } : {}),
        ...(data.industryId !== undefined ? { industryId: data.industryId || null } : {}),
        ...(data.clientName !== undefined ? { clientName: data.clientName || null } : {}),
        ...(data.location !== undefined ? { location: data.location || null } : {}),
        ...(data.challenge !== undefined ? { challenge: data.challenge || null } : {}),
        ...(data.solution !== undefined ? { solution: data.solution || null } : {}),
        ...(data.results !== undefined ? { results: data.results || null } : {}),
        ...(data.featuredImage !== undefined ? { featuredImage: data.featuredImage || null } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.caseStudy.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    return res.count > 0;
  },
};

// --- Public reads ---
export async function listPublishedCaseStudies() {
  return prisma.caseStudy.findMany({
    where: { status: PublishStatus.PUBLISHED, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { industry: { select: { name: true } } },
    take: 60,
  });
}

export async function getPublishedCaseStudy(slug: string) {
  return prisma.caseStudy.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED, deletedAt: null },
    include: { industry: { select: { name: true } } },
  });
}
