/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Pragmatic CSP — restricts sources while allowing Next's inline runtime,
    // self-hosted fonts, and remote (R2/CDN) images. Tighten with nonces later.
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The Neon serverless driver talks to Postgres over a WebSocket (via `ws`).
  // Bundling `ws` and its native helpers breaks frame masking
  // ("bufferUtil.mask is not a function"), so keep them as plain Node requires.
  serverExternalPackages: [
    '@prisma/adapter-neon',
    '@neondatabase/serverless',
    'ws',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allow images served from the media store (Cloudflare R2) + its CDN.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Demo/seed placeholder images — safe to remove with the demo data.
      { protocol: 'https', hostname: 'picsum.photos' },
      ...(process.env.MEDIA_PUBLIC_BASE_URL
        ? [
            {
              protocol: 'https',
              hostname: new URL(process.env.MEDIA_PUBLIC_BASE_URL).hostname,
            },
          ]
        : []),
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
