import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge configured to recognise our custom typography utilities
 * (defined in globals.css) as font-size classes. Without this, twMerge treats
 * e.g. `text-body` as a *colour* utility and would drop a real colour like
 * `text-primary-foreground` when both appear on one element — which is exactly
 * how the primary button lost its white text. Registering them in the
 * `font-size` group keeps colour and size independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display',
        'text-h1',
        'text-h2',
        'text-h3',
        'text-h4',
        'text-body-lg',
        'text-body',
        'text-body-sm',
        'text-caption',
        'text-overline',
      ],
    },
  },
});

/**
 * Merge Tailwind classes with conflict resolution.
 * Standard shadcn/ui utility — used by every component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
