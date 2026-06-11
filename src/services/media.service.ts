/**
 * Media library service — DB records for objects stored in R2/S3.
 * Folders are virtual (a path-prefix string on each record). Node runtime only.
 */
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/services/audit.service';
import { deleteObject, keyFromUrl } from '@/services/storage.client';

const MODULE = 'media';

export interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  folder: string | null;
  createdAt: Date;
}

export interface MediaListResult {
  items: MediaItem[];
  folders: string[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function normalizeFolder(folder?: string | null): string {
  const f = (folder ?? '').replace(/^\/+|\/+$/g, '');
  return f || '/';
}

export async function listMedia(params: {
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<MediaListResult> {
  const page = Math.max(1, params.page ?? 1);
  const limit = params.limit ?? 30;
  // No folder param = all files; "/" = root; otherwise a specific folder.
  const folder = params.folder ? normalizeFolder(params.folder) : undefined;

  const where = {
    deletedAt: null,
    ...(folder ? { folder } : {}),
    ...(params.search
      ? { fileName: { contains: params.search, mode: 'insensitive' as const } }
      : {}),
  };

  const [total, rows, folderRows] = await Promise.all([
    prisma.media.count({ where }),
    prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        folder: true,
        createdAt: true,
      },
    }),
    prisma.media.findMany({
      where: { deletedAt: null },
      select: { folder: true },
      distinct: ['folder'],
    }),
  ]);

  const folders = [
    ...new Set(folderRows.map((r) => r.folder ?? '/').filter(Boolean)),
  ].sort();

  return {
    items: rows,
    folders: folders.length > 0 ? folders : ['/'],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function createMedia(
  input: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
    folder?: string;
  },
  actorId: string,
): Promise<MediaItem> {
  const row = await prisma.media.create({
    data: {
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileType: input.fileType,
      fileSize: input.fileSize ?? null,
      folder: normalizeFolder(input.folder),
      uploadedBy: actorId,
    },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      fileType: true,
      fileSize: true,
      folder: true,
      createdAt: true,
    },
  });
  await writeAudit({ userId: actorId, module: MODULE, action: 'upload', entityId: row.id });
  return row;
}

export async function deleteMedia(id: string, actorId: string): Promise<boolean> {
  const row = await prisma.media.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, fileUrl: true },
  });
  if (!row) return false;

  // Best-effort delete from object storage.
  const key = keyFromUrl(row.fileUrl);
  if (key) {
    try {
      await deleteObject(key);
    } catch (error) {
      console.error('[media] storage delete failed:', error);
    }
  }

  await prisma.media.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  await writeAudit({ userId: actorId, module: MODULE, action: 'delete', entityId: id });
  return true;
}
