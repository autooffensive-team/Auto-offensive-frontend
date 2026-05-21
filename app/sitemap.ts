import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://auto-offensive.com";

function normalizeSiteUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

const publicRoutes = [
  "/",
  "/about-us",
  "/contact-us",
  "/help-center",
  "/privacy",
  "/terms-of-service",
  "/tools",
  "/resource",
  "/feature",
  "/feature/ai",
  "/feature/cli",
  "/feature/cicd",
  "/feature/webui",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = normalizeSiteUrl(siteUrl);
  const lastModified = new Date();

  return publicRoutes.map((route) => ({
    url: new URL(route, baseUrl).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/tools" || route === "/resource" || route === "/feature" ? 0.8 : 0.7,
  }));
}
