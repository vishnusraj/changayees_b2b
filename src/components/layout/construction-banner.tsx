import { Construction } from 'lucide-react';

/**
 * Site-wide notice that this is a work-in-progress deployment and all content
 * is placeholder/test data. Rendered at the very top of every page (root
 * layout), above all route-group headers. Remove before launch.
 */
export function ConstructionBanner() {
  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-neutral-900 px-4 py-2 text-center text-caption font-medium tracking-wide text-neutral-50 sm:text-body-sm"
    >
      <Construction className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden />
      <span>
        This website is under construction — all data shown is for testing
        purposes only.
      </span>
    </div>
  );
}
