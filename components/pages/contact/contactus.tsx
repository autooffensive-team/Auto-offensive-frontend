"use client";

import { useRef, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import emailjs from "@emailjs/browser";
import { Toaster, toast } from "sonner";
import { FaFacebook, FaLinkedin, FaTelegram, FaYoutube } from "@/components/icons/social-icons";

/* ─── Info items ─────────────────────────────────── */
const buildInfoItems = (copy: ContactCopyValue): InfoItem[] => [
  {
    title: copy.info.email.title,
    desc: "autooffensive@gmail.com",
    href: "mailto:autooffensive@gmail.com",
    meta: copy.info.email.meta,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={1.5}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 4-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 4" />
      </svg>
    ),
  },
  {
    title: copy.info.contactForm.title,
    desc: copy.info.contactForm.desc,
    href: "#contact-form",
    meta: copy.info.contactForm.meta,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={1.5}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: copy.info.location.title,
    descRaw: (
      <>
        {copy.info.location.lines[0]}
        <br />
        {copy.info.location.lines[1]}
        <br />
        {copy.info.location.lines[2]}
      </>
    ),
    meta: copy.info.location.meta,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={1.5}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: copy.info.resources.title,
    desc: copy.info.resources.desc,
    href: "/resources",
    meta: copy.info.resources.meta,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

type ContactCopyValue = {
  eyebrow: string;
  title: string;
  description: string;
  followUs: string;
  map: {
    title: string;
    subtitle: string;
    button: string;
  };
  info: {
    email: { title: string; meta: string };
    contactForm: { title: string; desc: string; meta: string };
    location: { title: string; lines: [string, string, string]; meta: string };
    resources: { title: string; desc: string; meta: string };
  };
  form: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    subject: string;
    message: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    emailPlaceholder: string;
    companyPlaceholder: string;
    phonePlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    agreementPrefix: string;
    agreementLink: string;
    agreementSuffix: string;
    submit: string;
    success: string;
  };
};

type InfoItem = {
  title: string;
  meta: string;
  icon: React.ReactNode;
  desc?: string;
  href?: string;
  descRaw?: React.ReactNode;
};

const CONTACT_COPY: Record<"en" | "km", ContactCopyValue> = {
  en: {
    eyebrow: "Contact Us",
    title: "Let's Build Something Secure",
    description: "Have questions? Our team is here to help protect your infrastructure with advanced penetration testing.",
    followUs: "Follow us",
    map: {
      title: "Find us in Phnom Penh",
      subtitle: "ISTAD - Science & Technology Advanced Development Co., Ltd.",
      button: "Open in Google Maps",
    },
    info: {
      email: { title: "Email", meta: "Best for general inquiries" },
      contactForm: { title: "Contact Form", desc: "Send us a message below", meta: "Fastest way to reach us" },
      location: { title: "Location", lines: ["No 40, Street : 273", "SongKat, Khan Toul Kork", "Phnom Penh, Cambodia"], meta: "Local office" },
      resources: { title: "Resources", desc: "View our guides", meta: "Docs and references" },
    },
    form: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      company: "Company",
      phone: "Phone",
      subject: "Subject",
      message: "Message",
      firstNamePlaceholder: "Enter your first name",
      lastNamePlaceholder: "Enter your last name",
      emailPlaceholder: "auto-offensive@company.com",
      companyPlaceholder: "Your company",
      phonePlaceholder: "+855 12 345 678",
      subjectPlaceholder: "How can we help?",
      messagePlaceholder: "Tell us more about your inquiry...",
      agreementPrefix: "I agree to the ",
      agreementLink: "privacy policy",
      agreementSuffix: " and terms. Auto-Offensive may contact me regarding my inquiry.",
      submit: "Send Message",
      success: "Message sent successfully! We'll be in touch soon.",
    },
  },
  km: {
    eyebrow: "ទំនាក់ទំនងយើង",
    title: "តោះបង្កើតអ្វីមួយដែលមានសុវត្ថិភាព",
    description: "មានសំណួរ? ក្រុមការងាររបស់យើងរីករាយក្នុងការជួយអ្នកការពារប្រព័ន្ធរបស់អ្នកដោយការសាកល្បងសុវត្ថិភាពកម្រិតខ្ពស់។",
    followUs: "តាមដានពួកយើង",
    map: {
      title: "ស្វែងរកយើងនៅភ្នំពេញ",
      subtitle: "ISTAD - Science & Technology Advanced Development Co., Ltd.",
      button: "បើកនៅ Google Maps",
    },
    info: {
      email: { title: "អ៊ីមែល", meta: "ល្អបំផុតសម្រាប់សំណួរទូទៅ" },
      contactForm: { title: "ទម្រង់ទំនាក់ទំនង", desc: "ផ្ញើសារមកយើងខាងក្រោម", meta: "វិធីលឿនបំផុតដើម្បីទាក់ទងយើង" },
      location: { title: "ទីតាំង", lines: ["លេខ 40 ផ្លូវ 273", "SongKat, Khan Toul Kork", "ភ្នំពេញ, កម្ពុជា"], meta: "ការិយាល័យក្នុងតំបន់" },
      resources: { title: "ធនធាន", desc: "មើលមគ្គុទេសក៍របស់យើង", meta: "ឯកសារ និងឯកសារយោង" },
    },
    form: {
      firstName: "នាម",
      lastName: "នាមត្រកូល",
      email: "អាសយដ្ឋានអ៊ីមែល",
      company: "ក្រុមហ៊ុន",
      phone: "លេខទូរស័ព្ទ",
      subject: "ប្រធានបទ",
      message: "សារ",
      firstNamePlaceholder: "បញ្ចូលនាមរបស់អ្នក",
      lastNamePlaceholder: "បញ្ចូលនាមត្រកូលរបស់អ្នក",
      emailPlaceholder: "john@company.com",
      companyPlaceholder: "ក្រុមហ៊ុនរបស់អ្នក",
      phonePlaceholder: "+855 12 345 678",
      subjectPlaceholder: "តើយើងអាចជួយអ្វីបានខ្លះ?",
      messagePlaceholder: "សូមប្រាប់យើងបន្ថែមអំពីសំណើរបស់អ្នក...",
      agreementPrefix: "ខ្ញុំយល់ព្រមនឹង ",
      agreementLink: "គោលការណ៍ឯកជនភាព",
      agreementSuffix: " និងលក្ខខណ្ឌ។ Auto-Offensive អាចទាក់ទងខ្ញុំអំពីសំណើរបស់ខ្ញុំ។",
      submit: "ផ្ញើសារ",
      success: "ផ្ញើសារបានជោគជ័យ! យើងនឹងទាក់ទងអ្នកឆាប់ៗនេះ។",
    },
  },
};

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1DMqBN53KR/?mibextid=wwXIfr",
    icon: <FaFacebook className="w-5 h-5" />,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@AutoOffensive",
    icon: <FaYoutube className="w-5 h-5" />,
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: <FaLinkedin className="w-5 h-5" />,
  },
  {
    label: "Telegram",
    href: "https://t.me/autooffensive",
    icon: <FaTelegram className="w-5 h-5" />,
  },
];

const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=ISTAD%20-%20Science%20%26%20Technology%20Advanced%20Development%20Co.,%20Ltd.%2C%20Phnom%20Penh";

/* ─── Hex Grid Data ─────────────────────────────────── */
const hexPoints = "28,0 56,16 56,48 28,64 0,48 0,16";

type HexDef = { id: string; cls: string; tx: number; ty: number };

const LEFT_HEXES: HexDef[] = [
  { id:"l0",  cls:"st-bright l-b1", tx:2,   ty:2   },
  { id:"l1",  cls:"st-bright l-b2", tx:91,  ty:52  },
  { id:"l2",  cls:"st-bright l-b3", tx:60,  ty:104 },
  { id:"l3",  cls:"st-mid l-m1",    tx:60,  ty:2   },
  { id:"l4",  cls:"st-mid l-m2",    tx:31,  ty:52  },
  { id:"l5",  cls:"st-mid l-m3",    tx:151, ty:52  },
  { id:"l6",  cls:"st-mid l-m4",    tx:31,  ty:156 },
  { id:"l7",  cls:"st-mid l-m5",    tx:2,   ty:208 },
  { id:"l8",  cls:"st-dim l-d1",    tx:120, ty:2   },
  { id:"l9",  cls:"st-dim l-d2",    tx:180, ty:2   },
  { id:"l10", cls:"st-dim l-d3",    tx:240, ty:2   },
  { id:"l11", cls:"st-dim l-d4",    tx:300, ty:2   },
  { id:"l12", cls:"st-dim l-d5",    tx:211, ty:52  },
  { id:"l13", cls:"st-dim l-d6",    tx:271, ty:52  },
  { id:"l14", cls:"st-dim l-d7",    tx:331, ty:52  },
  { id:"l15", cls:"st-dim l-d8",    tx:2,   ty:104 },
  { id:"l16", cls:"st-dim l-d9",    tx:120, ty:104 },
  { id:"l17", cls:"st-dim l-d10",   tx:180, ty:104 },
  { id:"l18", cls:"st-dim l-d11",   tx:240, ty:104 },
  { id:"l19", cls:"st-dim l-d12",   tx:300, ty:104 },
];

const RIGHT_HEXES: HexDef[] = [
  { id:"r0",  cls:"st-bright r-b1", tx:120, ty:2   },
  { id:"r1",  cls:"st-bright r-b2", tx:31,  ty:52  },
  { id:"r2",  cls:"st-bright r-b3", tx:2,   ty:104 },
  { id:"r3",  cls:"st-mid r-m1",    tx:2,   ty:2   },
  { id:"r4",  cls:"st-mid r-m2",    tx:60,  ty:2   },
  { id:"r5",  cls:"st-mid r-m3",    tx:91,  ty:52  },
  { id:"r6",  cls:"st-mid r-m4",    tx:151, ty:52  },
  { id:"r7",  cls:"st-mid r-m5",    tx:91,  ty:156 },
  { id:"r8",  cls:"st-dim r-d1",    tx:180, ty:2   },
  { id:"r9",  cls:"st-dim r-d2",    tx:240, ty:2   },
  { id:"r10", cls:"st-dim r-d3",    tx:300, ty:2   },
  { id:"r11", cls:"st-dim r-d4",    tx:211, ty:52  },
  { id:"r12", cls:"st-dim r-d5",    tx:271, ty:52  },
  { id:"r13", cls:"st-dim r-d6",    tx:331, ty:52  },
  { id:"r14", cls:"st-dim r-d7",    tx:60,  ty:104 },
  { id:"r15", cls:"st-dim r-d8",    tx:120, ty:104 },
];

function HexGrid({
  hexes,
  svgRef,
  className,
}: {
  hexes: HexDef[];
  svgRef: React.RefObject<SVGSVGElement | null>;
  className: string;
}) {
  return (
    <svg
      ref={svgRef}
      className={`hex-grid ${className}`}
      width="350"
      height="450"
      viewBox="0 0 380 480"
      fill="none"
    >
      {hexes.map((h) => (
        <polygon
          key={h.id}
          data-id={h.id}
          className={`hx ${h.cls}`}
          points={hexPoints}
          transform={`translate(${h.tx},${h.ty})`}
        />
      ))}
    </svg>
  );
}

function getCenter(poly: SVGPolygonElement) {
  const t = poly.getAttribute("transform") || "translate(0,0)";
  const m = t.match(/translate\(([^,]+),([^)]+)\)/);
  if (!m) return { x: 0, y: 0 };
  return { x: parseFloat(m[1]) + 28, y: parseFloat(m[2]) + 32 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function setupMagneticHover(svgEl: SVGSVGElement | null) {
  if (!svgEl) return;

  const hexes = Array.from(svgEl.querySelectorAll<SVGPolygonElement>(".hx"));
  const centers = hexes.map(getCenter);
  const origTransforms = hexes.map((h) => h.getAttribute("transform") || "");
  const origPositions = hexes.map((_, i) => centers[i]);

  const MAGNETIC_RADIUS = 90;
  const MAX_PULL = 7;
  const NEIGHBOR_RADIUS = 72;

  function applyMagnetic(mouseX: number, mouseY: number) {
    hexes.forEach((hex, i) => {
      const cx = origPositions[i].x;
      const cy = origPositions[i].y;
      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const d = Math.sqrt(dx * dx + dy * dy);

      hex.classList.remove("hovered", "neighbor");

      if (d < MAGNETIC_RADIUS) {
        const strength = Math.pow(1 - d / MAGNETIC_RADIUS, 1.6);
        const pullX = (dx / d) * strength * MAX_PULL;
        const pullY = (dy / d) * strength * MAX_PULL;
        const newTx = origPositions[i].x - 28 + pullX;
        const newTy = origPositions[i].y - 32 + pullY;
        hex.setAttribute("transform", `translate(${newTx},${newTy})`);

        if (d < 36) {
          hex.classList.add("hovered");
        } else if (d < NEIGHBOR_RADIUS) {
          hex.classList.add("neighbor");
        }
      } else {
        hex.setAttribute("transform", origTransforms[i]);
      }
    });
  }

  function resetAll() {
    hexes.forEach((hex, i) => {
      hex.setAttribute("transform", origTransforms[i]);
      hex.classList.remove("hovered", "neighbor");
    });
  }

  svgEl.addEventListener("mousemove", (e: MouseEvent) => {
    const rect = svgEl.getBoundingClientRect();
    const scaleX = 380 / rect.width;
    const scaleY = 480 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    applyMagnetic(mouseX, mouseY);
  });

  svgEl.addEventListener("mouseleave", resetAll);

  hexes.forEach((hex, i) => {
    hex.addEventListener("mouseenter", () => {
      hexes.forEach((h, j) => {
        if (j !== i && dist(centers[i], centers[j]) < NEIGHBOR_RADIUS) {
          h.classList.add("neighbor");
        }
      });
    });
  });
}

/* ─── Component ─────────────────────────────────── */
export default function ContactUs() {
  const locale = useLocale();
  const isKhmer = locale === "km";
  const copy = CONTACT_COPY[isKhmer ? "km" : "en"];
  const infoItems = buildInfoItems(copy);
  const contactFontClass =
    isKhmer
      ? "font-[var(--font-noto-khmer),sans-serif]"
      : "font-[var(--font-google-sans),var(--font-noto-khmer),sans-serif]";
  const titleFontFamily = isKhmer
    ? 'var(--font-hanuman), "Hanuman", var(--font-noto-khmer), sans-serif'
    : "var(--font-hackdaddy), var(--font-noto-khmer), sans-serif";
  const titleLineHeight = isKhmer ? 1.2 : 1.08;
  const titleLetterSpacing = isKhmer ? "0" : "-0.02em";
  const formRef = useRef<HTMLFormElement>(null);
  const hexLeftRef = useRef<SVGSVGElement>(null);
  const hexRightRef = useRef<SVGSVGElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    setupMagneticHover(hexLeftRef.current);
    setupMagneticHover(hexRightRef.current);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDisabled(true);

    try {
      await emailjs.sendForm(
        "service_zhzq1y7",
        "template_n8kycfr",
        formRef.current!,
        "R-0a64Uzx7gTDqO9N"
      );
      setSubmitted(true);
      toast.success(copy.form.success);
      formRef.current?.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setDisabled(false);
      setTimeout(() => setSubmitted(false), 4000);
    }
  }

  return (
    <>
      <style>{`
        /* ── Animations ── */
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDownFade {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .contact-header-label {
          opacity: 0;
          animation: slideUp 0.7s 0.15s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .contact-title {
          opacity: 0;
          animation: slideUp 0.7s 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .contact-desc {
          opacity: 0;
          animation: slideUp 0.7s 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .contact-grid-anim {
          opacity: 0;
          animation: fadeInUp 0.8s 0.5s ease forwards;
        }
        .status-msg {
          animation: slideDownFade 0.3s ease forwards;
        }

        /* ── Responsive font sizes ── */
        .text-responsive {
          font-size: clamp(16px, 2.5vw, 20px);
        }
        .text-label {
          font-size: clamp(16px, 2.5vw, 20px);
        }

        /* ── Form inputs light mode ── */
        .contact-input {
          background-color: #F0EDE7;
          border-color: #E5E1D8;
          border-width: 1px;
        }
        .contact-input:focus {
          outline: none;
          border-color: #00BCA1;
          box-shadow: 0 0 0 3px rgba(0,188,161,0.08);
        }

        /* ── Form inputs dark mode ── */
        .dark .contact-input {
          background-color: #0f1714;
          border-color: #1a2622;
        }
        .dark .contact-input:focus {
          border-color: #00BCA1;
          box-shadow: 0 0 0 3px rgba(0,188,161,0.12);
        }

        /* ── Info card hover ── */
        .info-card {
          transition: color 0.3s, border-color 0.3s;
          border-bottom: 2px solid transparent;
          padding-bottom: 0.75rem;
        }
        .info-card:hover {
          color: #00BCA1;
          border-bottom-color: rgba(0,188,161,0.35);
        }

        /* ── Social link hover ── */
        .social-btn {
          transition: all 0.25s;
        }
        .social-btn:hover {
          color: #00BCA1;
          border-color: rgba(0,188,161,0.35);
          background: rgba(0,188,161,0.06);
        }
        .dark .social-btn:hover {
          background: rgba(0,188,161,0.10);
        }

        /* ── Hex grids ── */
        .hx {
          fill: transparent;
          stroke: #00D0B2;
          stroke-width: 1;
          opacity: 0.09;
          transition: opacity .25s ease, filter .25s ease, fill .25s ease, stroke-width .25s ease, transform .18s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
          will-change: transform;
        }

        @keyframes star-bright {
          0%,100% { opacity: 0.07; filter: none; }
          40%,60%  { opacity: 0.72; filter: drop-shadow(0 0 4px #00D0B2) drop-shadow(0 0 10px rgba(0,208,178,.5)); }
        }
        @keyframes star-bright-dk {
          0%,100% { opacity: 0.07; filter: none; }
          40%,60%  { opacity: 1;    filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 16px rgba(0,208,178,.7)) drop-shadow(0 0 32px rgba(0,208,178,.3)); }
        }
        @keyframes star-mid {
          0%,100% { opacity: 0.05; filter: none; }
          50%     { opacity: 0.30; filter: drop-shadow(0 0 2px rgba(0,208,178,.38)); }
        }
        @keyframes star-mid-dk {
          0%,100% { opacity: 0.05; filter: none; }
          50%     { opacity: 0.45; filter: drop-shadow(0 0 4px rgba(0,208,178,.5)); }
        }
        @keyframes star-dim {
          0%,100% { opacity: 0.03; }
          50%     { opacity: 0.10; }
        }

        .st-bright { animation: star-bright 4s ease-in-out infinite; }
        .st-mid    { animation: star-mid   5s ease-in-out infinite; }
        .st-dim    { animation: star-dim   6.5s ease-in-out infinite; }

        @media (prefers-color-scheme: dark) {
          .st-bright { animation-name: star-bright-dk; }
          .st-mid    { animation-name: star-mid-dk; }
        }
        .dark .st-bright { animation-name: star-bright-dk; }
        .dark .st-mid    { animation-name: star-mid-dk; }

        .l-b1{animation-delay:0s}   .l-b2{animation-delay:1.5s}  .l-b3{animation-delay:3.0s}
        .l-m1{animation-delay:0.6s} .l-m2{animation-delay:1.9s}  .l-m3{animation-delay:3.3s}
        .l-m4{animation-delay:0.3s} .l-m5{animation-delay:2.4s}
        .l-d1{animation-delay:0.2s} .l-d2{animation-delay:1.1s}  .l-d3{animation-delay:2.0s}
        .l-d4{animation-delay:3.1s} .l-d5{animation-delay:0.8s}  .l-d6{animation-delay:1.7s}
        .l-d7{animation-delay:2.8s} .l-d8{animation-delay:4.0s}  .l-d9{animation-delay:0.5s}
        .l-d10{animation-delay:1.4s}.l-d11{animation-delay:3.6s} .l-d12{animation-delay:2.5s}

        .r-b1{animation-delay:0.7s} .r-b2{animation-delay:2.2s}  .r-b3{animation-delay:3.7s}
        .r-m1{animation-delay:1.3s} .r-m2{animation-delay:2.6s}  .r-m3{animation-delay:0.4s}
        .r-m4{animation-delay:3.9s} .r-m5{animation-delay:1.8s}
        .r-d1{animation-delay:0.9s} .r-d2{animation-delay:1.6s}  .r-d3{animation-delay:2.3s}
        .r-d4{animation-delay:3.4s} .r-d5{animation-delay:0.1s}  .r-d6{animation-delay:1.2s}
        .r-d7{animation-delay:2.9s} .r-d8{animation-delay:4.2s}  .r-d9{animation-delay:0.6s}
        .r-d10{animation-delay:1.9s}.r-d11{animation-delay:3.2s} .r-d12{animation-delay:2.1s}

        .hx.hovered {
          opacity: 1 !important;
          fill: rgba(0,208,178,0.08) !important;
          stroke: #00D0B2 !important;
          stroke-width: 1.8 !important;
          filter: drop-shadow(0 0 6px #00D0B2) drop-shadow(0 0 16px rgba(0,208,178,.45)) !important;
          animation-play-state: paused !important;
        }
        .dark .hx.hovered {
          filter: drop-shadow(0 0 8px #00D0B2) drop-shadow(0 0 22px rgba(0,208,178,.75)) drop-shadow(0 0 40px rgba(0,208,178,.35)) !important;
        }
        .hx.neighbor {
          opacity: 0.5 !important;
          fill: rgba(0,208,178,0.03) !important;
          stroke: #00D0B2 !important;
          stroke-width: 1.2 !important;
          filter: drop-shadow(0 0 3px rgba(0,208,178,.3)) !important;
          animation-play-state: paused !important;
        }
        .dark .hx.neighbor {
          filter: drop-shadow(0 0 5px rgba(0,208,178,.4)) drop-shadow(0 0 12px rgba(0,208,178,.2)) !important;
        }

        .hex-grid {
          position: absolute;
          pointer-events: all;
          z-index: 6;
        }
        .hex-grid-left {
          left: -50px;
          top: 0px;
          -webkit-mask-image: linear-gradient(135deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 40%, transparent 70%);
          mask-image: linear-gradient(135deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 40%, transparent 70%);
        }
        .hex-grid-right {
          right: -120px;
          top: 0px;
          -webkit-mask-image: linear-gradient(225deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 40%, transparent 70%);
          mask-image: linear-gradient(225deg, rgba(0,0,0,.8) 0%, rgba(0,0,0,.4) 40%, transparent 70%);
        }

        /* ── Info link ── */
        .info-link {
          transition: color 0.2s;
          display: inline-block;
          text-decoration: none;
        }
        .info-link:hover {
          text-decoration: underline;
        }

        /* ── Textarea ── */
        .contact-textarea {
          resize: vertical;
          min-height: 160px;
        }
      `}</style>

      <section
        className={`
          relative min-h-screen overflow-hidden
          bg-[#F7F5F0] dark:bg-[#09090B]
          text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)]
          ${contactFontClass}
          transition-[background] duration-500
          pt-35 pb-25 px-[6%]
        `}
      >
        {/* ── Soft Blob Background ── */}
        <Toaster position="top-right" richColors closeButton />
        <div className="absolute pointer-events-none inset-0 overflow-hidden">
          <div className="absolute rounded-full blur-3xl w-96 h-96 -top-40 -left-32 bg-[#01509e] opacity-60 dark:opacity-35 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute rounded-full blur-3xl w-80 h-80 top-1/4 -right-20 bg-[#00d0b2] opacity-45 dark:opacity-20 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute rounded-full blur-3xl w-72 h-72 bottom-32 left-1/3 bg-[#0194c7] opacity-50 dark:opacity-25 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          <div className="absolute rounded-full blur-3xl w-64 h-64 bottom-0 right-1/4 bg-[#00d0b2] opacity-35 dark:opacity-15 animate-pulse" style={{ animationDuration: '9s', animationDelay: '1s' }} />
        </div>

        {/* ── Hex Grids ── */}
        <HexGrid hexes={LEFT_HEXES}  svgRef={hexLeftRef}  className="hex-grid-left" />
        <HexGrid hexes={RIGHT_HEXES} svgRef={hexRightRef} className="hex-grid-right" />

        {/* ── Container ── */}
        <div className="relative z-10 max-w-7xl mx-auto w-full lg:pl-12 xl:pl-20">

          {/* ── Header ── */}
          <div className="text-center mb-20">
            <div className="contact-header-label inline-block text-[0.75rem] font-bold tracking-[0.06em] uppercase text-[#00BCA1] mb-4 px-4 py-2 border border-[rgba(0,188,161,0.24)] rounded-lg">
              {copy.eyebrow}
            </div>

            <h1
              className="contact-title text-[clamp(2.2rem,5vw,3.8rem)] font-bold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-5"
              style={{
                fontFamily: titleFontFamily,
                fontWeight: isKhmer ? 800 : 700,
                lineHeight: titleLineHeight,
                letterSpacing: titleLetterSpacing,
              }}
            >
              {copy.title}
            </h1>

            <p className="contact-desc text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] max-w-155 mx-auto leading-[1.7] font-normal">
              {copy.description}
            </p>
          </div>

          {/* ── Main Grid ── */}
          <div className="contact-grid-anim grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 lg:gap-20 lg:translate-x-6 xl:translate-x-10">

            {/* ── Form Card ── */}
            <div className="border-b-2 border-[rgba(0,188,161,0.14)] dark:border-[rgba(0,188,161,0.08)] pb-10 lg:pb-0 lg:border-b-0 lg:border-r-2 lg:pr-16">
              {/* Success message */}
              {submitted && (
                <div className="status-msg text-responsive mb-8 p-4 rounded-xl font-semibold bg-[rgba(0,188,161,0.10)] dark:bg-[rgba(0,188,161,0.08)] text-[#00BCA1] border border-[rgba(0,188,161,0.24)] dark:border-[rgba(0,188,161,0.16)]">
                  ✓ {copy.form.success}
                </div>
              )}

              <form id="contact-form" ref={formRef} onSubmit={handleSubmit}>
                {/* Row: First / Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div className="flex flex-col">
                    <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                      {copy.form.firstName}
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      placeholder={copy.form.firstNamePlaceholder}
                      required
                      className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                      {copy.form.lastName}
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      placeholder={copy.form.lastNamePlaceholder}
                      required
                      className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col mb-6">
                  <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                    {copy.form.email}
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={copy.form.emailPlaceholder}
                    required
                    className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                  />
                </div>

                {/* Row: Company / Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                  <div className="flex flex-col">
                    <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                      {copy.form.company} <span className="font-normal text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      placeholder={copy.form.companyPlaceholder}
                      className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                      {copy.form.phone} <span className="font-normal text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={copy.form.phonePlaceholder}
                      className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="flex flex-col mb-6">
                  <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                    {copy.form.subject}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    placeholder={copy.form.subjectPlaceholder}
                    required
                    className="contact-input text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col mb-8">
                  <label className="text-label font-semibold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-3 tracking-[0.01em]">
                    {copy.form.message}
                  </label>
                  <textarea
                    name="message"
                    placeholder={copy.form.messagePlaceholder}
                    required
                    className="contact-input contact-textarea text-responsive border rounded-lg px-4 py-3 text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] font-normal leading-relaxed placeholder:text-[oklch(0.556_0_0)] dark:placeholder:text-[oklch(0.4_0_0)] transition-all duration-200 font-[inherit]"
                  />
                </div>

                {/* Checkbox */}
                <div className="text-responsive flex items-start gap-3 mb-8 text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] leading-relaxed">
                  <input
                    type="checkbox"
                    id="agree"
                    required
                    className="w-5 h-5 min-w-5 mt-0.5 cursor-pointer accent-[#00BCA1]"
                  />
                  <label htmlFor="agree" className="cursor-pointer">
                    {copy.form.agreementPrefix}
                    <a href="#" className="text-[#00BCA1] font-semibold no-underline hover:underline">
                      {copy.form.agreementLink}
                    </a>{" "}
                    {copy.form.agreementSuffix}
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={disabled}
                  className="text-responsive w-full mt-4 bg-[#00BCA1] hover:bg-[#009f88] disabled:opacity-60 disabled:cursor-not-allowed text-black border-none py-3.5 px-7 rounded-lg font-bold font-[inherit] cursor-pointer tracking-[0.01em] transition-all duration-200"
                >
                  {copy.form.submit}
                </button>
              </form>
            </div>

            {/* ── Info Column ── */}
            {/* Gap reduced from gap-8 to gap-5, padding-bottom on info-card reduced in CSS */}
            <div className="flex flex-col gap-5 lg:pl-8">
              {infoItems.map((item) => (
                <div key={item.title} className="info-card">
                  <div className="flex gap-4 items-start">
                    <div className="w-10 h-10 min-w-10 text-[#00BCA1] shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-responsive font-bold text-[oklch(0.145_0_0)] dark:text-[oklch(0.985_0_0)] mb-1 tracking-[-0.01em]">
                        {item.title}
                      </h3>
                      {item.descRaw ? (
                        <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] mb-2 font-normal">
                          {item.descRaw}
                        </p>
                      ) : (
                        <p className="text-responsive mb-2 font-normal">
                          {item.href ? (
                            <a href={item.href} className="info-link text-[#00BCA1] font-semibold">
                              {item.desc}
                            </a>
                          ) : (
                            <span className="text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">{item.desc}</span>
                          )}
                        </p>
                      )}
                      <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.4_0_0)] font-normal">
                        {item.meta}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* ── Social Links ── */}
              <div className="border-t border-[rgba(0,188,161,0.14)] dark:border-[rgba(0,188,161,0.08)] pt-6 mt-2">
                <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.4_0_0)] mb-4 font-semibold">
                  {copy.followUs}
                </p>
                <div className="flex gap-3">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      title={s.label}
                      className="social-btn flex items-center justify-center w-11 h-11 bg-[#F0EDE7] dark:bg-[#0f1714] border border-[#E5E1D8] dark:border-[#1a2622] rounded-lg text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)] no-underline"
                    >
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>{/* end grid */}

          {/* ── Full-width Map ── */}
          <div className="contact-grid-anim mt-14 overflow-hidden rounded-2xl border border-[rgba(0,188,161,0.16)] dark:border-[rgba(0,188,161,0.10)] bg-white/75 dark:bg-[#0d1211]/80 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-sm">
            <div className="p-5 sm:p-6 border-b border-[rgba(0,188,161,0.12)] dark:border-[rgba(0,188,161,0.08)]">
              <p className="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[#00BCA1] mb-2">
                {copy.map.title}
              </p>
              <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">
                {copy.map.subtitle}
              </p>
            </div>
            <div className="relative w-full" style={{ height: '420px' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(135deg,rgba(0,188,161,0.12),rgba(1,80,158,0.08),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(135deg,rgba(0,188,161,0.12),rgba(1,80,158,0.10),rgba(13,18,17,0.95))] px-6 text-center">
                <div className="max-w-xl space-y-3">
                  <p className="text-[0.75rem] font-bold tracking-[0.08em] uppercase text-[#00BCA1]">
                    {copy.map.title}
                  </p>
                  <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">
                    The live Google Maps embed is blocked by the current Content Security Policy, so we show a direct map link here instead.
                  </p>
                </div>
                <a
                  href={MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-[#00BCA1] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#009f88]"
                >
                  {copy.map.button}
                </a>
              </div>
            </div>
            <div className="p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-responsive text-[oklch(0.556_0_0)] dark:text-[oklch(0.708_0_0)]">
                No 40, Street 273, Toul Kork, Phnom Penh
              </p>
              <a
                href={MAP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-[#00BCA1] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#009f88]"
              >
                {copy.map.button}
              </a>
            </div>
          </div>

        </div>{/* end container */}
      </section>
    </>
  );
}
