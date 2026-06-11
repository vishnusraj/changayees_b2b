/**
 * Static, non-secret app constants shared across the foundation.
 */

export const SITE = {
  name: 'Changayees',
  tagline: 'Institutional Uniform Procurement, Simplified',
  description:
    'Mobile-first B2B procurement platform for institutional uniforms — discover, request quotes, and track production.',
} as const;

/** Mobile bottom navigation (persistent across the public app). */
export const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Track', href: '/track' },
  { label: 'Catalogs', href: '/catalogs' },
  { label: 'Contact', href: '/contact' },
] as const;

/** Desktop top navigation. */
export const DESKTOP_NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Industries', href: '/industries' },
  { label: 'Catalogs', href: '/catalogs' },
  { label: 'Case Studies', href: '/case-studies' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Track Order', href: '/track' },
] as const;
