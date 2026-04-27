import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auto-Offensive",
    short_name: "AutoOffensive",
    description: "Automated Security Workflows and Pentesting Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f2",
    theme_color: "#00BCA1",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
