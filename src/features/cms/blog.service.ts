import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus } from '@/generated/prisma';
import { writeAudit } from '@/services/audit.service';
import { slugify } from '@/lib/slug';
import type { CrudListParams, CrudListResult, CrudService } from '@/lib/api/crud';
import type { z } from 'zod';
import type { blogCreateSchema, blogUpdateSchema } from '@/lib/validation/cms';

type BlogCreate = z.infer<typeof blogCreateSchema>;
type BlogUpdate = z.infer<typeof blogUpdateSchema>;

const MODULE = 'blogs';

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  status: PublishStatus;
  publishedAt: Date | null;
  updatedAt: Date;
}

async function getDetail(id: string) {
  const row = await prisma.blog.findFirst({ where: { id, deletedAt: null } });
  return row;
}

export const blogService: CrudService<BlogListItem, NonNullable<Awaited<ReturnType<typeof getDetail>>>> = {
  async list(params: CrudListParams): Promise<CrudListResult<BlogListItem>> {
    const where: Prisma.BlogWhereInput = {
      deletedAt: null,
      ...(params.status ? { status: params.status as PublishStatus } : {}),
      ...(params.search
        ? { title: { contains: params.search, mode: 'insensitive' } }
        : {}),
    };
    const [total, rows] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        select: { id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true },
      }),
    ]);
    return {
      items: rows,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  },

  get: getDetail,

  async create(input, actorId) {
    const data = input as BlogCreate;
    const status = data.status ?? PublishStatus.DRAFT;
    const row = await prisma.blog.create({
      data: {
        title: data.title,
        slug: slugify(data.slug || data.title),
        excerpt: data.excerpt ?? null,
        content: data.content ?? null,
        featuredImage: data.featuredImage ?? null,
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
        status,
        publishedAt: status === PublishStatus.PUBLISHED ? new Date() : null,
        createdBy: actorId,
        updatedBy: actorId,
      },
      select: { id: true },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'create', entityId: row.id });
    return { id: row.id };
  },

  async update(id, input, actorId) {
    const data = input as BlogUpdate;
    const existing = await getDetail(id);
    if (!existing) return null;
    const status = data.status ?? existing.status;
    await prisma.blog.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.slug !== undefined ? { slug: slugify(data.slug || existing.title) } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt || null } : {}),
        ...(data.content !== undefined ? { content: data.content || null } : {}),
        ...(data.featuredImage !== undefined ? { featuredImage: data.featuredImage || null } : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle || null } : {}),
        ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription || null } : {}),
        status,
        publishedAt:
          status === PublishStatus.PUBLISHED && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
        updatedBy: actorId,
      },
    });
    await writeAudit({ userId: actorId, module: MODULE, action: 'update', entityId: id });
    return getDetail(id);
  },

  async remove(id, actorId) {
    const res = await prisma.blog.updateMany({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    if (res.count > 0) {
      await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
    }
    return res.count > 0;
  },
};

// --- Public reads ---
export interface PublicBlogCard {
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | null;
}

export async function listPublishedBlogs(): Promise<PublicBlogCard[]> {
  return prisma.blog.findMany({
    where: { status: PublishStatus.PUBLISHED, deletedAt: null },
    orderBy: { publishedAt: 'desc' },
    select: { title: true, slug: true, excerpt: true, featuredImage: true, publishedAt: true },
    take: 60,
  });
}

export async function getPublishedBlog(slug: string) {
  return prisma.blog.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED, deletedAt: null },
  });
}
