import { Accordion, type AccordionItem } from '@/components/ui/accordion';
import type { ProductSpecGroup } from './types';

/**
 * ProductSpecifications — accordion of spec groups (Design System: accordion
 * layout, mobile-friendly). First group is open by default.
 */
export function ProductSpecifications({
  groups,
}: {
  groups: ProductSpecGroup[];
}) {
  if (groups.length === 0) return null;

  const items: AccordionItem[] = groups.map((group, index) => ({
    title: group.title,
    defaultOpen: index === 0,
    content: (
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {group.items.map((spec) => (
          <div
            key={spec.label}
            className="flex justify-between gap-4 border-b border-border/60 py-1.5"
          >
            <dt className="text-muted-foreground">{spec.label}</dt>
            <dd className="text-right font-medium text-foreground">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    ),
  }));

  return <Accordion items={items} />;
}
