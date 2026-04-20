import PrivacyPolicy from "@/components/pages/privacy/privacy-policy";
import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Privacy Policy",
  description: "Auto-Offensive Privacy Policy - Learn how we collect, use, and protect your data when using our security platform.",
  image: "/og-privacy.png",
  url: "/privacy",
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}