import TermsOfService from "@/components/pages/terms-of-service/terms-of-service";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Terms of Service",
  description: "Auto-Offensive Terms of Service - Understand the acceptable use policy and legal terms for using our security platform.",
  image: "/og-terms.png",
  url: "/terms-of-service",
});

export default function TermsOfServicePage() {
  return <TermsOfService />;
}