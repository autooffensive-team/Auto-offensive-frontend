"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function HolographicPlanet() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    if (containerWidth === 0 || containerHeight === 0) return;

    // ─── Canvas setup ──────────────────────────────────────────
    const canvas = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const radius = Math.min(containerWidth, containerHeight) / 2.5;

    // ─── D3 projection ─────────────────────────────────────────
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = d3.geoPath().projection(projection).context(ctx);
    const graticule = d3.geoGraticule();

    // ─── State ─────────────────────────────────────────────────
    let landFeatures: any = null;
    let landDots: [number, number][] = [];
    const rotation: [number, number] = [0, 0];
    let autoRotate = true;
    let destroyed = false;
    let planetVisible = false;
    let planetOpacity = 0;

    // Delay planet appearance until after sweep comet finishes (~2.1s)
    const PLANET_DELAY = 1400;
    const PLANET_FADE_DURATION = 500; // ms to fade in
    let planetFadeStart = 0;

    const planetDelayTimer = setTimeout(() => {
      planetVisible = true;
      planetFadeStart = performance.now();
    }, PLANET_DELAY);

    // ─── Theme detection ───────────────────────────────────────
    const isDark = () => document.documentElement.classList.contains("dark");

    // ─── Point in polygon (for halftone dots) ──────────────────
    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point;
      let inside = false;
      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry;
      if (geometry.type === "Polygon") {
        if (!pointInPolygon(point, geometry.coordinates[0])) return false;
        for (let i = 1; i < geometry.coordinates.length; i++) {
          if (pointInPolygon(point, geometry.coordinates[i])) return false;
        }
        return true;
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) return true;
          }
        }
        return false;
      }
      return false;
    };

    const generateDots = (features: any) => {
      const dots: [number, number][] = [];
      const dotSpacing = 2.0;
      features.features.forEach((feature: any) => {
        const bounds = d3.geoBounds(feature);
        const [[minLng, minLat], [maxLng, maxLat]] = bounds;
        for (let lng = minLng; lng <= maxLng; lng += dotSpacing) {
          for (let lat = minLat; lat <= maxLat; lat += dotSpacing) {
            const point: [number, number] = [lng, lat];
            if (pointInFeature(point, feature)) {
              dots.push(point);
            }
          }
        }
      });
      return dots;
    };

    // ─── Render frame ──────────────────────────────────────────
    const render = () => {
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Don't render until planet is visible
      if (!planetVisible) return;

      const dark = isDark();
      const lineColor = dark ? "#00ffdd" : "#01509e";
      const gridColor = dark ? "rgba(0, 255, 221, 0.08)" : "rgba(1, 80, 158, 0.2)";
      const dotFill = dark ? "rgba(0, 255, 221, 0.35)" : "rgba(1, 80, 158, 0.5)";
      const outlineColor = dark ? "rgba(0, 255, 221, 0.3)" : "rgba(1, 80, 158, 0.6)";

      // Apply fade-in opacity
      ctx.globalAlpha = planetOpacity;

      const currentScale = projection.scale()!;
      const scaleFactor = currentScale / radius;

      // Globe background
      ctx.beginPath();
      ctx.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      if (!dark) {
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.fill();
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = dark ? 0.8 * scaleFactor : 1.2 * scaleFactor;
      ctx.globalAlpha = (dark ? 0.15 : 0.35) * planetOpacity;
      ctx.stroke();
      ctx.globalAlpha = planetOpacity;

      if (landFeatures) {
        // Graticule
        ctx.beginPath();
        path(graticule());
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = (dark ? 0.5 : 0.7) * scaleFactor;
        ctx.stroke();

        // Land outlines
        ctx.beginPath();
        landFeatures.features.forEach((feature: any) => {
          path(feature);
        });
        ctx.strokeStyle = outlineColor;
        ctx.lineWidth = (dark ? 0.8 : 1.2) * scaleFactor;
        ctx.stroke();

        // Halftone dots on land
        landDots.forEach((dot) => {
          const projected = projection(dot);
          if (projected) {
            ctx.beginPath();
            ctx.arc(projected[0], projected[1], (dark ? 0.8 : 1.0) * scaleFactor, 0, 2 * Math.PI);
            ctx.fillStyle = dotFill;
            ctx.fill();
          }
        });
      }

      ctx.globalAlpha = 1;
    };

    // ─── Animation loop ────────────────────────────────────────
    let animId: number;
    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30;

    const animate = (timestamp: number) => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);

      const delta = timestamp - lastFrame;
      if (delta < FRAME_INTERVAL) return;
      lastFrame = timestamp - (delta % FRAME_INTERVAL);

      // Update planet fade-in opacity
      if (planetVisible && planetOpacity < 1) {
        const elapsed = timestamp - planetFadeStart;
        planetOpacity = Math.min(1, elapsed / PLANET_FADE_DURATION);
      }

      // Auto-rotate
      if (autoRotate) {
        rotation[0] += 0.3;
        projection.rotate(rotation);
      }

      render();
    };

    // ─── Mouse interaction ─────────────────────────────────────
    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false;
      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number] = [...rotation];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.4;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity));
        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        setTimeout(() => {
          autoRotate = true;
        }, 50);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    canvas.addEventListener("mousedown", handleMouseDown);

    // ─── Load world data ───────────────────────────────────────
    const loadData = async () => {
      try {
        const response = await fetch("/ne_110m_land.json");
        if (!response.ok) throw new Error("Failed to load");
        landFeatures = await response.json();
        landDots = generateDots(landFeatures);
        render();
      } catch {
        // Silently fail — globe still renders without land
        render();
      }
    };

    loadData();
    animId = requestAnimationFrame(animate);

    // ─── Resize ────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w === 0 || h === 0) return;
        const newDpr = Math.min(window.devicePixelRatio, 2);
        canvas.width = w * newDpr;
        canvas.height = h * newDpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
        const newRadius = Math.min(w, h) / 2.5;
        projection.scale(newRadius).translate([w / 2, h / 2]);
        render();
      }
    });
    resizeObserver.observe(container);

    // ─── Cleanup ───────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      clearTimeout(planetDelayTimer);
      canvas.removeEventListener("mousedown", handleMouseDown);
      resizeObserver.disconnect();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-2"
      style={{
        isolation: "isolate",
        willChange: "transform",
        contain: "layout paint",
      }}
    />
  );
}
