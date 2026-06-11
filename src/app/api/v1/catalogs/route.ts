import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { listCatalogs } from '@/features/catalogs/catalog.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/catalogs — public catalog list (supports ?search= and ?category=). */
export const GET = withApi(async (req: NextRequest) => {
  const sp = new URL(req.url).searchParams;
  const catalogs = await listCatalogs({
    search: sp.get('search') ?? undefined,
    category: sp.get('category') ?? undefined,
  });
  return ok(catalogs);
});
