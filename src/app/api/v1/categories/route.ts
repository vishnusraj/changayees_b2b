import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { listCategories } from '@/features/products/product.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/categories — public category list with subcategories. */
export const GET = withApi(async () => {
  const categories = await listCategories();
  return ok(categories);
});
