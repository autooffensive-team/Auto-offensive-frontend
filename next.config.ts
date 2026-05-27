import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// DOCS_APP_URL is server-side only (used in rewrites at build/runtime)
// NEXT_PUBLIC_DOCS_APP_URL is the client-side counterpart for navbar links
const docsAppUrl = (process.env.DOCS_APP_URL || 'https://auto-offensive-document.vercel.app').replace(/\/$/, '');

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Proxy /docs/* to the documentation app so both apps share the same origin in dev
  async rewrites() {
    return [
      {
        source: '/docs',
        destination: `${docsAppUrl}/docs`,
      },
      {
        source: '/docs/:path*',
        destination: `${docsAppUrl}/docs/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
