'use client';

import * as React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { CatalogDownloadForm } from './catalog-download-form';

/**
 * CatalogDownloadButton — opens the lead-capture drawer for a catalog.
 * Client island embedded inside the (server) CatalogCard.
 */
export function CatalogDownloadButton({
  catalogId,
  title,
}: {
  catalogId: string;
  title: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button fullWidth onClick={() => setOpen(true)}>
        <Download className="h-4 w-4" aria-hidden />
        Download
      </Button>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        title="Download catalog"
      >
        <CatalogDownloadForm catalogId={catalogId} catalogTitle={title} />
      </Drawer>
    </>
  );
}
