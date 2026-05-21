import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Platform Features",
  description:
    "Explore Auto-Offensive platform features including managed CLI workflows, repository scanning, AI-powered reporting, and a unified web orchestration dashboard.",
  image: "/Auto-Offensive.webp",
  url: "/feature",
});

export default function FeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
