"use client";

import { Monitor, ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Displays a full-screen overlay on mobile devices (< 768px) suggesting
 * the user switch to a desktop or tablet for the best scan experience.
 * Offers two actions: go back or dismiss and continue anyway.
 */
export function MobileScreenWarning() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setVisible(mql.matches);
    if (mql.matches) setTimeout(() => setMounted(true), 10);

    const handler = (e: MediaQueryListEvent) => {
      setVisible(e.matches);
      if (e.matches) setTimeout(() => setMounted(true), 10);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .msw-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          background: rgba(0, 5, 20, 0.75);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          font-family: 'DM Sans', sans-serif;
        }

        .msw-sheet {
          width: 100%;
          max-width: 480px;
          background: #ffffff;
          border-radius: 24px 24px 0 0;
          padding: 0 0 env(safe-area-inset-bottom, 0);
          overflow: hidden;
          transform: translateY(${mounted ? "0" : "100%"});
          transition: transform 0.38s cubic-bezier(0.32, 0.72, 0, 1);
          box-shadow: 0 -8px 40px rgba(0, 208, 178, 0.15), 0 -2px 8px rgba(0,0,0,0.1);
        }

        /* Top handle */
        .msw-handle {
          width: 40px;
          height: 4px;
          border-radius: 2px;
          background: #e0e0e0;
          margin: 12px auto 0;
        }

        /* Brand bar at the very top of the sheet */
        .msw-brand-bar {
          height: 3px;
          background: linear-gradient(90deg, #00d0b2 0%, #01509e 100%);
          margin-top: 10px;
        }

        /* Main content area */
        .msw-body {
          padding: 28px 28px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0;
        }

        /* Icon container */
        .msw-icon-ring {
          position: relative;
          width: 72px;
          height: 72px;
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .msw-icon-ring-bg {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #e6faf8 0%, #deeef9 100%);
        }

        .msw-icon-ring-border {
          position: absolute;
          inset: -1px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00d0b2, #01509e);
          z-index: 0;
        }

        .msw-icon-ring-inner {
          position: absolute;
          inset: 1px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e6faf8 0%, #deeef9 100%);
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .msw-icon-ring svg {
          width: 30px;
          height: 30px;
          color: #01509e;
          position: relative;
          z-index: 2;
        }

        /* Glow ring animation */
        @keyframes msw-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.18); }
        }
        .msw-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,208,178,0.25) 0%, transparent 70%);
          animation: msw-pulse 2.4s ease-in-out infinite;
          z-index: -1;
        }

        /* Typography */
        .msw-title {
          font-size: 18px;
          font-weight: 600;
          color: #0a1628;
          letter-spacing: -0.3px;
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .msw-desc {
          font-size: 14px;
          color: #64748b;
          line-height: 1.65;
          margin-bottom: 28px;
          max-width: 280px;
        }

        .msw-highlight {
          font-weight: 600;
          color: #01509e;
          font-family: 'DM Mono', monospace;
          font-size: 13px;
          letter-spacing: 0.01em;
        }

        /* Divider */
        .msw-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
          margin-bottom: 20px;
        }

        /* Buttons */
        .msw-actions {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .msw-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          border-radius: 12px;
          border: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          background: linear-gradient(135deg, #01509e 0%, #014e99 100%);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(1, 80, 158, 0.28);
          transition: all 0.18s ease;
          position: relative;
          overflow: hidden;
        }

        .msw-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #00d0b2, #01509e);
          opacity: 0;
          transition: opacity 0.18s ease;
        }

        .msw-btn-primary:hover::after {
          opacity: 1;
        }

        .msw-btn-primary span,
        .msw-btn-primary svg {
          position: relative;
          z-index: 1;
        }

        .msw-btn-primary:active {
          transform: scale(0.98);
        }

        .msw-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          background: #f8fafc;
          color: #64748b;
          transition: all 0.18s ease;
          letter-spacing: 0.01em;
        }

        .msw-btn-secondary:hover {
          background: #f1f5f9;
          border-color: #00d0b2;
          color: #01509e;
        }

        .msw-btn-secondary:active {
          transform: scale(0.98);
        }

        /* Footer note */
        .msw-footer-note {
          margin-top: 16px;
          padding-bottom: 8px;
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .msw-footer-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00d0b2;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .msw-sheet {
            background: #0d1829;
            box-shadow: 0 -8px 40px rgba(0, 208, 178, 0.12), 0 -2px 8px rgba(0,0,0,0.4);
          }
          .msw-handle { background: #2d3f55; }
          .msw-icon-ring-inner {
            background: linear-gradient(135deg, #0e2038 0%, #102444 100%);
          }
          .msw-icon-ring-bg {
            background: linear-gradient(135deg, #0e2038 0%, #102444 100%);
          }
          .msw-icon-ring svg { color: #00d0b2; }
          .msw-title { color: #f0f6ff; }
          .msw-desc { color: #7a91aa; }
          .msw-highlight { color: #00d0b2; }
          .msw-divider {
            background: linear-gradient(90deg, transparent, #1e3248 20%, #1e3248 80%, transparent);
          }
          .msw-btn-secondary {
            background: #112038;
            border-color: #1e3248;
            color: #7a91aa;
          }
          .msw-btn-secondary:hover {
            background: #162844;
            border-color: #00d0b2;
            color: #00d0b2;
          }
          .msw-footer-note { color: #3a556e; }
        }
      `}</style>

      <div className="msw-overlay">
        <div className="msw-sheet">
          <div className="msw-handle" />
          <div className="msw-brand-bar" />

          <div className="msw-body">
            {/* Icon */}
            <div className="msw-icon-ring">
              <div className="msw-glow" />
              <div className="msw-icon-ring-border" />
              <div className="msw-icon-ring-inner">
                <Monitor strokeWidth={1.75} />
              </div>
            </div>

            {/* Text */}
            <h2 className="msw-title">Best Viewed on Larger Screens</h2>
            <p className="msw-desc">
              This page is optimized for{" "}
              <span className="msw-highlight">desktop</span> or{" "}
              <span className="msw-highlight">tablet</span> screens.
              Please switch to a wider screen for the best experience.
            </p>

            <div className="msw-divider" />

            {/* Actions */}
            <div className="msw-actions">
              <button
                type="button"
                onClick={() => router.back()}
                className="msw-btn-primary"
              >
                <ArrowLeft size={16} />
                <span>Go Back</span>
              </button>

              <button
                type="button"
                onClick={() => setVisible(false)}
                className="msw-btn-secondary"
              >
                <X size={16} />
                Continue Anyway
              </button>
            </div>

            {/* Footer note */}
            <div className="msw-footer-note">
              <div className="msw-footer-dot" />
              Some features may be limited on mobile
            </div>
          </div>
        </div>
      </div>
    </>
  );
}