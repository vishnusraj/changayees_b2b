/**
 * Products data layer — consumed directly by Server Components (RSC) and by the
 * public product APIs. All reads are scoped to PUBLISHED, non-deleted products.
 *
 * Node runtime only (Prisma).
 */
import { prisma, } from '@/lib/prisma';
import { Prisma, PublishStatus } from '@/generated/prisma';
import type {
  CategoryNav,
  FilterFacets,
  ProductCardData,
  ProductDetail,
  ProductListResult,
} from '@/components/product/types';

const PAGE_SIZE = 12;

export interface ListProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategories?: string[];
  fabrics?: string[];
  colors?: string[];
  sort?: string;
}

type ProductWithImage = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: { select: { name: true } };
  };
}>;

function toCard(product: ProductWithImage): ProductCardData {
  const first = [...product.images].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )[0];
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    moq: product.moq,
    imageUrl: first?.imageUrl ?? null,
    categoryName: product.category?.name ?? null,
  };
}

function orderByFor(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'name':
      return [{ name: 'asc' }];
    case 'featured':
      return [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    case 'newest':
    default:
      return [{ createdAt: 'desc' }];
  }
}

/** Paginated, filtered product listing. */
export async function listProducts(
  params: ListProductsParams = {},
): Promise<ProductListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? PAGE_SIZE;

  const where: Prisma.ProductWhereInput = {
    status: PublishStatus.PUBLISHED,
    deletedAt: null,
    ...(params.category ? { category: { slug: params.category } } : {}),
    ...(params.subcategories?.length
      ? { subcategory: { slug: { in: params.subcategories } } }
      : {}),
    ...(params.fabrics?.length
      ? { fabricType: { in: params.fabrics } }
      : {}),
    ...(params.colors?.length
      ? { availableColors: { hasSome: params.colors } }
      : {}),
  };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { images: true, category: { select: { name: true } } },
      orderBy: orderByFor(params.sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    products: products.map(toCard),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/** Full product by slug, or null if not found / unpublished. */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { slug, status: PublishStatus.PUBLISHED, deletedAt: null },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      documents: true,
      category: { select: { name: true, slug: true } },
      subcategory: { select: { name: true } },
    },
  });
  if (!product) return null;

  const brochure = product.documents.find(
    (doc) => doc.documentType === 'BROCHURE',
  );

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productCode: product.productCode,
    shortDescription: product.shortDescription,
    description: product.description,
    fabricType: product.fabricType,
    moq: product.moq,
    availableSizes: product.availableSizes,
    availableColors: product.availableColors,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    categorySlug: product.category.slug,
    subcategoryName: product.subcategory?.name ?? null,
    images: product.images.map((img) => ({
      url: img.imageUrl,
      alt: img.altText ?? product.name,
    })),
    brochureUrl: brochure?.fileUrl ?? null,
  };
}

/** Related products in the same category (excluding the current product). */
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  limit = 8,
): Promise<ProductCardData[]> {
  const products = await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: excludeId },
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
    },
    include: { images: true, category: { select: { name: true } } },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  return products.map(toCard);
}

/** Products drawn from a set of category slugs (industry recommendations). */
export async function getProductsByCategorySlugs(
  slugs: string[],
  limit = 8,
): Promise<ProductCardData[]> {
  if (slugs.length === 0) return [];
  const products = await prisma.product.findMany({
    where: {
      category: { slug: { in: slugs } },
      status: PublishStatus.PUBLISHED,
      deletedAt: null,
    },
    include: { images: true, category: { select: { name: true } } },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
  return products.map(toCard);
}

/** Active categories with their subcategories, for chips + filters. */
export async function listCategories(): Promise<CategoryNav[]> {
  const categories = await prisma.category.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    orderBy: { sortOrder: 'asc' },
    include: {
      subcategories: {
        where: { status: 'ACTIVE', deletedAt: null },
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      },
    },
  });
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    subcategories: category.subcategories,
  }));
}

/** Available filter facets (subcategories / fabrics / colours) for a context. */
export async function getFilterFacets(
  categorySlug?: string,
): Promise<FilterFacets> {
  const where: Prisma.ProductWhereInput = {
    status: PublishStatus.PUBLISHED,
    deletedAt: null,
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const [subcategories, products] = await Promise.all([
    prisma.subcategory.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({
      where,
      select: { fabricType: true, availableColors: true },
    }),
  ]);

  const fabrics = [
    ...new Set(
      products
        .map((p) => p.fabricType)
        .filter((f): f is string => Boolean(f)),
    ),
  ].sort();

  const colors = [
    ...new Set(products.flatMap((p) => p.availableColors)),
  ].sort();

  return { subcategories, fabrics, colors };
}

/** Full-text product search using the generated tsvector (architecture D-13). */
export async function searchProducts(
  query: string,
  opts: { page?: number; limit?: number } = {},
): Promise<ProductListResult> {
  const term = query.trim();
  const page = Math.max(1, opts.page ?? 1);
  const limit = opts.limit ?? PAGE_SIZE;

  if (!term) {
    return { products: [], total: 0, page, limit, totalPages: 1 };
  }

  const tsquery = Prisma.sql`websearch_to_tsquery('english', ${term})`;

  const [ranked, countRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT id
      FROM products
      WHERE status = 'PUBLISHED'
        AND deleted_at IS NULL
        AND search_vector @@ ${tsquery}
      ORDER BY ts_rank(search_vector, ${tsquery}) DESC
      LIMIT ${limit} OFFSET ${(page - 1) * limit}
    `),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*)::bigint AS count
      FROM products
      WHERE status = 'PUBLISHED'
        AND deleted_at IS NULL
        AND search_vector @@ ${tsquery}
    `),
  ]);

  const total = Number(countRows[0]?.count ?? 0);
  const ids = ranked.map((row) => row.id);
  if (ids.length === 0) {
    return { products: [], total, page, limit, totalPages: 1 };
  }

  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { images: true, category: { select: { name: true } } },
  });

  // Preserve the rank order returned by the FTS query.
  const byId = new Map(products.map((p) => [p.id, p]));
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((p): p is ProductWithImage => Boolean(p));

  return {
    products: ordered.map(toCard),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
