import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { okWithMeta } from '@/lib/api/response';
import {
  listProducts,
  searchProducts,
} from '@/features/products/product.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/products — public product listing (supports ?q= full-text search). */
export const GET = withApi(async (req: NextRequest) => {
  const sp = new URL(req.url).searchParams;
  const page = Number(sp.get('page') ?? 1) || 1;
  const limit = Number(sp.get('limit') ?? 12) || 12;
  const q = sp.get('q');

  const result = q
    ? await searchProducts(q, { page, limit })
    : await listProducts({
        page,
        limit,
        category: sp.get('category') ?? undefined,
        subcategories: sp.get('subcategory')?.split(',').filter(Boolean),
        fabrics: sp.get('fabric')?.split(',').filter(Boolean),
        colors: sp.get('color')?.split(',').filter(Boolean),
        sort: sp.get('sort') ?? undefined,
      });

  return okWithMeta(result.products, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});
