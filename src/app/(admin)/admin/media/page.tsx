'use client';

import { MediaLibrary } from '@/components/admin/media/media-library';

export default function AdminMediaPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-h3">Media Library</h1>
        <p className="text-body-sm text-muted-foreground">
          Upload, organize, preview, and manage images and documents.
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
