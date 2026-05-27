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
  
     //  SECURITY HEADERS 
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // HSTS 
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },

          //  Strong CSP 
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self'",
              "style-src 'self' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' https: data:",
              "connect-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },

          // Clickjacking protection
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          //  MIME sniffing protection
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          //  Permissions lockdown
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },

          // DNS prefetch control
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },

          //  Cross-origin isolation improvements
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
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
