import { z } from 'zod';

/** Allowed upload MIME types (images + documents). */
export const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB

const folderField = z
  .string()
  .max(120)
  .regex(/^[a-zA-Z0-9/_-]*$/, 'Invalid folder name')
  .optional();

export const presignSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(150),
  fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  folder: folderField,
});

export const mediaRecordSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileUrl: z.string().url().max(1000),
  fileType: z.string().max(150),
  fileSize: z.number().int().nonnegative().optional(),
  folder: folderField,
});

export type PresignInput = z.infer<typeof presignSchema>;
