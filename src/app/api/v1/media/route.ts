import { type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { ok, created } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { authorize } from '@/lib/api/guards';
import { mediaRecordSchema } from '@/lib/validation/media';
import { listMedia, createMedia } from '@/services/media.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/media — list media (folder + search + pagination + folders). */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'media.view');
  const sp = new URL(req.url).searchParams;
  const result = await listMedia({
    folder: sp.get('folder') ?? undefined,
    search: sp.get('search') ?? undefined,
    page: Number(sp.get('page') ?? 1) || 1,
  });
  return ok(result);
});

/** POST /api/v1/media — record an uploaded object after the direct PUT. */
export const POST = withApi(async (req: NextRequest) => {
  const auth = await authorize(req, 'media.upload');
  const body = mediaRecordSchema.parse(await readJson(req));
  const media = await createMedia(
    {
      fileName: body.fileName,
      fileUrl: body.fileUrl,
      fileType: body.fileType,
      fileSize: body.fileSize,
      folder: body.folder,
    },
    auth.userId,
  );
  return created(media, 'Uploaded');
});
