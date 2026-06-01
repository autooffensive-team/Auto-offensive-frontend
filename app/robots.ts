import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auto-offensive.org";

function normalizeSiteUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = normalizeSiteUrl(siteUrl);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/userdashboard/",
        "/dashboard/",
        "/guestdashboard/",
        "/logout",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
