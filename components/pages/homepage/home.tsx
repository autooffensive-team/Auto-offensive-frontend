import dynamic from "next/dynamic";
import HomeHero from "@/components/pages/homepage/home-hero";

// Below-the-fold sections: lazy-loaded to reduce initial JS bundle
const Features = dynamic(
  () => import("@/components/pages/homepage/feature"),
  { ssr: true }
);
const HomeVideo = dynamic(
  () => import("@/components/pages/homepage/home-video"),
  { ssr: true }
);
const AIBanner = dynamic(
  () => import("@/components/pages/homepage/ai-banner"),
  { ssr: true }
);
const Architecture = dynamic(
  () => import("@/components/pages/homepage/archtecture").then((mod) => ({ default: mod.Architecture })),
  { ssr: true }
);
const ThreeCards = dynamic(
  () => import("@/components/pages/homepage/threecards"),
  { ssr: true }
);
const TeamShowcase = dynamic(
  () => import("@/components/pages/homepage/teamshowcase"),
  { ssr: true }
);

export default function Home() {
  return (
    <main>
      <HomeHero />
      <Features />
      <HomeVideo />
      <AIBanner />
      <Architecture />
      <ThreeCards />
      <TeamShowcase />
    </main>
  );
}
