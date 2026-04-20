import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "About Us",
  description: "Learn about Auto-Offensive - the next-gen PaaS for hackers. Our mission to automate security workflows and make pentesting accessible to all.",
  image: "/og-about.png",
  url: "/about-us",
});

import AboutUs from "@/components/pages/aboutus/about-us";

export default function AboutUsPage() {
  return <AboutUs />;
}