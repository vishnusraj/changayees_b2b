/**
 * Client-side upload flow: presign → direct PUT to R2/S3 → record.
 * Keeps file bytes off the Vercel function (browser uploads straight to storage).
 */
import { apiSend } from '@/lib/admin-api';

export interface UploadedMedia {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  folder: string | null;
  createdAt: string;
}

export async function uploadFile(
  file: File,
  folder?: string,
): Promise<UploadedMedia> {
  const targetFolder = folder && folder !== '/' ? folder : undefined;
  const contentType = file.type || 'application/octet-stream';

  const presign = await apiSend<{
    uploadUrl: string;
    key: string;
    publicUrl: string;
    contentType: string;
  }>('/media/presign', 'POST', {
    fileName: file.name,
    contentType,
    fileSize: file.size,
    folder: targetFolder,
  });

  const put = await fetch(presign.data.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': presign.data.contentType },
    body: file,
  });
  if (!put.ok) throw new Error('Upload to storage failed');

  const record = await apiSend<UploadedMedia>('/media', 'POST', {
    fileName: file.name,
    fileUrl: presign.data.publicUrl,
    fileType: contentType,
    fileSize: file.size,
    folder: targetFolder,
  });
  return record.data;
}
