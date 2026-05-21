import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://auto-offensive.com';
const siteName = 'Auto-Offensive';
const siteDescription = 'Next-Gen PaaS for Hackers - Automated Security Workflows and Pentesting Platform';
const defaultOgImagePath = '/Auto-Offensive.webp';

export interface PageMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

function normalizeSiteUrl(url: string): string {
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
}

function resolveMetadataUrl(pathOrUrl: string | undefined, baseUrl: string, fallbackPath: string): string {
  return new URL(pathOrUrl || fallbackPath, baseUrl).toString();
}

export function generateMetadata(options: PageMetadata): Metadata {
  const { title, description, image, url } = options;

  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const resolvedSiteUrl = normalizeSiteUrl(siteUrl);
  const imageUrl = resolveMetadataUrl(image, resolvedSiteUrl, defaultOgImagePath);
  const pageUrl = resolveMetadataUrl(url, resolvedSiteUrl, '/');

  return {
    title: fullTitle,
    description: description,
    metadataBase: new URL(resolvedSiteUrl),
    openGraph: {
      title: fullTitle,
      description: description,
      url: pageUrl,
      siteName: siteName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description,
      images: [imageUrl],
      creator: '@autooffensive',
    },
    other: {
      'telegram:card': 'summary_large_image',
      'telegram:title': fullTitle,
      'telegram:description': description,
      'telegram:image': imageUrl,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export const defaultMetadata: Metadata = {
  title: {
    default: siteName,
    template: '%s | Auto-Offensive',
  },
  description: siteDescription,
  keywords: ['pentesting', 'security', 'hacking', 'vulnerability scanner', 'ethical hacking', 'security automation', 'penetration testing', 'cybersecurity'],
  authors: [{ name: 'Auto-Offensive Team' }],
  creator: 'Auto-Offensive',
  publisher: 'Auto-Offensive',
  metadataBase: new URL(normalizeSiteUrl(siteUrl)),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: normalizeSiteUrl(siteUrl),
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: resolveMetadataUrl(undefined, normalizeSiteUrl(siteUrl), defaultOgImagePath),
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [resolveMetadataUrl(undefined, normalizeSiteUrl(siteUrl), defaultOgImagePath)],
    creator: '@autooffensive',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
