import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { presignSchema, ALLOWED_MIME } from '@/lib/validation/media';
import {
  isStorageConfigured,
  buildKey,
  publicUrlForKey,
  createPresignedUpload,
} from '@/services/storage.client';

/**
 * POST /api/v1/media/presign — issue a presigned PUT URL for direct upload.
 * The browser uploads the file straight to R2/S3; this function only signs.
 */
export const POST = withApi(async (req: NextRequest) => {
  await authorize(req, 'media.upload');

  if (!isStorageConfigured()) {
    throw new ApiError(503, 'INTERNAL', 'Object storage is not configured.');
  }

  const body = presignSchema.parse(await readJson(req));
  if (!ALLOWED_MIME.has(body.contentType)) {
    throw ApiError.validation('Unsupported file type.');
  }

  const key = buildKey(body.fileName, body.folder);
  const uploadUrl = await createPresignedUpload(key, body.contentType);

  return ok({
    uploadUrl,
    key,
    publicUrl: publicUrlForKey(key),
    contentType: body.contentType,
  });
});
