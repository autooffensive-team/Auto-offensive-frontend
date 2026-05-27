import Home from "@/components/pages/homepage/home";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Next-Gen PaaS for Hackers",
  description: "Automated Security Workflows and Pentesting Platform - Run 20+ professional security tools from your terminal with zero installation.",
  image: "/Auto-Offensive.webp",
  url: "/",
});

export default function HomePage() {
  return <Home />;
}
