"use client";

const HelpBlobs = () => (
  <>
    <style>{`
      @keyframes ph-float1 {
        0%   { transform: translate(0, 0) scale(1); }
        30%  { transform: translate(-14px, 16px) scale(1.02); }
        65%  { transform: translate(10px, -10px) scale(0.98); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes ph-float2 {
        0%   { transform: translate(0, 0); }
        40%  { transform: translate(12px, -14px); }
        75%  { transform: translate(-8px, 8px); }
        100% { transform: translate(0, 0); }
      }
      @keyframes ph-float3 {
        0%   { transform: translate(0, 0) scale(1); }
        50%  { transform: translate(-10px, -12px) scale(1.03); }
        100% { transform: translate(0, 0) scale(1); }
      }

      @keyframes ph-blob-in-1 {
        0%   { opacity: 0; transform: scale(0.72); }
        40%  { opacity: 0.85; transform: scale(1.06); }
        65%  { opacity: 1;    transform: scale(0.97); }
        82%  { transform: scale(1.02); }
        100% { opacity: 1;    transform: scale(1); }
      }
      @keyframes ph-blob-in-2 {
        0%   { opacity: 0; transform: scale(0.65); }
        45%  { opacity: 0.78; transform: scale(1.08); }
        68%  { opacity: 1;    transform: scale(0.96); }
        84%  { transform: scale(1.02); }
        100% { opacity: 1;    transform: scale(1); }
      }
      @keyframes ph-blob-in-3 {
        0%   { opacity: 0; transform: scale(0.7); }
        42%  { opacity: 0.7;  transform: scale(1.05); }
        70%  { opacity: 1;    transform: scale(0.98); }
        100% { opacity: 1;    transform: scale(1); }
      }

      .ph-g1 {
        opacity: 0;
        animation:
          ph-blob-in-1 2s   cubic-bezier(.34,1.4,.64,1) 0.05s  forwards,
          ph-float1     24s  ease-in-out                 2.05s  infinite;
      }
      .ph-g2 {
        opacity: 0;
        animation:
          ph-blob-in-2 2.2s cubic-bezier(.34,1.4,.64,1) 0.2s   forwards,
          ph-float2     28s  ease-in-out                 2.4s   infinite;
      }
      .ph-g3 {
        opacity: 0;
        animation:
          ph-blob-in-3 2.4s cubic-bezier(.34,1.4,.64,1) 0.38s  forwards,
          ph-float3     32s  ease-in-out                 2.78s  infinite;
      }
    `}</style>

    <svg
      width="100%" height="100%"
      viewBox="0 0 1200 800" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
    >
      <defs>
        <linearGradient id="ph_lg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00BCA1" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#00BCA1" stopOpacity="0.2"  />
        </linearGradient>
        <linearGradient id="ph_lg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#00BCA1" stopOpacity="0.5" />
          <stop offset="50%"  stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="ph_lg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#D4A96A" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D4A96A" stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id="ph_rg4" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#A78BDB" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#A78BDB" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="ph_rg5" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#00BCA1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#00BCA1" stopOpacity="0"    />
        </radialGradient>

        <filter id="ph_f1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="38" /></filter>
        <filter id="ph_f2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="28" /></filter>
        <filter id="ph_f3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="52" /></filter>
        <filter id="ph_f4" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="65" /></filter>
      </defs>

      <g className="ph-g1">
        <ellipse cx="180" cy="590" rx="310" ry="220" fill="url(#ph_lg1)" filter="url(#ph_f3)" transform="rotate(-25 180 590)" />
        <rect x="820" y="60" width="360" height="280" rx="120" fill="url(#ph_lg2)" filter="url(#ph_f1)" transform="rotate(12 1000 200)" />
      </g>

      <g className="ph-g2">
        <circle cx="90" cy="120" r="160" fill="url(#ph_lg1)" filter="url(#ph_f2)" opacity="0.55" />
        <ellipse cx="1050" cy="580" rx="270" ry="190" fill="url(#ph_lg3)" filter="url(#ph_f1)" transform="rotate(-8 1050 580)" />
      </g>

      <g className="ph-g3">
        <circle cx="1120" cy="280" r="180" fill="url(#ph_rg4)" filter="url(#ph_f2)" opacity="0.65" />
        <ellipse cx="640" cy="680" rx="220" ry="130" fill="url(#ph_lg2)" filter="url(#ph_f1)" opacity="0.45" transform="rotate(6 640 680)" />
      </g>

      <ellipse cx="600" cy="390" rx="340" ry="210" fill="url(#ph_rg5)" filter="url(#ph_f4)" opacity="0.35" />
    </svg>
  </>
);

const heroStyles = `
  @keyframes ph-fade-up {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes ph-slide-reveal {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ph-eyebrow { opacity: 0; animation: ph-fade-up .55s cubic-bezier(.16,1,.3,1) .1s forwards; }
  .ph-h1 { opacity: 0; animation: ph-slide-reveal .72s cubic-bezier(.16,1,.3,1) .22s forwards; }
  .ph-sub { opacity: 0; animation: ph-fade-up .62s cubic-bezier(.16,1,.3,1) .38s forwards; }
`;

export default function HelpCenterHero() {
  return (
    <section
      className="relative overflow-hidden border-b border-black/9 dark:border-white/9 bg-white dark:bg-[#111113] min-h-screen flex items-center justify-center"
      style={{ padding: "clamp(100px,14vw,160px) clamp(24px,6vw,80px) clamp(60px,8vw,96px)" }}
    >
      <style>{heroStyles}</style>

      <div className="absolute inset-0 z-0 overflow-hidden">
        <HelpBlobs />
      </div>

      <div className="absolute inset-0 pointer-events-none z-1 dark:hidden" style={{ background: "radial-gradient(ellipse 72% 75% at 50% 50%, transparent 18%, white 82%)" }} />
      <div className="absolute inset-0 pointer-events-none z-1 hidden dark:block" style={{ background: "radial-gradient(ellipse 72% 75% at 50% 50%, transparent 18%, #111113 82%)" }} />

      <div className="absolute bottom-0 left-0 right-0 h-px z-3" style={{ background: "linear-gradient(90deg, transparent, rgba(0,188,161,0.32) 40%, rgba(0,188,161,0.32) 60%, transparent)" }} />

      <div className="relative z-2 w-full max-w-7xl mx-auto flex flex-col items-center text-center gap-8 lg:gap-2">
        <div>
          <div className="ph-eyebrow inline-flex items-center gap-2.5 text-[11px] tracking-[0.18em] uppercase text-[#00BCA1] mb-6 font-sans">
            <span className="w-5 h-[1.5px] bg-[#00BCA1] opacity-55 rounded inline-block" />
            Support
            <span className="w-5 h-[1.5px] bg-[#00BCA1] opacity-55 rounded inline-block" />
          </div>
          <h1 className="ph-h1 font-heading font-bold leading-none text-[#1A1A1A] dark:text-[#EDEDED] tracking-[-0.03em]" style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}>
            Help<br />
            <em className="not-italic text-[#00BCA1]">Center</em>
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="ph-sub leading-[1.85] text-[#5C5C5C] dark:text-[#9A9A9A] max-w-104" style={{ fontSize: "20px" }}>
            Find answers to common questions about Auto Offensive, our pentesting platform.
          </p>
        </div>
      </div>
    </section>
  );
}