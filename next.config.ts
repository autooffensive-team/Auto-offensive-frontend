import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// DOCS_APP_URL is server-side only
const docsAppUrl = (
  process.env.DOCS_APP_URL ||
  'https://auto-offensive-document.vercel.app'
).replace(/\/$/, '');

const securityHeaders = [
  // Prevent XSS attacks
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com https://www.youtube.com https://s.ytimg.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: blob: https://images.unsplash.com https://s3.auto-offensive.org https://i.ytimg.com;
      font-src 'self' data:;
      connect-src 'self' https:;
      frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s{2,}/g, ' ').trim(),
  },

  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },

  // Disable dangerous browser features
  {
    key: 'Permissions-Policy',
    value: `
      camera=(),
      microphone=(),
      geolocation=(),
      payment=(),
      usb=()
    `.replace(/\s{2,}/g, ' ').trim(),
  },

  // Existing good security headers
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.auto-offensive.org',
        pathname: '/**',
      },
    ],
  },

  // Add security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },

  // Proxy /docs/* to the documentation app
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
