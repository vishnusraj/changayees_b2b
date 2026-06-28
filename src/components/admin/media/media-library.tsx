'use client';

import * as React from 'react';
import {
  UploadCloud,
  Folder,
  Files,
  Search,
  Trash2,
  Copy,
  Check,
  FileText,
} from 'lucide-react';
import { apiGet, apiSend } from '@/lib/admin-api';
import { uploadFile } from '@/lib/media-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/feedback/alert';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  folder: string | null;
}

interface MediaListResponse {
  items: MediaItem[];
  folders: string[];
  total: number;
}

const ALL = '__all__';

export function MediaLibrary({
  selectable = false,
  onSelect,
}: {
  selectable?: boolean;
  onSelect?: (item: MediaItem) => void;
}) {
  const [items, setItems] = React.useState<MediaItem[]>([]);
  const [folders, setFolders] = React.useState<string[]>([]);
  const [folder, setFolder] = React.useState<string>(ALL);
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadFolder, setUploadFolder] = React.useState('');
  const [copied, setCopied] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (folder !== ALL) params.set('folder', folder);
    if (search) params.set('search', search);
    apiGet<MediaListResponse>(`/media?${params.toString()}`)
      .then((res) => {
        setItems(res.data.items);
        setFolders(res.data.folders);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [folder, search]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const target = uploadFolder || (folder !== ALL ? folder : '');
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file, target);
      }
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      await apiSend(`/media/${id}`, 'DELETE');
      setItems((list) => list.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const copy = (url: string) => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 1200);
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[12rem_1fr]">
      {/* Folder sidebar */}
      <aside className="space-y-1">
        <FolderButton
          active={folder === ALL}
          onClick={() => setFolder(ALL)}
          icon={<Files className="h-4 w-4" aria-hidden />}
          label="All files"
        />
        {folders.map((f) => (
          <FolderButton
            key={f}
            active={folder === f}
            onClick={() => setFolder(f)}
            icon={<Folder className="h-4 w-4" aria-hidden />}
            label={f === '/' ? 'Root' : f}
          />
        ))}
      </aside>

      <div className="space-y-4">
        {/* Upload + search */}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            placeholder="Folder (e.g. products)"
            className="w-44"
          />
          <Button
            size="sm"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="h-4 w-4" aria-hidden />
            Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            accept="image/*,application/pdf,.xls,.xlsx,.doc,.docx"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="relative ml-auto min-w-44 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search files…"
              aria-label="Search media"
              className="text-body focus-ring h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3"
            />
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {loading ? (
          <p className="text-body-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center text-body-sm text-muted-foreground">
            No files yet. Upload to get started.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const isImage = item.fileType.startsWith('image/');
              return (
                <li
                  key={item.id}
                  className="group overflow-hidden rounded-lg border border-border bg-card"
                >
                  <button
                    type="button"
                    onClick={() => (selectable ? onSelect?.(item) : copy(item.fileUrl))}
                    className="focus-ring relative block aspect-square w-full bg-muted"
                  >
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.fileUrl}
                        alt={item.fileName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted-foreground">
                        <FileText className="h-8 w-8" aria-hidden />
                      </span>
                    )}
                    {selectable && (
                      <span className="absolute inset-0 hidden items-center justify-center bg-primary/30 text-primary-foreground group-hover:flex">
                        <Check className="h-6 w-6" aria-hidden />
                      </span>
                    )}
                  </button>
                  <div className="flex items-center justify-between gap-1 p-2">
                    <span className="text-caption truncate" title={item.fileName}>
                      {item.fileName}
                    </span>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        type="button"
                        aria-label="Copy URL"
                        onClick={() => copy(item.fileUrl)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === item.fileUrl ? (
                          <Check className="h-3.5 w-3.5 text-success" aria-hidden />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden />
                        )}
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => remove(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function FolderButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-body-sm focus-ring flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left',
        active ? 'bg-brand-subtle font-medium text-brand ring-1 ring-brand/10' : 'text-muted-foreground hover:bg-muted',
      )}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
