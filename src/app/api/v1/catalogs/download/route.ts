import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { catalogDownloadSchema } from '@/lib/validation/catalog';
import { recordCatalogDownload } from '@/features/catalogs/catalog.service';

/**
 * POST /api/v1/catalogs/download — gate a catalog download behind lead capture.
 * Captures a deduped CATALOG_DOWNLOAD lead, records the download, and returns
 * the file URL.
 * TODO(security): add captcha + rate limiting before launch (M-10).
 */
export const POST = withApi(async (req: NextRequest) => {
  const body = catalogDownloadSchema.parse(await readJson(req));

  const result = await recordCatalogDownload({
    catalogId: body.catalogId,
    name: body.name,
    phone: body.phone,
    email: body.email || null,
    organization: body.organization || null,
  });

  if (!result) throw ApiError.notFound('Catalog not found');

  return ok(
    { fileUrl: result.fileUrl, title: result.title },
    'Your download is ready',
  );
});
