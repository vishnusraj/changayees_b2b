import { FileText } from 'lucide-react';
import { EmptyState } from '@/components/feedback/empty-state';
import { CatalogCard } from './catalog-card';
import type { CatalogView } from '@/features/catalogs/catalog.service';

/** CatalogGrid — responsive grid of catalog cards with an empty state. */
export function CatalogGrid({ catalogs }: { catalogs: CatalogView[] }) {
  if (catalogs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No catalogs found"
        description="Try a different search, or contact us for a specific catalog."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {catalogs.map((catalog) => (
        <CatalogCard key={catalog.id} catalog={catalog} />
      ))}
    </div>
  );
}
