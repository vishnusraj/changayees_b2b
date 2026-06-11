/**
 * Object storage client — Cloudflare R2 (S3-compatible) via the AWS SDK.
 *
 * Uses presigned PUT URLs so the browser uploads directly to the bucket — this
 * bypasses Vercel's ~4.5 MB function body limit and its read-only filesystem.
 * The same code works with AWS S3 (omit S3_ENDPOINT) or any S3-compatible store.
 *
 * Env:
 *   S3_ENDPOINT            R2: https://<account_id>.r2.cloudflarestorage.com
 *   S3_REGION              R2: "auto" (default)
 *   S3_BUCKET              bucket name
 *   S3_ACCESS_KEY_ID       R2 API token access key
 *   S3_SECRET_ACCESS_KEY   R2 API token secret
 *   MEDIA_PUBLIC_BASE_URL  public read base (R2 public dev URL or custom domain/CDN)
 *
 * Node runtime only.
 */
import { randomUUID } from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class StorageNotConfiguredError extends Error {
  constructor() {
    super('Object storage is not configured');
    this.name = 'StorageNotConfiguredError';
  }
}

function bucket(): string | undefined {
  return process.env.S3_BUCKET;
}

function publicBase(): string {
  return (process.env.MEDIA_PUBLIC_BASE_URL ?? '').replace(/\/+$/, '');
}

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.MEDIA_PUBLIC_BASE_URL,
  );
}

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!isStorageConfigured()) throw new StorageNotConfiguredError();
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      },
    });
  }
  return client;
}

/** Build a collision-resistant object key under an optional folder prefix. */
export function buildKey(fileName: string, folder?: string): string {
  const clean = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '-').slice(0, 100);
  const prefix = (folder ?? '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-zA-Z0-9/\-_]/g, '-');
  const name = `${randomUUID()}-${clean}`;
  return prefix ? `${prefix}/${name}` : name;
}

export function publicUrlForKey(key: string): string {
  return `${publicBase()}/${key}`;
}

/** Recover the object key from a stored public URL (for deletion). */
export function keyFromUrl(url: string): string | null {
  const base = publicBase();
  if (base && url.startsWith(`${base}/`)) return url.slice(base.length + 1);
  return null;
}

/** Create a presigned PUT URL the browser uses to upload directly. */
export async function createPresignedUpload(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn });
}

export async function deleteObject(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}
