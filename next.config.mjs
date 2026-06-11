/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allow images served from the media store (Cloudflare R2) + its CDN.
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
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
};

export default nextConfig;
