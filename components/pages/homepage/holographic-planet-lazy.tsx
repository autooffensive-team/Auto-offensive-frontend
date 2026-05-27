"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HolographicPlanet = dynamic(
  () => import("./holographic-planet"),
  { ssr: false }
);

export default function HolographicPlanetLazy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      {isVisible && <HolographicPlanet />}
    </div>
  );
}
