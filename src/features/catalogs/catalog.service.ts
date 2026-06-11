/**
 * Catalogs data layer — listing/search, categories, and gated download
 * recording (lead capture + download tracking + analytics event).
 *
 * The public list deliberately omits `fileUrl`: the file is only revealed after
 * the download is recorded (lead-gated). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { type Prisma, PublishStatus, LeadSource } from '@/generated/prisma';
import { captureLead } from '@/features/leads/lead.service';

export interface CatalogView {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
}

export interface ListCatalogsParams {
  search?: string;
  category?: string;
}

export async function listCatalogs(
  params: ListCatalogsParams = {},
): Promise<CatalogView[]> {
  const where: Prisma.CatalogWhereInput = {
    status: PublishStatus.PUBLISHED,
    deletedAt: null,
    ...(params.category ? { category: params.category } : {}),
    ...(params.search
      ? {
          OR: [
            { title: { contains: params.search, mode: 'insensitive' } },
            { description: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const rows = await prisma.catalog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    thumbnail: row.thumbnail,
    category: row.category,
  }));
}

/** Distinct catalog categories for the filter chips. */
export async function listCatalogCategories(): Promise<string[]> {
  const rows = await prisma.catalog.findMany({
    where: {
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
      category: { not: null },
    },
    select: { category: true },
    distinct: ['category'],
  });
  return rows
    .map((row) => row.category)
    .filter((c): c is string => Boolean(c))
    .sort();
}

export interface RecordDownloadInput {
  catalogId: string;
  name: string;
  phone: string;
  email?: string | null;
  organization?: string | null;
}

export interface DownloadResult {
  fileUrl: string;
  title: string;
}

/**
 * Records a catalog download: captures (or reuses) a lead, writes the
 * `catalog_downloads` row, logs a business analytics event, and returns the
 * file URL. Returns null if the catalog does not exist / is unpublished.
 */
export async function recordCatalogDownload(
  input: RecordDownloadInput,
): Promise<DownloadResult | null> {
  const catalog = await prisma.catalog.findFirst({
    where: {
      id: input.catalogId,
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
    },
  });
  if (!catalog) return null;

  const leadId = await captureLead({
    name: input.name,
    phone: input.phone,
    email: input.email ?? null,
    organization: input.organization ?? null,
    source: LeadSource.CATALOG_DOWNLOAD,
    notes: `Catalog: ${catalog.title}`,
  });

  await prisma.$transaction([
    prisma.catalogDownload.create({
      data: {
        catalogId: catalog.id,
        name: input.name,
        phone: input.phone,
        email: input.email ?? null,
        organization: input.organization ?? null,
        leadId,
      },
    }),
    prisma.analyticsEvent.create({
      data: {
        eventName: 'catalog_downloaded',
        eventType: 'conversion',
        metadata: { catalogId: catalog.id, title: catalog.title },
      },
    }),
  ]);

  return { fileUrl: catalog.fileUrl, title: catalog.title };
}
