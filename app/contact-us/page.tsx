import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Contact Us",
  description: "Get in touch with the Auto-Offensive team. Questions about our security platform, pricing, or integrations? We'd love to hear from you.",
  image: "/og-contact.png",
  url: "/contact-us",
});
import ContactUs from "@/components/pages/contact/contactus";

export default function ContactUsPage() {
  return <ContactUs />;
}