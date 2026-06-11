import type { MetadataRoute } from 'next';

/** PWA web app manifest — installable, app-like on mobile. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Changayees — Institutional Uniform Procurement',
    short_name: 'Changayees',
    description:
      'Discover, request quotes, and track bulk institutional uniform orders.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1480c4',
    categories: ['business', 'shopping', 'productivity'],
    icons: [
      {
        src: '/logo/images.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
