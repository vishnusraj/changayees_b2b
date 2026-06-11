'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';
import type { FilterFacets } from './types';

/**
 * ProductFilterControls — URL-driven facet checkboxes (subcategory / fabric /
 * colour). Live-applies: each toggle updates the query string and re-renders the
 * server listing. Shared by the desktop sidebar and the mobile filter drawer.
 */
export function ProductFilterControls({ facets }: { facets: FilterFacets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isChecked = (key: string, value: string) =>
    (searchParams.get(key)?.split(',') ?? []).includes(value);

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(',').filter(Boolean) ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next.length) params.set(key, next.join(','));
    else params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-6">
      {facets.subcategories.length > 0 && (
        <Group title="Type">
          {facets.subcategories.map((sub) => (
            <Checkbox
              key={sub.slug}
              label={sub.name}
              checked={isChecked('subcategory', sub.slug)}
              onChange={() => toggle('subcategory', sub.slug)}
            />
          ))}
        </Group>
      )}
      {facets.fabrics.length > 0 && (
        <Group title="Fabric">
          {facets.fabrics.map((fabric) => (
            <Checkbox
              key={fabric}
              label={fabric}
              checked={isChecked('fabric', fabric)}
              onChange={() => toggle('fabric', fabric)}
            />
          ))}
        </Group>
      )}
      {facets.colors.length > 0 && (
        <Group title="Colour">
          {facets.colors.map((color) => (
            <Checkbox
              key={color}
              label={color}
              checked={isChecked('color', color)}
              onChange={() => toggle('color', color)}
            />
          ))}
        </Group>
      )}
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-overline text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
