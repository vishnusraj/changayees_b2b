import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Accordion — zero-JS, accessible (native <details>). Mobile-friendly; used for
 * product specifications and FAQ-style content.
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItem[];
  className?: string;
}) {
  return (
    <div className={cn('divide-y divide-border rounded-lg border border-border', className)}>
      {items.map((item, index) => (
        <details
          key={`${item.title}-${index}`}
          open={item.defaultOpen}
          className="group"
        >
          <summary className="text-body focus-ring flex cursor-pointer list-none items-center justify-between gap-2 p-4 font-medium">
            {item.title}
            <ChevronDown
              className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
              aria-hidden
            />
          </summary>
          <div className="text-body-sm px-4 pb-4 text-muted-foreground">
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}
