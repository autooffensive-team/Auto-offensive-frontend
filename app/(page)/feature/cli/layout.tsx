import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "CLI - Managed Command Line Interface",
  description: "Run 20+ professional security tools from your terminal with zero installation. Auto-Offensive CLI with cloud sync, OAuth, and real-time streaming.",
  image: "/og-cli.png",
  url: "/feature/cli",
});

export default function CLILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
