"use client";

import dynamic from "next/dynamic";

const HolographicPlanet = dynamic(
  () => import("./holographic-planet"),
  { ssr: false }
);

export default function HolographicPlanetLazy() {
  return <HolographicPlanet />;
}
