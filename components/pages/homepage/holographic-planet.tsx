"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Helper: convert lat/lng to 3D position on sphere ────────
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// ─── Helper: create arc curve between two surface points ──────
function createArcCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number
): THREE.QuadraticBezierCurve3 {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const arcHeight = start.distanceTo(end) * 0.45;
  mid.normalize().multiplyScalar(radius + arcHeight);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

// ─── Arc connection data ──────────────────────────────────────
const ARC_CONNECTIONS = [
  { from: { lat: 40.7, lng: -74.0 }, to: { lat: 51.5, lng: -0.12 } },
  { from: { lat: 35.7, lng: 139.7 }, to: { lat: -33.9, lng: 151.2 } },
  { from: { lat: 37.8, lng: -122.4 }, to: { lat: 1.35, lng: 103.8 } },
  { from: { lat: 25.2, lng: 55.3 }, to: { lat: 19.1, lng: 72.9 } },
  { from: { lat: 52.5, lng: 13.4 }, to: { lat: -33.9, lng: 18.4 } },
  { from: { lat: -23.5, lng: -46.6 }, to: { lat: 6.5, lng: 3.4 } },
];

const TAIL_LENGTH = 8; // number of trailing spheres behind comet

export default function HolographicPlanet() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (width === 0 || height === 0) return;

    // ─── Scene ─────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ─── Colors ────────────────────────────────────────────────
    const isDark = document.documentElement.classList.contains("dark");
    const shellColor = isDark ? 0x00ffdd : 0x0180ce;
    const ringColor = isDark ? 0x00d0b2 : 0x01509e;
    const primaryArc = isDark ? 0x00ffdd : 0x38bdf8;
    const cometHead = 0xffffff;

    // ─── Holographic shell ─────────────────────────────────────
    const shellGeo = new THREE.IcosahedronGeometry(1.6, 3);
    const shellMat = new THREE.MeshBasicMaterial({
      color: shellColor,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shell);

    // ─── Orbit ring ────────────────────────────────────────────
    const ringGeo = new THREE.RingGeometry(1.85, 1.87, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: ringColor,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    scene.add(ring);

    // ─── Arcs group ────────────────────────────────────────────
    const arcsGroup = new THREE.Group();
    shell.add(arcsGroup);

    const SPHERE_RADIUS = 1.6;
    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

    // ─── Materials ─────────────────────────────────────────────

    // Endpoint dot
    const dotMat = new THREE.MeshBasicMaterial({
      color: primaryArc,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });
    disposables.push(dotMat);

    // Pulse ring material (expanding ring around dots)
    const pulseRingMat = new THREE.MeshBasicMaterial({
      color: primaryArc,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    disposables.push(pulseRingMat);

    // Comet head material
    const cometHeadMat = new THREE.MeshBasicMaterial({
      color: cometHead,
      transparent: true,
      opacity: 1.0,
      depthWrite: false,
    });
    disposables.push(cometHeadMat);

    // Comet tail materials (progressively fading)
    const tailMats: THREE.MeshBasicMaterial[] = [];
    for (let i = 0; i < TAIL_LENGTH; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: primaryArc,
        transparent: true,
        opacity: 0.7 * (1 - i / TAIL_LENGTH),
        depthWrite: false,
      });
      tailMats.push(mat);
      disposables.push(mat);
    }

    // ─── Geometries ────────────────────────────────────────────
    const dotGeo = new THREE.SphereGeometry(0.01, 8, 8);
    const pulseRingGeo = new THREE.RingGeometry(0.015, 0.028, 24);
    const cometHeadGeo = new THREE.SphereGeometry(0.018, 10, 10);
    const tailGeos: THREE.SphereGeometry[] = [];
    for (let i = 0; i < TAIL_LENGTH; i++) {
      const size = 0.014 * (1 - i * 0.08);
      tailGeos.push(new THREE.SphereGeometry(Math.max(size, 0.004), 8, 8));
    }
    disposables.push(dotGeo, pulseRingGeo, cometHeadGeo, ...tailGeos);

    // ─── Arc data structures ───────────────────────────────────
    interface ArcData {
      curve: THREE.QuadraticBezierCurve3;
      // Progressive draw
      lineGeo: THREE.BufferGeometry;
      drawCount: number;
      maxCount: number;
      drawSpeed: number;
      drawDirection: number;
      // Comet
      cometHead: THREE.Mesh;
      tail: THREE.Mesh[];
      progress: number;
      speed: number;
      // Pulse rings
      pulseRings: THREE.Mesh[];
    }
    const arcs: ArcData[] = [];

    // ─── Build arcs ────────────────────────────────────────────
    for (let i = 0; i < ARC_CONNECTIONS.length; i++) {
      const conn = ARC_CONNECTIONS[i];
      const startPos = latLngToVector3(conn.from.lat, conn.from.lng, SPHERE_RADIUS);
      const endPos = latLngToVector3(conn.to.lat, conn.to.lng, SPHERE_RADIUS);
      const curve = createArcCurve(startPos, endPos, SPHERE_RADIUS);

      // ── Progressive arc line (dashed effect via drawRange) ──
      const SEGMENTS = 128;
      const curvePoints = curve.getPoints(SEGMENTS);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
      disposables.push(lineGeo);

      // Use a custom shader-like approach: vertex colors for gradient
      const colors = new Float32Array((SEGMENTS + 1) * 3);
      const startColor = new THREE.Color(primaryArc);
      const endColor = new THREE.Color(primaryArc).multiplyScalar(0.3);
      for (let j = 0; j <= SEGMENTS; j++) {
        const t = j / SEGMENTS;
        const c = new THREE.Color().lerpColors(startColor, endColor, t);
        colors[j * 3] = c.r;
        colors[j * 3 + 1] = c.g;
        colors[j * 3 + 2] = c.b;
      }
      lineGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      });
      disposables.push(lineMat);

      const line = new THREE.Line(lineGeo, lineMat);
      lineGeo.setDrawRange(0, 0); // start hidden
      arcsGroup.add(line);

      // ── Endpoint dots ──
      const startDot = new THREE.Mesh(dotGeo, dotMat);
      startDot.position.copy(startPos);
      arcsGroup.add(startDot);

      const endDot = new THREE.Mesh(dotGeo, dotMat);
      endDot.position.copy(endPos);
      arcsGroup.add(endDot);

      // ── Pulse rings at endpoints ──
      const pulseRings: THREE.Mesh[] = [];
      for (let p = 0; p < 2; p++) {
        const pr = new THREE.Mesh(pulseRingGeo, pulseRingMat.clone());
        pr.position.copy(p === 0 ? startPos : endPos);
        // Orient ring to face outward from sphere center
        pr.lookAt(new THREE.Vector3(0, 0, 0));
        arcsGroup.add(pr);
        pulseRings.push(pr);
        disposables.push(pr.material as THREE.Material);
      }

      // ── Comet head ──
      const head = new THREE.Mesh(cometHeadGeo, cometHeadMat);
      head.position.copy(startPos);
      head.visible = false;
      arcsGroup.add(head);

      // ── Comet tail (multiple fading spheres) ──
      const tail: THREE.Mesh[] = [];
      for (let t = 0; t < TAIL_LENGTH; t++) {
        const sphere = new THREE.Mesh(tailGeos[t], tailMats[t]);
        sphere.position.copy(startPos);
        sphere.visible = false;
        arcsGroup.add(sphere);
        tail.push(sphere);
      }

      arcs.push({
        curve,
        lineGeo,
        drawCount: 0,
        maxCount: SEGMENTS + 1,
        drawSpeed: 1.5 + Math.random() * 1.0, // points per frame
        drawDirection: 1,
        cometHead: head,
        tail,
        progress: 0,
        speed: 0.006 + Math.random() * 0.004,
        pulseRings,
      });
    }

    // Stagger arc animations with delays
    const arcDelays = ARC_CONNECTIONS.map((_, i) => i * 40); // frames delay

    // ─── Theme observer ────────────────────────────────────────
    const themeObserver = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      shellMat.color.setHex(dark ? 0x00ffdd : 0x0180ce);
      ringMat.color.setHex(dark ? 0x00d0b2 : 0x01509e);
      dotMat.color.setHex(dark ? 0x00ffdd : 0x38bdf8);
      pulseRingMat.color.setHex(dark ? 0x00ffdd : 0x38bdf8);
      // Update tail mats
      const newColor = dark ? 0x00ffdd : 0x38bdf8;
      for (const mat of tailMats) mat.color.setHex(newColor);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // ─── Mouse tracking ────────────────────────────────────────
    let targetRotX = 0;
    let targetRotY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.4;
      targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.25;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ─── Animation ─────────────────────────────────────────────
    let animId: number;
    let lastFrame = 0;
    let frameCount = 0;
    const FRAME_INTERVAL = 1000 / 30;

    function animate(timestamp: number) {
      animId = requestAnimationFrame(animate);

      const delta = timestamp - lastFrame;
      if (delta < FRAME_INTERVAL) return;
      lastFrame = timestamp - (delta % FRAME_INTERVAL);
      frameCount++;

      // Globe rotation
      shell.rotation.y += (targetRotY - shell.rotation.y) * 0.03;
      shell.rotation.x += (targetRotX - shell.rotation.x) * 0.03;
      shell.rotation.y += 0.001;
      shell.rotation.x += 0.0005;
      ring.rotation.z += 0.0003;

      // ── Animate each arc ──
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        const delay = arcDelays[i];

        // Phase 1: Progressive draw
        if (frameCount > delay) {
          if (arc.drawDirection === 1 && arc.drawCount < arc.maxCount) {
            arc.drawCount = Math.min(arc.drawCount + arc.drawSpeed, arc.maxCount);
            arc.lineGeo.setDrawRange(0, Math.floor(arc.drawCount));
          }

          // Phase 2: Comet travels once line is partially drawn
          if (arc.drawCount > arc.maxCount * 0.3) {
            arc.cometHead.visible = true;
            for (const t of arc.tail) t.visible = true;

            arc.progress += arc.speed;

            // Loop: when comet reaches end, reset
            if (arc.progress > 1) {
              arc.progress = 0;
              // Also reset draw for re-animation cycle
              arc.drawCount = 0;
              arc.lineGeo.setDrawRange(0, 0);
            }

            // Position comet head
            const headPos = arc.curve.getPoint(arc.progress);
            arc.cometHead.position.copy(headPos);

            // Position tail spheres behind the head
            for (let t = 0; t < TAIL_LENGTH; t++) {
              const tailProgress = arc.progress - (t + 1) * 0.02;
              if (tailProgress >= 0) {
                const tailPos = arc.curve.getPoint(tailProgress);
                arc.tail[t].position.copy(tailPos);
                arc.tail[t].visible = true;
              } else {
                arc.tail[t].visible = false;
              }
            }
          }
        }

        // ── Pulse rings animation ──
        for (const pr of arc.pulseRings) {
          const mat = pr.material as THREE.MeshBasicMaterial;
          const cycle = ((timestamp * 0.001) + i * 0.5) % 2.0; // 2s cycle
          const scale = 1.0 + cycle * 1.5;
          pr.scale.set(scale, scale, scale);
          mat.opacity = Math.max(0, 0.5 * (1 - cycle / 2.0));
        }
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(animate);

    // ─── Resize ────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w === 0 || h === 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    // ─── Cleanup ───────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      renderer.dispose();
      shellGeo.dispose(); shellMat.dispose();
      ringGeo.dispose(); ringMat.dispose();
      for (const d of disposables) d.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-2"
      style={{
        isolation: "isolate",
        willChange: "transform",
        contain: "layout paint",
      }}
    />
  );
}
