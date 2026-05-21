import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Pentesting Tools",
  description:
    "Discover the Auto-Offensive tool library with reconnaissance, scanning, and vulnerability assessment workflows designed for fast security testing.",
  image: "/Auto-Offensive.webp",
  url: "/tools",
});

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
