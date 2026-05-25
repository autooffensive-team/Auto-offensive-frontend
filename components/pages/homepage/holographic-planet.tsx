"use client";

import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath, geoGraticule, geoBounds } from "d3-geo";

export default function HolographicPlanet() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    if (containerWidth === 0 || containerHeight === 0) return;

    // ─── Detect mobile for performance tuning ──────────────────
    const isMobile = containerWidth < 768;
    const DOT_SPACING = isMobile ? 3.0 : 2.0;
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // ─── Canvas setup ──────────────────────────────────────────
    const canvas = document.createElement("canvas");
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const radius = Math.min(containerWidth, containerHeight) / 2.5;

    // ─── D3 projection ─────────────────────────────────────────
    const projection = geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90);

    const path = geoPath().projection(projection).context(ctx);
    const graticule = geoGraticule();

    // ─── State ─────────────────────────────────────────────────
    let landFeatures: any = null;
    let landDots: [number, number][] = [];
    const rotation: [number, number] = [0, 0];
    let autoRotate = true;
    let destroyed = false;
    let planetVisible = false;
    let planetOpacity = 0;
    let introStart = 0;
    let introActive = false;

    // Delay planet appearance - show shortly after comets start sweeping
    const PLANET_DELAY = 1200;
    const PLANET_FADE_DURATION = 250;
    const PLANET_INTRO_DURATION = 600;
    const PLANET_START_SCALE = 0.42;
    const PLANET_SPIN_DEGREES = 360;
    let planetFadeStart = 0;

    const planetDelayTimer = setTimeout(() => {
      planetVisible = true;
      planetFadeStart = performance.now();
      introStart = planetFadeStart;
      introActive = true;
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
      const spacing = DOT_SPACING;
      features.features.forEach((feature: any) => {
        const bounds = geoBounds(feature);
        const [[minLng, minLat], [maxLng, maxLat]] = bounds;
        for (let lng = minLng; lng <= maxLng; lng += spacing) {
          for (let lat = minLat; lat <= maxLat; lat += spacing) {
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
    // Cache theme to avoid DOM reads every frame
    let cachedDark = isDark();
    let themeCheckCounter = 0;

    const render = () => {
      ctx.clearRect(0, 0, containerWidth, containerHeight);

      // Don't render until planet is visible
      if (!planetVisible) return;

      // Only check theme every 60 frames to avoid forced reflows
      if (++themeCheckCounter >= 60) {
        themeCheckCounter = 0;
        cachedDark = isDark();
      }

      const dark = cachedDark;
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
        const dotRadius = (dark ? 0.8 : 1.0) * scaleFactor;
        ctx.beginPath();
        landDots.forEach((dot) => {
          const projected = projection(dot);
          if (projected) {
            ctx.moveTo(projected[0] + dotRadius, projected[1]);
            ctx.arc(projected[0], projected[1], dotRadius, 0, 2 * Math.PI);
          }
        });
        ctx.fillStyle = dotFill;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // ─── Animation loop (frame-throttled) ──────────────────────
    let animId: number;
    let lastFrame = 0;
    let lastRenderTime = 0;
    const AUTO_ROTATE_DEGREES_PER_MS = 0.009;

    const animate = (timestamp: number) => {
      if (destroyed) return;
      animId = requestAnimationFrame(animate);

      // Frame throttling for mobile performance
      const sinceLast = timestamp - lastRenderTime;
      if (sinceLast < FRAME_INTERVAL) return;
      lastRenderTime = timestamp - (sinceLast % FRAME_INTERVAL);

      const delta = lastFrame ? timestamp - lastFrame : 16.67;
      lastFrame = timestamp;

      // Update planet fade-in opacity
      if (planetVisible && planetOpacity < 1) {
        const elapsed = timestamp - planetFadeStart;
        planetOpacity = Math.min(1, elapsed / PLANET_FADE_DURATION);
      }

      // Intro: pop from small to full size while doing one fast full spin.
      if (introActive) {
        const introElapsed = timestamp - introStart;
        const introProgress = Math.min(1, introElapsed / PLANET_INTRO_DURATION);
        const eased = easeOutCubic(introProgress);

        projection.scale(radius * (PLANET_START_SCALE + (1 - PLANET_START_SCALE) * eased));
        rotation[0] = PLANET_SPIN_DEGREES * eased;
        projection.rotate(rotation);

        if (introProgress >= 1) {
          introActive = false;
          projection.scale(radius);
          rotation[0] = PLANET_SPIN_DEGREES;
        }
      } else if (autoRotate) {
        projection.scale(radius);
        rotation[0] += delta * AUTO_ROTATE_DEGREES_PER_MS;
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

    // ─── Touch interaction (mobile) ────────────────────────────
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      autoRotate = false;
      const touch = event.touches[0];
      const startX = touch.clientX;
      const startY = touch.clientY;
      const startRotation: [number, number] = [...rotation];

      const handleTouchMove = (moveEvent: TouchEvent) => {
        if (moveEvent.touches.length !== 1) return;
        const t = moveEvent.touches[0];
        const sensitivity = 0.4;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity));
        projection.rotate(rotation);
        render();
      };

      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
        setTimeout(() => {
          autoRotate = true;
        }, 50);
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: true });
      document.addEventListener("touchend", handleTouchEnd);
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });

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

    // ─── Resize (debounced) ────────────────────────────────────
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w === 0 || h === 0) return;
          const newDpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
          canvas.width = w * newDpr;
          canvas.height = h * newDpr;
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
          ctx.setTransform(newDpr, 0, 0, newDpr, 0, 0);
          const newRadius = Math.min(w, h) / 2.5;
          const introProgress = introActive
            ? Math.min(1, (performance.now() - introStart) / PLANET_INTRO_DURATION)
            : 1;
          const introScale = introActive
            ? PLANET_START_SCALE + (1 - PLANET_START_SCALE) * easeOutCubic(introProgress)
            : 1;

          projection
            .scale(newRadius * introScale)
            .translate([w / 2, h / 2]);
          render();
        }
      }, 100);
    });
    resizeObserver.observe(container);

    // ─── Visibility: pause when off-screen ─────────────────────
    let pageVisible = true;
    const handleVisibility = () => {
      pageVisible = !document.hidden;
      if (pageVisible && !destroyed) {
        lastFrame = 0;
        lastRenderTime = 0;
        animId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // ─── Cleanup ───────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      clearTimeout(planetDelayTimer);
      clearTimeout(resizeTimeout);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("visibilitychange", handleVisibility);
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
        contain: "layout paint style",
      }}
    />
  );
}
