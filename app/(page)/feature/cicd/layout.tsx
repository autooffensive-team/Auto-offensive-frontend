import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "CI/CD - Repository Scanning",
  description: "Integrate deep-code analysis directly into your SDLC. Detect vulnerabilities before they reach production with GitHub and GitLab integration.",
  image: "/og-cicd.png",
  url: "/feature/cicd",
});

export default function CICDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
