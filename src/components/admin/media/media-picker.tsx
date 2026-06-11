'use client';

import * as React from 'react';
import { ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { MediaLibrary } from './media-library';

/** MediaPicker — URL input + "Choose" that opens the media library to select. */
export function MediaPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
          )}
        </span>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL or choose from library"
        />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Choose
        </Button>
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title="Media library"
      >
        <MediaLibrary
          selectable
          onSelect={(item) => {
            onChange(item.fileUrl);
            setOpen(false);
          }}
        />
      </Drawer>
    </>
  );
}
