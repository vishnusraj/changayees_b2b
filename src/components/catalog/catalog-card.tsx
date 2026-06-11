import Image from 'next/image';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CatalogDownloadButton } from './catalog-download-button';
import type { CatalogView } from '@/features/catalogs/catalog.service';

/** CatalogCard — thumbnail, title, description, and the gated download CTA. */
export function CatalogCard({ catalog }: { catalog: CatalogView }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elevation-1">
      <div className="relative aspect-[4/3] bg-muted">
        {catalog.thumbnail ? (
          <Image
            src={catalog.thumbnail}
            alt={catalog.title}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <FileText className="h-10 w-10" aria-hidden />
          </span>
        )}
        {catalog.category && (
          <Badge variant="primary" className="absolute left-3 top-3">
            {catalog.category}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-h4 line-clamp-2">{catalog.title}</h3>
        {catalog.description && (
          <p className="text-body-sm line-clamp-2 text-muted-foreground">
            {catalog.description}
          </p>
        )}
        <div className="mt-auto pt-3">
          <CatalogDownloadButton catalogId={catalog.id} title={catalog.title} />
        </div>
      </div>
    </div>
  );
}
