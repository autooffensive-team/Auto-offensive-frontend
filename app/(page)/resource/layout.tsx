import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Security Resources",
  description:
    "Browse Auto-Offensive security resources, platform guides, workflows, and technical references for automated pentesting and vulnerability research.",
  image: "/Auto-Offensive.webp",
  url: "/resource",
});

export default function ResourceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
