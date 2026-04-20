import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Web UI - Orchestration Dashboard",
  description: "Orchestrate scans without the CLI. Guardian AI bridges open-source security tools and enterprise-grade usability with a unified workflow.",
  image: "/og-webui.png",
  url: "/feature/webui",
});

export default function WebUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
