'use client';

import * as React from 'react';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormField } from './form-field';

export interface FileUploadProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Comma-separated accept list, e.g. ".pdf,.xlsx,image/*". */
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileUploader — drag-and-drop + click to upload (RFQ attachments etc.).
 * Supports PDF / Excel / images / documents. Enforces an optional size cap.
 */
export function FileUpload({
  label,
  hint,
  error,
  required,
  accept = '.pdf,.xlsx,.xls,.csv,image/*',
  multiple = true,
  maxSizeMb = 10,
  value,
  onChange,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const files = value ?? [];

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > maxSizeMb * 1024 * 1024) {
        setLocalError(`${file.name} exceeds ${maxSizeMb} MB`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length === 0) return;
    setLocalError(null);
    onChange?.(multiple ? [...files, ...accepted] : accepted.slice(0, 1));
  };

  const removeAt = (index: number) =>
    onChange?.(files.filter((_, i) => i !== index));

  return (
    <FormField
      label={label}
      hint={hint}
      error={error ?? localError ?? undefined}
      required={required}
      className={className}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-input',
        )}
      >
        <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-body-sm focus-ring rounded font-semibold text-primary"
        >
          Click to upload
          <span className="font-normal text-muted-foreground">
            {' '}
            or drag and drop
          </span>
        </button>
        <p className="text-caption text-muted-foreground">
          PDF, Excel, or images up to {maxSizeMb} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground" aria-hidden />
              <span className="text-body-sm flex-1 truncate">{file.name}</span>
              <span className="text-caption text-muted-foreground">
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeAt(index)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </FormField>
  );
}
