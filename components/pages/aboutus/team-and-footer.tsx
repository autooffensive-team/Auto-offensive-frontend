"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";

const SOCIAL_LINKS = {
  github: { label: "GitHub", Icon: IconGithub },
  telegram: { label: "Telegram", Icon: IconTelegram },
  linkedin: { label: "LinkedIn", Icon: IconLinkedin },
};

const MENTORS = [
  {
    name: "Kim Chansokpheng",
    nameKh: "គឹម ចាន់សុផេង",
    role: "Cybersecurity Professional",
    roleKh: "អ្នកជំនាញសន្តិសុខសាយប័រ",
    badge: "Mentor",
    badgeKh: "ទីប្រឹក្សា",
    isMentor: true,
    slogan: "Defending the digital frontier,\none exploit at a time.",
    img: "/images/teacher_Sokpheng.jpg",
    social: {
      github: "https://github.com/sokpheng001",
      telegram: "https://t.me/sokpheng001",
      linkedin: "https://www.linkedin.com/in/kim-chansokpheng-6b6513267/",
    },
  },
  {
    name: "Sreng Chipor",
    nameKh: "ស្រេង ជីប៉",
    role: "Exploit Specialist",
    roleKh: "អ្នកជំនាញផ្នែក Exploit",
    badge: "Mentor",
    badgeKh: "ទីប្រឹក្សា",
    isMentor: true,
    slogan: "Your future self is always\n watching you.",
    img: "/images/teacher_chipor.png",
    social: {
      github: "https://github.com/jiporCK",
      telegram: "https://t.me/jiporsreng",
      linkedin: "https://www.linkedin.com/in/sreng-chipor-a31346239/",
    },
  },
];

const TEAM = [
  { name: "Chheng Panharoth", nameKh: "ឆេង បញ្ញារតន៍", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Team Leader", badgeKh: "មេក្រុម", slogan: "Building the engine\nunder the hood.", img: "/images/panharoth.jpg", social: { github: "https://github.com/Panharoth06", telegram: "https://t.me/panharoth_chheng", linkedin: "https://www.linkedin.com/in/panharath-chheng-59b305309/" } },
  { name: "Pech Rathanakmony", nameKh: "ប៉ិច រតនៈមុន្នី", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Team Leader", badgeKh: "មេក្រុម", slogan: "Pixels with\npurpose.", img: "/images/rathanakmony.jpg", social: { github: "https://github.com/aintantony", telegram: "https://t.me/aintantony", linkedin: "https://www.linkedin.com/in/rattanakmony-pech/" } },
  { name: "So Bohty", nameKh: "គ្រី សុបុត្រទី", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Ship fast,\nship secure.", img: "/images/bohty.jpg", social: { github: "https://github.com/Sobothty", telegram: "https://t.me/bothtyyy", linkedin: "https://www.linkedin.com/in/kry-sobothty/" } },
  { name: "Rin Bunvarn", nameKh: "រិន ប៊ុនវ៉ាន", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Every threat\nhas a signature.", img: "/images/bunvarn (2).JPG", social: { github: "https://github.com/bunniee00", telegram: "https://t.me/buniee0", linkedin: "https://www.linkedin.com/in/bunvarn-rin-1849593b6/" } },
  { name: "Ey Channim", nameKh: "អ៊ី ចាន់និម", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Teaching machines\nto hunt.", img: "/images/channim.JPG", social: { github: "https://github.com/ChannimEY", telegram: "https://t.me/Jii_nim1", linkedin: "https://www.linkedin.com/in/ey-channim-aa71703b3/" } },
  { name: "Mom Reaksmey", nameKh: "មុំ រស្មី", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Security that\nfeels effortless.", img: "/images/reaksmey.jpg", social: { github: "https://github.com/raksmeymom", telegram: "https://t.me/Raksmeyy41", linkedin: "https://www.linkedin.com/in/mom-raksmey-3b0288389/" } },
  { name: "Hor Ratha", nameKh: "ហោ រដ្ឋា", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Every endpoint\na fortress.", img: "/images/ratha.jpg", social: { github: "https://github.com/HorRatha", telegram: "https://t.me/xeinn7", linkedin: "https://www.linkedin.com/in/hor-ratha-42bb35388/" } },
  { name: "Ben Loemheng", nameKh: "ប៊ិន លឹមហេង", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Quality is\nnot optional.", img: "/images/loemheng.jpg", social: { github: "https://github.com/loemheng840", telegram: "https://t.me/loemheng840", linkedin: "https://www.linkedin.com/in/ben-loemheng-145533326/" } },
  { name: "Dina Pisethi", nameKh: "ឌីណា ពិសិទ្ធិ", role: "Full Stack Developer", roleKh: "អ្នកអភិវឌ្ឍ Full Stack", badge: "Member", badgeKh: "សមាជិក", slogan: "Find the crack\nbefore they do.", img: "/images/pisethi.jpg", social: { github: "https://github.com/j4nthirty1ne", telegram: "https://t.me/Dina_Pisethi", linkedin: "https://www.linkedin.com/in/dina-pisethi-623883358/" } },
];

function IconGithub() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function IconTelegram() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z" />
    </svg>
  );
}

function IconLinkedin() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function CardTraces() {
  return (
    <svg className="tf-traces" viewBox="0 0 300 420" preserveAspectRatio="none">
      <path className="tf-tb" d="M0 80 H24 V68 H48" /><path className="tf-tf tf-c1" d="M0 80 H24 V68 H48" />
      <path className="tf-tb" d="M0 126 H16 V136 H48" /><path className="tf-tf tf-c2" d="M0 126 H16 V136 H48" />
      <path className="tf-tb" d="M0 290 H24 V278 H48" /><path className="tf-tf tf-c3" d="M0 290 H24 V278 H48" />
      <path className="tf-tb" d="M0 336 H16 V346 H48" /><path className="tf-tf tf-c4" d="M0 336 H16 V346 H48" />
      <path className="tf-tb" d="M300 80 H276 V68 H252" /><path className="tf-tf tf-c2" d="M300 80 H276 V68 H252" />
      <path className="tf-tb" d="M300 126 H284 V136 H252" /><path className="tf-tf tf-c1" d="M300 126 H284 V136 H252" />
      <path className="tf-tb" d="M300 290 H276 V278 H252" /><path className="tf-tf tf-c4" d="M300 290 H276 V278 H252" />
      <path className="tf-tb" d="M300 336 H284 V346 H252" /><path className="tf-tf tf-c3" d="M300 336 H284 V346 H252" />
    </svg>
  );
}

type Member = (typeof MENTORS)[0] & { isMentor?: boolean; social?: Record<string, string> };

function CardInner({ member: m, index, isKhmer }: { member: Member; index: number; isKhmer: boolean }) {
  const displayName = isKhmer && m.nameKh ? m.nameKh : m.name;
  const badge = m.badge;
  const slogan = m.slogan.split("\n");

  return (
    <>
      <span className="tf-tick tf-tick-tl" />
      <span className="tf-tick tf-tick-tr" />
      <span className="tf-tick tf-tick-bl" />
      <span className="tf-tick tf-tick-br" />
      <CardTraces />
      <div className="tf-node-badge">{String(index + 1).padStart(2, "0")}</div>
      <div className="relative z-2 flex justify-center pt-3 mb-5">
        <div className="tf-photo-outer relative w-50 h-50 bg-[rgba(0,208,178,0.05)] rounded-full flex items-center justify-center">
          <img src={m.img} alt={displayName} width={200} height={200} className="w-50 h-50 rounded-full object-cover object-top border-[3px] border-[#F7F5F0] shadow-[0_4px_32px_rgba(0,0,0,0.15)] block" />
          <span className="tf-status-dot" />
        </div>
      </div>
      <div className="relative z-2">
        <div className="text-[1.18rem] font-bold text-[#0a1f1a] dark:text-white tracking-[-0.01em] mb-1">{displayName}</div>
        <div className="text-[0.78rem] font-semibold text-primary tracking-widest uppercase mb-3">{m.role}</div>
        <div className="w-7 h-px bg-linear-to-r from-primary to-[#00cfff] mx-auto mb-3 rounded-sm opacity-45" />
        <div className="text-[0.84rem] text-[#8aada6] leading-[1.9] tracking-[0.03em] mb-4 min-h-9 italic">
          <em className="text-[rgba(0,208,178,0.55)] not-italic">&gt;</em>
          {slogan[0]}<br />
          {slogan[1]} <em className="text-[rgba(0,208,178,0.55)] not-italic">_</em>
        </div>
        <div className="flex justify-center mb-4">
          {m.isMentor ? (
            <span className="text-[0.72rem] font-bold tracking-[0.14em] uppercase text-[#8a0000] bg-[rgba(200,10,10,0.05)] border border-[rgba(200,10,10,0.18)] rounded-full px-4 py-1">{badge}</span>
          ) : (
            <span className={`text-[0.72rem] font-bold tracking-[0.14em] uppercase rounded-full px-4 py-2 ${badge === "Team Leader" || badge === "មេក្រុម" ? "text-[#c97000] bg-[rgba(200,120,0,0.05)] border border-[rgba(200,120,0,0.18)]" : "text-primary bg-[rgba(0,208,178,0.06)] border border-[rgba(0,208,178,0.15)]"}`}>{badge}</span>
          )}
        </div>
        <div className="flex justify-center gap-3">
          {m.social && Object.entries(m.social).map(([key, url]) => {
            const link = SOCIAL_LINKS[key as keyof typeof SOCIAL_LINKS];
            if (!link) return null;
            const { Icon, label } = link;
            return <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className="tf-social-btn"><Icon /></a>;
          })}
        </div>
      </div>
    </>
  );
}

export default function TeamAndFooter() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";
  const titleFont = isKhmer
    ? "var(--font-noto-khmer), var(--font-hackdaddy), monospace"
    : "var(--font-hackdaddy), var(--font-noto-khmer), monospace";

  const copy = isKhmer
    ? {
        heroLine1: "ក្រុមមនុស្សនៅពីក្រោយ",
        heroLine2Lead: "វេទិកា",
        heroLine2Accent: "",
        heroBody:
          "អ្នកស្រាវជ្រាវសុវត្ថិភាព វិស្វករ និងអ្នកបង្កើត ដែលរួមគ្នាក្នុងបេសកកម្មតែមួយ គឺធ្វើឱ្យ offensive security ងាយប្រើសម្រាប់គ្រប់គ្នា។",
        mentorsLead: "ទីប្រឹក្សា",
        mentorsAccent: "របស់យើង",
        teamLead: "ក្រុម",
        teamAccent: "ស្នូល",
        footerPath: ["Scan", "Analyse", "Report"],
        footerLead: "ត្រៀមប្រើស្វ័យប្រវត្តិកម្មសម្រាប់",
        footerAccent: "ការធ្វើតេស្តសុវត្ថិភាពរបស់អ្នកឬនៅ?",
        footerBody:
          "ចូលរួមជាមួយអ្នកអភិវឌ្ឍជាច្រើនដែលស្កេនឆ្លាតវៃជាងមុន។ មិនចាំបាច់ CLI មិនស្មុគស្មាញ មានតែលទ្ធផល។",
        cta: "ចាប់ផ្តើមស្កេនឥតគិតថ្លៃ",
        copyright: "© 2026 Auto-Offensive · រក្សាសិទ្ធិគ្រប់យ៉ាង",
      }
    : {
        heroLine1: "The People Behind",
        heroLine2Lead: "the",
        heroLine2Accent: "Platform",
        heroBody:
          "Security researchers, engineers and builders united by one mission: make offensive security accessible to everyone.",
        mentorsLead: "Our",
        mentorsAccent: "Mentors",
        teamLead: "Core",
        teamAccent: "Team",
        footerPath: ["Scan", "Analyse", "Report"],
        footerLead: "Ready to automate your",
        footerAccent: "security testing",
        footerBody:
          "Join thousands of engineers who scan smarter, not harder. No CLI. No complexity. Just results.",
        cta: "Start a Free Scan",
        copyright: "© 2026 Auto-Offensive · All rights reserved",
      };

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => {
              (e.target as HTMLElement).classList.add("tf-visible");
            }, 50);
          }
        }),
      { threshold: 0.12, rootMargin: "40px" }
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const bg = bgRef.current;
    if (!bg) return;
    const handleScroll = () => {
      const rect = bg.parentElement?.getBoundingClientRect();
      if (rect) {
        const scrollProgress = Math.max(0, Math.min(1, -rect.top / (rect.height - window.innerHeight)));
        bg.style.transform = `translateY(${scrollProgress * 30}%)`;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full bg-[#F7F5F0] dark:bg-[#09090B]">
      <style>{`
        @keyframes tf-spin { to { transform: rotate(360deg); } }
        @keyframes tf-blink { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes tf-flow { to { stroke-dashoffset: 0; } }
        .ao-card { max-width: 340px; width: 100%; margin: 0 auto; padding: 32px 26px 28px; }
        .tf-card { opacity: 0; transform: translateY(40px) scale(0.92); transition: opacity 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.75s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-color 0.2s, box-shadow 0.2s; }
        .tf-card.tf-visible { opacity: 1; transform: translateY(0) scale(1); }
        .tf-card:hover { border-color: rgba(0,208,178,.22) !important; }
        .tf-card--mentor:hover { border-color: rgba(255,59,59,0.4) !important; }
        .tf-intro::before { content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%); width: 560px; height: 260px; background: radial-gradient(ellipse, rgba(0,208,178,.04) 0%, transparent 70%); pointer-events: none; }
        .tf-photo-outer::before { content: ''; position: absolute; inset: -10px; border-radius: 50%; border: 2px solid transparent; border-top-color: #00D0B2; border-right-color: rgba(0,207,255,.6); animation: tf-spin 6s linear infinite; }
        .tf-photo-outer::after { content: ''; position: absolute; inset: -20px; border-radius: 50%; border: 1.5px solid rgba(0,208,178,.12); }
        .tf-status-dot { position: absolute; bottom: 8px; right: 8px; width: 14px; height: 14px; border-radius: 50%; background: #00D0B2; border: 2.5px solid #F7F5F0; box-shadow: 0 0 8px rgba(0,208,178,.4); animation: tf-blink 2.4s ease-in-out infinite; }
        .tf-social-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(0,208,178,.12); background: transparent; display: flex; align-items: center; justify-content: center; color: #8aada6; text-decoration: none; transition: border-color .18s, color .18s, background .18s; position: relative; cursor: pointer; }
        .tf-social-btn:hover { border-color: rgba(0,208,178,.4); color: #00D0B2; background: rgba(0,208,178,.06); }
        .tf-social-btn::after { content: attr(title); position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%) translateY(4px); background: #0a1f1a; color: #e0f5f1; font-size: 9px; font-weight: 700; letter-spacing: .08em; white-space: nowrap; padding: 3px 8px; border-radius: 6px; opacity: 0; pointer-events: none; transition: opacity .15s, transform .15s; z-index: 99; }
        .tf-social-btn:hover::after { opacity: 1; transform: translateX(-50%) translateY(0); }
        .tf-node-badge { position: absolute; top: 14px; right: 18px; font-size: 9px; font-weight: 700; letter-spacing: .12em; color: rgba(0,208,178,.4); font-family: monospace; z-index: 3; }
        .tf-card--mentor .tf-node-badge { color: rgba(200,80,30,.4); }
        .tf-traces { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; z-index: 0; opacity: .25; }
        .tf-tb { stroke: rgba(0,208,178,.08); stroke-width: 1; fill: none; }
        .tf-tf { fill: none; stroke-width: 1; stroke-dasharray: 14 200; stroke-dashoffset: 214; animation: tf-flow 4s cubic-bezier(.4,0,.85,1) infinite; }
        .tf-c1 { stroke: #00D0B2; }
        .tf-c2 { stroke: #00cfff; animation-delay: -1.4s; }
        .tf-c3 { stroke: #00D0B2; animation-delay: -2.6s; }
        .tf-c4 { stroke: #00cfff; animation-delay: -.8s; }
        .tf-tick { position: absolute; width: 100px; height: 50px; pointer-events: none; }
        .tf-tick-tl { top:12px; left:12px; border-top:1px solid rgba(0,208,178,.35); border-left:1px solid rgba(0,208,178,.35); }
        .tf-tick-tr { top:12px; right:12px; border-top:1px solid rgba(0,207,255,.3); border-right:1px solid rgba(0,207,255,.3); }
        .tf-tick-bl { bottom:12px; left:12px; border-bottom:1px solid rgba(0,207,255,.3); border-left:1px solid rgba(0,207,255,.3); }
        .tf-tick-br { bottom:12px; right:12px; border-bottom:1px solid rgba(0,208,178,.35); border-right:1px solid rgba(0,208,178,.35); }
        .tf-section-path { position: relative; width: 100%; padding: 0 6%; margin: 12px 0 32px; }
        .tf-section-path-inner { position: relative; height: 24px; display: flex; align-items: center; }
        .tf-section-path-line { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(0,208,178,.2) 10%, rgba(0,208,178,.35) 50%, rgba(0,208,178,.2) 90%, transparent 100%); }
        .tf-section-path-line--mentor { background: linear-gradient(90deg, transparent 0%, rgba(200,80,30,.18) 10%, rgba(200,80,30,.3) 50%, rgba(200,80,30,.18) 90%, transparent 100%); }
        .tf-section-path-nodes { position: relative; z-index: 1; width: 100%; display: flex; justify-content: space-around; }
        .tf-path-node { width: 22px; height: 22px; border-radius: 50%; background: #F7F5F0; border: 1px solid rgba(0,208,178,.35); display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; letter-spacing: .06em; color: rgba(0,208,178,.7); font-family: monospace; }
        .dark .tf-path-node { background: #09090B; }
        .tf-path-node--mentor { border-color: rgba(200,80,30,.35); color: rgba(200,80,30,.7); }
        .tf-footer-grid { position: absolute; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(0,208,178,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,208,178,.035) 1px, transparent 1px); background-size: 72px 72px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%); }
        .tf-footer::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 55% 45% at 50% 50%, rgba(0,208,178,.04) 0%, transparent 70%); pointer-events: none; }
        .tf-footer-path { position: relative; width: 100%; max-width: 560px; margin: 0 auto 40px; padding: 0 20px; }
        .tf-footer-path-track { position: relative; height: 1px; background: linear-gradient(90deg, transparent, rgba(0,208,178,.3) 20%, rgba(0,208,178,.3) 80%, transparent); margin: 0 28px; }
        .tf-footer-path-nodes { position: absolute; top: 50%; left: 0; right: 0; transform: translateY(-50%); display: flex; justify-content: space-between; }
        .tf-footer-path-node { width: 28px; height: 28px; border-radius: 50%; background: #F7F5F0; border: 1px solid rgba(0,208,178,.3); display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 700; color: rgba(0,208,178,.6); font-family: monospace; letter-spacing: .06em; margin-top: -13px; }
        .dark .tf-footer-path-node { background: #09090B; }
        .tf-footer-path-label { display: flex; justify-content: space-between; padding: 6px 28px 0; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: rgba(0,208,178,.35); font-family: monospace; font-weight: 600; }
        .tf-grid { display: grid; gap: 75px; justify-items: center; }
        .tf-grid-2 { grid-template-columns: repeat(2, 340px); justify-content: center; }
        .tf-grid-3 { grid-template-columns: repeat(3, 340px); justify-content: center; }
        @media (max-width: 1120px) { .tf-grid-3 { grid-template-columns: repeat(2, 340px); } }
        @media (max-width: 740px) { .tf-grid-2, .tf-grid-3 { grid-template-columns: 340px; } }
        .tf-gradient-wrapper { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; will-change: transform; }
        .tf-gradient-bg { width: 100%; height: 120%; will-change: transform; }
        .tf-body-text { font-size: 16px; }
        @media (min-width: 768px) { .tf-body-text { font-size: 18px; } }
        @media (min-width: 1024px) { .tf-body-text { font-size: 20px; } }
      `}</style>

      <div
        id="team-footer-section"
        className="relative mx-auto w-full max-w-7xl bg-[#F7F5F0] dark:bg-[#09090B] text-[#0a1f1a] dark:text-[#e6f5f2] overflow-hidden scroll-mt-24"
        style={{ fontFamily: bodyFont }}
      >
        <div className="tf-gradient-wrapper">
          <div ref={bgRef} className="tf-gradient-bg">
            <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", top: 0, left: 0 }}>
              <defs>
                <linearGradient id="tf_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#00D0B2", stopOpacity: 0.25 }} /><stop offset="100%" style={{ stopColor: "#0ea5e9", stopOpacity: 0.15 }} /></linearGradient>
                <linearGradient id="tf_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: "#0ea5e9", stopOpacity: 0.2 }} /><stop offset="50%" style={{ stopColor: "#00D0B2", stopOpacity: 0.18 }} /><stop offset="100%" style={{ stopColor: "#00cfff", stopOpacity: 0.12 }} /></linearGradient>
                <radialGradient id="tf_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{ stopColor: "#00cfff", stopOpacity: 0.22 }} /><stop offset="100%" style={{ stopColor: "#00D0B2", stopOpacity: 0.08 }} /></radialGradient>
                <filter id="tf_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
                <filter id="tf_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="28" /></filter>
                <filter id="tf_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50" /></filter>
              </defs>
              <ellipse cx="150" cy="480" rx="240" ry="160" fill="url(#tf_grad1)" filter="url(#tf_blur1)" />
              <rect x="520" y="120" width="280" height="240" rx="75" fill="url(#tf_grad2)" filter="url(#tf_blur2)" />
              <circle cx="680" cy="420" r="140" fill="url(#tf_grad3)" filter="url(#tf_blur3)" opacity="0.5" />
              <ellipse cx="80" cy="180" rx="160" ry="110" fill="#00D0B2" filter="url(#tf_blur2)" opacity="0.15" />
            </svg>
          </div>
        </div>
        <div className="relative z-10 w-full h-px bg-linear-to-r from-transparent via-[rgba(0,208,177,0.45)] to-transparent" />

        <div className="relative z-10 tf-intro px-[6%] pt-23 pb-10 text-center overflow-hidden">
          <h2 className="text-[clamp(2rem,3.6vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.035em] text-[#0a1f1a] dark:text-white mb-[0.9rem]" style={{ fontFamily: titleFont }}>
            {copy.heroLine1}<br />
            {isKhmer ? (
              <>{copy.heroLine2Lead}</>
            ) : (
              <>{copy.heroLine2Lead} <em className="text-primary not-italic">{copy.heroLine2Accent}</em></>
            )}
          </h2>
          <p className="tf-body-text text-[#4a6e65] dark:text-[#9cb8b1] max-w-115 mx-auto leading-[1.8]">{copy.heroBody}</p>
        </div>

        <div className="relative z-10 px-[6%] pt-6 pb-3">
          <div className="mb-4">
            <h2 className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold tracking-[-0.03em] text-[#0a1f1a] dark:text-white mb-[0.35rem]" style={{ fontFamily: titleFont }}>
              {copy.mentorsLead} <em className="text-primary not-italic">{copy.mentorsAccent}</em>
            </h2>
          </div>

          <div className="tf-section-path">
            <div className="tf-section-path-inner">
              <div className="tf-section-path-line tf-section-path-line--mentor" />
              <div className="tf-section-path-nodes">
                {MENTORS.map((_, i) => (
                  <div key={i} className="tf-path-node tf-path-node--mentor">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tf-grid tf-grid-2">
            {MENTORS.map((m, i) => (
              <div
                key={m.name}
                className="tf-card tf-card--mentor ao-card relative bg-[rgba(247,245,240,0.42)] dark:bg-[#09090B] backdrop-blur-2 border border-[rgba(200,134,10,0.12)] rounded-2xl text-center overflow-hidden"
                ref={(el) => { cardRefs.current[i] = el; }}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <CardInner member={m} index={i} isKhmer={isKhmer} />
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-[6%] my-8 h-px bg-linear-to-r from-transparent via-teal-400/10 to-transparent" />

        <div className="relative z-10 px-[6%] pt-2 pb-3">
          <div className="mb-4">
            <h2 className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold tracking-[-0.03em] text-[#0a1f1a] dark:text-white mb-[0.35rem]" style={{ fontFamily: titleFont }}>
              {copy.teamLead} <em className="text-primary not-italic">{copy.teamAccent}</em>
            </h2>
          </div>

          <div className="tf-section-path">
            <div className="tf-section-path-inner">
              <div className="tf-section-path-line" />
              <div className="tf-section-path-nodes">
                {TEAM.map((_, i) => (
                  <div key={i} className="tf-path-node">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="tf-grid tf-grid-3">
            {TEAM.map((m, i) => (
              <div
                key={m.name}
                className="tf-card ao-card relative backdrop-blur-2 rounded-2xl text-center overflow-hidden border border-[rgba(0,208,178,0.1)]"
                ref={(el) => { cardRefs.current[MENTORS.length + i] = el; }}
                style={{ transitionDelay: `${(i % 3) * 60}ms` }}
              >
                <CardInner member={{ ...m, isMentor: false }} index={i} isKhmer={isKhmer} />
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 w-full h-px bg-linear-to-r from-transparent via-[rgba(0,208,178,0.14)] to-transparent mt-12" />

        <footer className="relative z-10 tf-footer flex flex-col items-center justify-center text-center px-[6%] pt-23 pb-16 bg-[#F7F5F0] dark:bg-[#09090B] overflow-hidden">
          <div className="tf-footer-grid" />

          <div className="relative z-1 w-full flex flex-col items-center">
            <div className="tf-footer-path w-full max-w-120 mb-12">
              <div style={{ position: "relative", height: "28px" }}>
                <div className="tf-footer-path-track" style={{ position: "absolute", top: "50%", left: "28px", right: "28px", transform: "translateY(-50%)" }} />
                <div className="tf-footer-path-nodes">
                  {copy.footerPath.map((label, i) => (
                    <div key={label} className="tf-footer-path-node">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  ))}
                </div>
              </div>
              <div className="tf-footer-path-label">
                {copy.footerPath.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>

            <h2 className="text-[clamp(1.9rem,3.6vw,3.2rem)] font-bold tracking-[-0.03em] text-[#0a1f1a] dark:text-white mb-[0.9rem] leading-[1.1]" style={{ fontFamily: titleFont }}>
              {copy.footerLead}<br /><em className="text-primary not-italic">{copy.footerAccent}</em>
            </h2>
            <p className="tf-body-text text-[#4a6e65] dark:text-[#9cb8b1] mb-8 max-w-105 leading-[1.78] mx-auto">
              {copy.footerBody}
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-primary text-[#020f0c] px-8 py-4 rounded-xl text-[0.9rem] font-bold cursor-pointer tracking-[0.04em] transition-colors duration-200 no-underline hover:bg-[#00b894]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              {copy.cta}
            </a>

            <p className="text-[0.68rem] text-[#8aada6] mt-[1.2rem] tracking-[0.04em]">
              {copy.copyright}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}