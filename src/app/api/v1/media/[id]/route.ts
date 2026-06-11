import { withApiParams } from '@/lib/api/route';
import { message } from '@/lib/api/response';
import { ApiError } from '@/lib/api/errors';
import { authorize } from '@/lib/api/guards';
import { deleteMedia } from '@/services/media.service';

/** DELETE /api/v1/media/{id} — remove the object from storage + soft-delete. */
export const DELETE = withApiParams<{ id: string }>(async (req, { id }) => {
  const auth = await authorize(req, 'media.delete');
  const removed = await deleteMedia(id, auth.userId);
  if (!removed) throw ApiError.notFound('Media not found');
  return message('Deleted');
});
