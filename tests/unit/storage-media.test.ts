import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildKey,
  keyFromUrl,
  publicUrlForKey,
} from '@/services/storage.client';
import {
  presignSchema,
  mediaRecordSchema,
  ALLOWED_MIME,
  MAX_UPLOAD_BYTES,
} from '@/lib/validation/media';

describe('storage keys', () => {
  beforeEach(() => {
    vi.stubEnv('MEDIA_PUBLIC_BASE_URL', 'https://cdn.example.com');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('builds a folder-prefixed, sanitized key', () => {
    const key = buildKey('My File (1).png', 'products');
    expect(key).toMatch(/^products\/[0-9a-f-]+-My-File--1-\.png$/);
  });
  it('builds a root key without folder', () => {
    expect(buildKey('a.png')).toMatch(/^[0-9a-f-]+-a\.png$/);
  });
  it('round-trips public URL <-> key', () => {
    const url = publicUrlForKey('products/abc.png');
    expect(url).toBe('https://cdn.example.com/products/abc.png');
    expect(keyFromUrl(url)).toBe('products/abc.png');
  });
  it('returns null for foreign URLs', () => {
    expect(keyFromUrl('https://other.com/x.png')).toBeNull();
  });
});

describe('media upload validation', () => {
  it('accepts a valid image upload', () => {
    const result = presignSchema.safeParse({
      fileName: 'logo.png',
      contentType: 'image/png',
      fileSize: 1024,
    });
    expect(result.success).toBe(true);
  });
  it('rejects oversized files', () => {
    const result = presignSchema.safeParse({
      fileName: 'big.png',
      contentType: 'image/png',
      fileSize: MAX_UPLOAD_BYTES + 1,
    });
    expect(result.success).toBe(false);
  });
  it('rejects invalid folder names', () => {
    const result = presignSchema.safeParse({
      fileName: 'a.png',
      contentType: 'image/png',
      fileSize: 10,
      folder: '../etc',
    });
    expect(result.success).toBe(false);
  });
  it('whitelists expected MIME types', () => {
    expect(ALLOWED_MIME.has('application/pdf')).toBe(true);
    expect(ALLOWED_MIME.has('application/x-msdownload')).toBe(false);
  });
  it('media record requires a valid URL', () => {
    expect(
      mediaRecordSchema.safeParse({
        fileName: 'a',
        fileUrl: 'not-a-url',
        fileType: 'image/png',
      }).success,
    ).toBe(false);
  });
});
