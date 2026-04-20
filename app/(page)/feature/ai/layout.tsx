import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "AI - AI-Powered Reporting",
  description: "Transform raw vulnerability data into boardroom-ready intelligence. Our AI automates analysis, narrative generation, and remediation strategies.",
  image: "/og-ai.png",
  url: "/feature/ai",
});

export default function AILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
