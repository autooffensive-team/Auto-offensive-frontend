"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

const TOC_LINKS = [
  { href: "#installation", label: "Installation & Setup" },
  { href: "#installation", label: "Download & install", sub: true },
  { href: "#installation", label: "Verify & first run", sub: true },
  { href: "#auth", label: "Authentication" },
  { href: "#auth", label: "Login command", sub: true },
  { href: "#auth", label: "CI / non-interactive", sub: true },
  { href: "#commands", label: "Command Execution" },
  { href: "#commands", label: "Example commands", sub: true },
  { href: "#commands", label: "Parameter validation", sub: true },
  { href: "#tools", label: "Supported Tools" },
  { href: "#execution", label: "Remote Execution Model" },
  { href: "#streaming", label: "Output Streaming" },
  { href: "#results", label: "Result Handling" },
  { href: "#jobs", label: "Job Lifecycle" },
  { href: "#jobs", label: "Job commands", sub: true },
  { href: "#security", label: "Security & Access Control" },
  { href: "#concept", label: "How It Works" },
] as const;

const monoFontStyle = {
  fontFamily: "var(--font-jetbrains-mono), var(--font-google-sans), var(--font-noto-khmer), monospace",
} as const;

/* ── Small reusable primitives ─────────────────────────────── */

function Tag({
  children,
  variant = "muted",
}: {
  children: React.ReactNode;
  variant?: "web" | "net" | "recon" | "ai" | "green" | "muted" | "acc";
}) {
  const styles: Record<string, string> = {
    web: "text-[#1D57C8] bg-[rgba(29,87,200,0.06)] border-[rgba(29,87,200,0.2)]",
    net: "text-[#6B35C0] bg-[rgba(107,53,192,0.06)] border-[rgba(107,53,192,0.2)]",
    recon: "text-[#B86800] bg-[rgba(184,104,0,0.06)] border-[rgba(184,104,0,0.2)]",
    ai: "text-[#6B35C0] bg-[rgba(107,53,192,0.06)] border-[rgba(107,53,192,0.2)]",
    green: "text-[#1A7A4A] bg-[rgba(26,122,74,0.06)] border-[rgba(26,122,74,0.2)]",
    muted: "text-[#88837B] bg-[#F0EDE6] border-[#CEC9BF]",
    acc: "text-[#00BCA1] bg-[rgba(0,188,161,0.07)] border-[rgba(0,188,161,0.2)]",
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] font-medium px-1.5 py-px rounded border whitespace-nowrap tracking-[0.02em] dark:bg-white/5 ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="text-[16px] md:text-[18px] lg:text-[20px] bg-[#F0EDE6] dark:bg-white/5 text-[#00BCA1] px-1.5 py-px rounded border border-[#E2DDD5] dark:border-white/10"
      style={monoFontStyle}
    >
      {children}
    </code>
  );
}

function Callout({
  type = "info",
  icon,
  title,
  children,
}: {
  type?: "tip" | "info" | "warn" | "ai" | "brand";
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    tip: "border-l-[#1A7A4A] bg-[rgba(26,122,74,0.03)]",
    info: "border-l-[#1D57C8] bg-[rgba(29,87,200,0.03)]",
    warn: "border-l-[#B86800] bg-[rgba(184,104,0,0.03)]",
    ai: "border-l-[#6B35C0] bg-[rgba(107,53,192,0.03)]",
    brand: "border-l-[#00BCA1] bg-[rgba(0,188,161,0.05)]",
  };
  const titleColors: Record<string, string> = {
    tip: "text-[#1A7A4A]",
    info: "text-[#1D57C8]",
    warn: "text-[#B86800]",
    ai: "text-[#6B35C0]",
    brand: "text-[#00BCA1]",
  };
  return (
    <div
      className={`flex gap-3 px-4 py-3 rounded-lg border border-[#E2DDD5] dark:border-white/10 border-l-[3px] my-3.5 dark:bg-white/3 ${styles[type]}`}
    >
      <span className="text-[14px] shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div
          className={`text-[11px] font-bold tracking-[0.07em] uppercase mb-1 ${titleColors[type]}`}
        >
          {title}
        </div>
        <div
          className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.72]"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      });
    }
  };

  return (
    <div className="rounded-xl overflow-hidden my-3.5 border border-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.14),0_1px_4px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/6 bg-[#16181F]">
        <div className="flex gap-1.25">
          <div className="w-2.25 h-2.25 rounded-full bg-[#FF5F57]" />
          <div className="w-2.25 h-2.25 rounded-full bg-[#FFBD2E]" />
          <div className="w-2.25 h-2.25 rounded-full bg-[#28CA41]" />
        </div>
        <span className="font-mono text-[11px] text-white/25 tracking-[0.05em]">{title}</span>
        <button
          onClick={handleCopy}
          className="font-mono text-[10px] text-white/30 bg-transparent border-none cursor-pointer hover:text-white/75 hover:bg-white/[0.07] px-2 py-0.5 rounded transition-all duration-150"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="bg-[#16181F] px-5 py-4.5 overflow-x-auto">
        <code
          ref={codeRef}
          className="text-[16px] md:text-[18px] lg:text-[20px] leading-[1.92] text-white/55 whitespace-pre"
          style={monoFontStyle}
        >
          {children}
        </code>
      </div>
    </div>
  );
}

/* Syntax token helpers */
const Prompt = ({ children }: { children?: React.ReactNode }) => (
  <span className="text-white/25 select-none">{children ?? "$ "}</span>
);
const Cmd = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#7DD3C8] font-medium">{children}</span>
);
const Flag = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#F9C860]">{children}</span>
);
const Val = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#A8D8A8]">{children}</span>
);
const Cm = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white/22 italic">{children}</span>
);
const Ok = () => <span className="text-[#6EE7B7]">✓</span>;
const Dim = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white/30">{children}</span>
);
const Acc = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[#5FD4C8]">{children}</span>
);

function FeatureList({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-[#E2DDD5] dark:border-white/10 rounded-xl overflow-hidden my-3.5 bg-white dark:bg-[#121214]">
      {children}
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
  tag,
}: {
  icon: string;
  title: string;
  desc: React.ReactNode;
  tag?: React.ReactNode;
}) {
  return (
    <div className="flex items-start border-b border-[#E2DDD5] dark:border-white/10 last:border-b-0 hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150">
      <div className="w-12 shrink-0 flex items-center justify-center py-3.75 text-base">
        {icon}
      </div>
      <div className="flex-1 py-3.25 pr-4">
        <div
          className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white mb-0.75 tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {title}
        </div>
        <div
          className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.72]"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {desc}
        </div>
      </div>
      {tag && (
        <div className="py-3.25 pr-4 flex items-center shrink-0">{tag}</div>
      )}
    </div>
  );
}

function StepList({ children }: { children: React.ReactNode }) {
  return <div className="my-4 flex flex-col">{children}</div>;
}

function Step({
  num,
  title,
  desc,
  last,
}: {
  num: number;
  title: string;
  desc: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`flex gap-3.5 relative ${last ? "" : "pb-5.5"}`}>
      <div className="flex flex-col items-center shrink-0">
        <div className="w-6.5 h-6.5 rounded-full bg-white dark:bg-[#18181B] border-[1.5px] border-[#CEC9BF] dark:border-white/10 flex items-center justify-center font-mono text-[11px] font-semibold text-[#1A1714] dark:text-white">
          {num}
        </div>
        {!last && <div className="flex-1 w-px bg-[#E2DDD5] dark:bg-white/10 mt-1.5" />}
      </div>
      <div className="flex-1 pt-0.5">
        <div
          className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white mb-1"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {title}
        </div>
        <div
          className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.72]"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  id,
  badge,
  children,
}: {
  id: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="doc-section text-[1.8rem] font-bold tracking-[-0.03em] text-[#1A1714] dark:text-white mb-3 pt-11 scroll-mt-6 flex items-center gap-2.5"
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      {children}
      {badge && (
        <span className="font-mono text-[9.5px] font-normal text-[#B5B0A8] dark:text-[#9CA3AF] bg-[#F0EDE6] dark:bg-white/5 px-1.5 py-0.5 rounded border border-[#E2DDD5] dark:border-white/10 tracking-[0.04em]">
          {badge}
        </span>
      )}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-[1.2rem] font-semibold tracking-[-0.02em] text-[#1A1714] dark:text-white mt-7 mb-2 scroll-mt-6"
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      {children}
    </h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.82] mb-3"
      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
    >
      {children}
    </p>
  );
}

function SecGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 my-3.5 max-[640px]:grid-cols-1">
      {children}
    </div>
  );
}

function SecItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  const newLocal = "text-[15px] flex-shrink-0 mt-px";
  return (
    <div className="flex items-start gap-3 px-3.5 py-3 rounded-lg border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#121214] hover:bg-[#F0EDE6] dark:hover:bg-white/5 hover:border-[#CEC9BF] transition-all duration-150">
      <span className={newLocal}>{icon}</span>
      <div>
        <div
          className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white mb-0.5"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {title}
        </div>
        <div
          className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.65]"
          style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function Lifecycle({ isKhmer }: { isKhmer: boolean }) {
  return (
    <div className="flex border border-[#E2DDD5] dark:border-white/10 rounded-xl overflow-hidden my-3.5 bg-white dark:bg-[#121214]">
      {[
        { label: isKhmer ? "កំពុងរង់ចាំ" : "Pending", dotClass: "bg-[#B5B0A8]", shadow: "shadow-[0_0_0_3px_rgba(180,176,168,0.18)]" },
        { label: isKhmer ? "កំពុងដំណើរការ" : "Running", dotClass: "bg-[#1D57C8] animate-pulse", shadow: "shadow-[0_0_0_3px_rgba(29,87,200,0.14)]" },
        { label: isKhmer ? "បានបញ្ចប់" : "Completed", dotClass: "bg-[#1A7A4A]", shadow: "shadow-[0_0_0_3px_rgba(26,122,74,0.14)]" },
        { label: isKhmer ? "បរាជ័យ" : "Failed", dotClass: "bg-[#C42828]", shadow: "shadow-[0_0_0_3px_rgba(196,40,40,0.14)]" },
      ].map((lc) => (
        <div
          key={lc.label}
          className={`flex-1 py-3.5 px-2 text-center border-r border-[#E2DDD5] dark:border-white/10 last:border-r-0 hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150`}
        >
          <div
            className={`w-2 h-2 rounded-full mx-auto mb-2 ${lc.dotClass} ${lc.shadow}`}
          />
          <div className="font-mono text-[10px] tracking-[0.07em] uppercase text-[#88837B]">
            {lc.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotList({ isKhmer }: { isKhmer: boolean }) {
  const items = [
    { tool: "subfinder", cmd: "pentest subfinder" },
    { tool: "httpx", cmd: "pentest httpx" },
    { tool: "naabu", cmd: "pentest naabu" },
    { tool: "nuclei", cmd: "pentest nuclei" },
  ];
  return (
    <div className="border border-[#E2DDD5] dark:border-white/10 rounded-xl overflow-hidden my-3.5 bg-white dark:bg-[#121214]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F0EDE6] dark:bg-white/5 border-b border-[#E2DDD5] dark:border-white/10 text-[12px] font-semibold text-[#88837B] dark:text-[#9CA3AF] tracking-[0.04em]">
        <svg
          className="w-3.5 h-3.5 stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {isKhmer ? "អ្នកមិនចាំបាច់ដំឡើង tools ទាំងនេះនៅលើម៉ាស៊ីនរបស់អ្នកទេ" : "You do not install these tools locally"}
      </div>
      {items.map((item) => (
        <div
          key={item.tool}
          className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E2DDD5] dark:border-white/10 last:border-b-0 hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150"
        >
          <span
            className="text-[16px] md:text-[18px] lg:text-[20px] text-[#B5B0A8] line-through decoration-[#C42828] shrink-0"
            style={monoFontStyle}
          >
            {item.tool}
          </span>
          <span
            className="text-[16px] md:text-[18px] lg:text-[20px] text-[#00BCA1]"
            style={monoFontStyle}
          >
            →
          </span>
          <span
            className="text-base md:text-[18px] lg:text-[20px] font-medium text-[#4A4540] dark:text-[#C9CDD4] flex-1"
            style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
          >
            {isKhmer ? "ផ្តល់ជូនជា managed backend service តាមរយៈ" : "Provided as a managed backend service via"}{" "}
            <InlineCode>{item.cmd}</InlineCode>
          </span>
          <Tag variant="acc">Managed</Tag>
        </div>
      ))}
    </div>
  );
}

/* ── TOC ──────────────────────────────────────────────────── */
function ManagedExecutionList({ isKhmer }: { isKhmer: boolean }) {
  const items = [
    { tool: "subfinder", cmd: "pentest subfinder" },
    { tool: "httpx", cmd: "pentest httpx" },
    { tool: "naabu", cmd: "pentest naabu" },
    { tool: "nuclei", cmd: "pentest nuclei" },
  ];

  return (
    <div className="border border-[#E2DDD5] dark:border-white/10 rounded-xl overflow-hidden my-3.5 bg-white dark:bg-[#121214]">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#F0EDE6] dark:bg-white/5 border-b border-[#E2DDD5] dark:border-white/10 text-[12px] font-semibold text-[#88837B] dark:text-[#9CA3AF] tracking-[0.04em]">
        <svg
          className="w-3.5 h-3.5 stroke-current fill-none"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        {isKhmer ? "អ្នកមិនចាំបាច់ដំឡើង tools ទាំងនេះនៅលើម៉ាស៊ីនរបស់អ្នកទេ" : "You do not install these tools locally"}
      </div>
      <div className="overflow-x-auto">
        <table className="w-max min-w-full border-collapse">
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.tool}
                className="border-b border-[#E2DDD5] dark:border-white/10 last:border-b-0 hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150"
              >
                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <div className="w-7 h-7 rounded-full border border-[#CEC9BF] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#18181B] flex items-center justify-center font-mono text-[11px] font-semibold text-[#88837B] dark:text-[#9CA3AF]">
                    {index + 1}
                  </div>
                </td>
                <td
                  className="px-2 py-3 text-[16px] md:text-[18px] lg:text-[20px] text-[#B5B0A8] line-through decoration-[#C42828] whitespace-nowrap align-middle"
                  style={monoFontStyle}
                >
                  {item.tool}
                </td>
                <td
                  className="px-2 py-3 text-[16px] md:text-[18px] lg:text-[20px] text-[#00BCA1] whitespace-nowrap align-middle"
                  style={monoFontStyle}
                >
                  -&gt;
                </td>
                <td
                  className="px-2 py-3 text-base md:text-[18px] lg:text-[20px] font-medium text-[#4A4540] dark:text-[#C9CDD4] whitespace-nowrap align-middle"
                  style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
                >
                  {isKhmer ? "ផ្តល់ជូនជា managed backend service តាមរយៈ" : "Provided as a managed backend service via"}{" "}
                  <span className="inline-block whitespace-nowrap">
                    <InlineCode>{item.cmd}</InlineCode>
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap align-middle">
                  <Tag variant="acc">Managed</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityList({ isKhmer }: { isKhmer: boolean }) {
  const items = [
    {
      title: isKhmer ? "អនុញ្ញាតតែ tools ដែលបានកំណត់" : "Predefined tools only",
      desc: isKhmer ? "អាចប្រើបានតែ tool set ដែលគាំទ្រប៉ុណ្ណោះ។ សំណើសម្រាប់ tools ដែលមិនមានក្នុងបញ្ជី ឬ custom binaries នឹងត្រូវបដិសេធមុនពេលដំណើរការ។" : "Only the supported tool set is accessible. Requests for unlisted tools or custom binaries are rejected before execution.",
    },
    {
      title: "Parameter validation",
      desc: isKhmer ? "រាល់ request ត្រូវបាន validate តាម parameter schema ដែលអនុញ្ញាត ទាំងនៅ CLI និង backend។ ការព្យាយាម injection នឹងត្រូវទប់ស្កាត់។" : "Every request is validated against the allowed parameter schema on both the CLI and the backend. Injection attempts are blocked.",
    },
    {
      title: isKhmer ? "Isolated execution" : "Isolated execution",
      desc: isKhmer ? "job នីមួយៗដំណើរការនៅក្នុង isolated container ផ្ទាល់ខ្លួន។ មិនមាន shared state, persistent filesystem access ឬ system-level exposure ទេ។" : "Each job runs in its own isolated container. There is no shared state, no persistent filesystem access, and no system-level exposure.",
    },
    {
      title: isKhmer ? "Authenticated requests" : "Authenticated requests",
      desc: isKhmer ? "រាល់ CLI requests ទាមទារ API token ដែលមានសុពលភាព។ sessions ដែលមិនបាន authenticate ឬផុតកំណត់ នឹងត្រូវបដិសេធភ្លាមៗជាមួយ error message ច្បាស់លាស់។" : "All CLI requests require a valid API token. Unauthenticated or expired sessions are rejected immediately with a clear error.",
    },
    {
      title: "Audit log",
      desc: isKhmer ? "command, job និង result នីមួយៗត្រូវបានកត់ត្រាទៅក្នុង account របស់អ្នក។ ប្រវត្តិ audit ពេញលេញអាចមើលបានពី web dashboard។" : "Every command, job, and result is logged against your account. Full audit history is available from the web dashboard.",
    },
    {
      title: isKhmer ? "មិនអនុញ្ញាត arbitrary execution" : "No arbitrary execution",
      desc: isKhmer ? "CLI មិនគាំទ្រ shell pass-through, piping ឬ arbitrary command injection ទេ។ execution surface ត្រូវបានគ្រប់គ្រងទាំងស្រុង។" : "The CLI does not support shell pass-through, piping, or arbitrary command injection. The execution surface is completely controlled.",
    },
  ];

  return (
    <div className="my-4 flex flex-col gap-4">
      {items.map((item, index) => (
        <div
          key={item.title}
          className="flex gap-3.5 rounded-xl border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#121214] px-4 py-4 hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150"
        >
          <div className="w-7 h-7 rounded-full bg-white dark:bg-[#18181B] border-[1.5px] border-[#CEC9BF] dark:border-white/10 flex items-center justify-center font-mono text-[11px] font-semibold text-[#1A1714] dark:text-white shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <div
              className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white mb-1"
              style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
            >
              {item.title}
            </div>
            <div
              className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.7]"
              style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
            >
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TOC({ activeId, isKhmer }: { activeId: string; isKhmer: boolean }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const links = TOC_LINKS.map((link) => {
    if (!isKhmer) return link;

    const translated: Record<string, string> = {
      "Installation & Setup": "ការដំឡើង និង Setup",
      "Download & install": "ទាញយក និងដំឡើង",
      "Verify & first run": "ផ្ទៀងផ្ទាត់ និងដំណើរការលើកដំបូង",
      Authentication: "Authentication",
      "Login command": "Login command",
      "CI / non-interactive": "CI / non-interactive",
      "Command Execution": "ការប្រើ Commands",
      "Example commands": "ឧទាហរណ៍ Commands",
      "Parameter validation": "Parameter validation",
      "Supported Tools": "Tools ដែលគាំទ្រ",
      "Remote Execution Model": "Remote Execution Model",
      "Output Streaming": "Output Streaming",
      "Result Handling": "ការគ្រប់គ្រង Results",
      "Job Lifecycle": "Job Lifecycle",
      "Job commands": "Job commands",
      "Security & Access Control": "Security និង Access Control",
      "How It Works": "របៀបដំណើរការ",
    };

    return { ...link, label: translated[link.label] ?? link.label };
  }).filter((link) =>
    link.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <aside
      className="w-72 shrink-0 sticky top-22 self-start max-h-[calc(100vh-5.5rem)] overflow-y-auto px-6 py-7 border-l border-[#E2DDD5] dark:border-white/10 hidden xl:block bg-[#F7F5F0] dark:bg-[#09090B]"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#E2DDD5 transparent" }}
    >
        <div className="mb-5">
          <label htmlFor="cli-doc-search" className="sr-only">
            {isKhmer ? "ស្វែងរកខ្លឹមសារ" : "Search content"}
          </label>
        <div className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[#DDD6CA] dark:border-white/10 bg-white/95 dark:bg-[#121214] shadow-[0_10px_30px_rgba(26,23,20,0.05)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-all duration-200 hover:border-[#CFC6B7] dark:hover:border-white/15 focus-within:border-[#00BCA1]/45 focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.10)] dark:focus-within:shadow-[0_14px_34px_rgba(0,188,161,0.12)]">
          <svg className="w-4 h-4 stroke-[#9A9287] dark:stroke-[#8F96A3] fill-none shrink-0 transition-colors duration-200 group-focus-within:stroke-[#00BCA1]" viewBox="0 0 24 24" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            id="cli-doc-search"
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isKhmer ? "ស្វែងរកខ្លឹមសារ..." : "Search content..."}
            className="w-full bg-transparent outline-none text-[18px] text-[#4A4540] dark:text-[#E5E7EB] placeholder:text-[#9A9287] dark:placeholder:text-[#8F96A3]"
            style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
          />
          <kbd className="shrink-0 font-mono text-[11px] px-2 py-1 rounded-lg border border-[#E2DDD5] dark:border-white/10 bg-[#F6F2EA] dark:bg-white/5 text-[#8B8378] dark:text-[#A1A1AA] shadow-sm">
            Ctrl K
          </kbd>
        </div>
      </div>
      <div className="text-[10px] font-semibold tracking-widest uppercase text-[#B5B0A8] dark:text-[#9CA3AF] mb-2.5">
        {isKhmer ? "នៅក្នុងទំព័រនេះ" : "On this page"}
      </div>
      <div className="flex flex-col gap-px">
        {links.map((link, i) => {
          const id = link.href.replace("#", "");
          const isActive = activeId === id && !("sub" in link);
          return (
            <a
              key={i}
              href={link.href}
              onClick={(e) => smoothScroll(e, link.href)}
              className={`text-[18px] font-normal py-0.75 rounded border-l-2 transition-all duration-150 leading-[1.55] cursor-pointer ${
                "sub" in link && link.sub ? "pl-4.5" : "pl-2"
              } ${
                isActive
                  ? "text-[#00BCA1] border-l-[#00BCA1] font-medium"
                  : "text-[#88837B] dark:text-[#A1A1AA] border-l-transparent hover:text-[#1A1714] dark:hover:text-white"
              }`}
              style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
            >
              {link.label}
            </a>
          );
        })}
      </div>
    </aside>
  );
}

/* ── Main Content ─────────────────────────────────────────── */
export default function Content() {
  const [activeId, setActiveId] = useState("installation");
  const locale = useLocale();
  const isKhmer = locale === "kh";

  useEffect(() => {
    const sections = document.querySelectorAll(".doc-section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { threshold: 0.18, rootMargin: "-58px 0px -54% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex-1 min-w-0 flex items-start">
      {/* Main article */}
      <main
        className="flex-1 min-w-0 px-12 xl:px-14 pt-12 pb-32 max-[960px]:px-8 max-[640px]:px-5"
        style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
      >
        {/* ── Page Header ── */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-base md:text-[18px] lg:text-[20px] text-[#88837B] dark:text-[#A1A1AA] mb-4.5">
            <a href="#" className="hover:text-[#1A1714] dark:hover:text-white transition-colors duration-150">Docs</a>
            <svg className="w-2.75 h-2.75 stroke-[#B5B0A8] fill-none" viewBox="0 0 24 24" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            <a href="#" className="hover:text-[#1A1714] dark:hover:text-white transition-colors duration-150">Automation Tools</a>
            <svg className="w-2.75 h-2.75 stroke-[#B5B0A8] fill-none" viewBox="0 0 24 24" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
            <span>CLI</span>
          </div>

          <div className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-[#00BCA1] bg-[rgba(0,188,161,0.07)] border border-[rgba(0,188,161,0.2)] px-2.5 py-0.75 rounded-full mb-3.5">
            <span className="w-1.25 h-1.25 rounded-full bg-[#00BCA1] animate-pulse" />
            {isKhmer ? "ឯកសារមុខងារ · v2.0" : "Feature Documentation · v2.0"}
          </div>

          <h1
            className="text-[2.4rem] font-bold tracking-[-0.035em] leading-[1.14] text-[#1A1714] dark:text-white mb-3"
            style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
          >
            CLI
          </h1>
          <p
            className="text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] leading-[1.82] mb-7 max-w-145 font-normal"
            style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
          >
            {isKhmer
              ? "CLI standalone មួយដែលអនុញ្ញាតឱ្យអ្នកដំណើរការ security tools ដែលគាំទ្រពី terminal របស់អ្នក ដោយប្រើ backend ទាំងស្រុង។ មិនចាំបាច់ដំឡើង tools នៅលើម៉ាស៊ីនរបស់អ្នកទេ។"
              : "A standalone command-line client that lets you run supported security tools from your terminal — powered entirely by the backend. No local tool installation required."}
          </p>

          <div className="flex flex-wrap gap-4 mb-7 pb-7 border-b border-[#E2DDD5]">
            {[
              { icon: "🖥️", label: "Cross-platform binary" },
              { icon: "🔐", label: "Token-based auth" },
              { icon: "📡", label: "Real-time streaming" },
            ].map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-1.5 text-base md:text-[18px] lg:text-[20px] font-medium text-[#88837B] dark:text-[#A1A1AA] bg-white dark:bg-[#121214] border border-[#E2DDD5] dark:border-white/10 px-3 py-1 rounded-full"
              >
                <span>{pill.icon}</span>
                {pill.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Installation ── */}
        <section className="doc-section mb-12" id="installation">
          <SectionHeading id="installation" badge={isKhmer ? "ម្តងតែប៉ុណ្ណោះ" : "one-time"}>{isKhmer ? "ការដំឡើង និង Setup" : "Installation & Setup"}</SectionHeading>
          <Para>{isKhmer ? "ដំឡើង Auto Offensive CLI ដោយប្រើ command តែមួយ។ CLI ត្រូវបានចែកចាយជា standalone binary ដោយមិនត្រូវការ dependencies ឬ package manager ទេ។" : "Install the Auto Offensive CLI with a single command. The CLI is distributed as a standalone binary — no dependencies, no package manager required."}</Para>

          <StepList>
            <Step num={1} title={isKhmer ? "ទាញយក binary" : "Download the binary"} desc={isKhmer ? <>ដំឡើង CLI ដោយផ្ទាល់តាម install script ឬទាញយក binary សម្រាប់ platform របស់អ្នកពី releases page។</> : <>Install the CLI directly using the install script, or download the binary for your platform from the releases page.</>} />
            <Step num={2} title={isKhmer ? "កំណត់ឱ្យអាចដំណើរការបាន (Linux / macOS)" : "Make it executable (Linux / macOS)"} desc={isKhmer ? <>រត់ <InlineCode>chmod +x pentest</InlineCode> បន្ទាប់មកផ្លាស់ទីវាទៅកាន់ directory ក្នុង <InlineCode>$PATH</InlineCode> របស់អ្នក ដូចជា <InlineCode>/usr/local/bin</InlineCode>។</> : <>Run <InlineCode>chmod +x pentest</InlineCode> then move it to a directory in your <InlineCode>$PATH</InlineCode> such as <InlineCode>/usr/local/bin</InlineCode>.</>} />
            <Step num={3} title="Authenticate" desc={isKhmer ? <>រត់ <InlineCode>pentest login</InlineCode> ហើយធ្វើតាម prompt ឬកំណត់ API token ដោយផ្ទាល់ជាមួយ <InlineCode>pentest login --token &lt;your-token&gt;</InlineCode>។</> : <>Run <InlineCode>pentest login</InlineCode> and follow the prompt, or set your API token directly with <InlineCode>pentest login --token &lt;your-token&gt;</InlineCode>.</>} />
            <Step num={4} title={isKhmer ? "ដំណើរការ scan ដំបូងរបស់អ្នក" : "Run your first scan"} desc={isKhmer ? <>ឥឡូវអ្នកអាចប្រើបានហើយ។ ប្រើ command ដែលគាំទ្រណាមួយដូចជា <InlineCode>pentest subfinder -d example.com</InlineCode> ហើយ results នឹង stream ត្រឡប់មកវិញជាពេលវេលាជាក់ស្តែង។</> : <>You&apos;re ready. Use any supported command like <InlineCode>pentest subfinder -d example.com</InlineCode> — results stream back in real time.</>} last />
          </StepList>

          <Callout type="brand" icon="📦" title={isKhmer ? "មិនចាំបាច់ដំឡើង third-party tools" : "No third-party tools required"}>
            {isKhmer ? <>អ្នក <strong className="text-[#1A1714] dark:text-white font-semibold">មិនចាំបាច់</strong> ដំឡើង <InlineCode>subfinder</InlineCode>, <InlineCode>httpx</InlineCode>, <InlineCode>naabu</InlineCode> ឬ scanning tool ផ្សេងៗនៅលើម៉ាស៊ីនរបស់អ្នកទេ។ CLI ទាក់ទងជាមួយ backend ហើយការដំណើរការទាំងអស់កើតឡើងនៅទីនោះ។</> : <>You do <strong className="text-[#1A1714] dark:text-white font-semibold">not</strong> need to install <InlineCode>subfinder</InlineCode>, <InlineCode>httpx</InlineCode>, <InlineCode>naabu</InlineCode>, or any other scanning tool locally. The CLI communicates with the backend — all execution happens there.</>}
          </Callout>

          <CodeBlock title="bash — install & verify">
            <Cm># Download and install (Linux / macOS){"\n"}</Cm>
            <Prompt />
            <Cmd>curl</Cmd>
            {" "}
            <Flag>-sSL</Flag>
            {" https://get.autooffensive.io/cli "}
            <Dim>|</Dim>
            {" bash\n\n"}
            <Cm># Verify installation{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" "}
            <Flag>--version</Flag>
            {"\n"}
            <Ok /> pentest CLI v2.0.1{"\n\n"}
            <Cm># Authenticate with your account{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" login\n"}
            <Ok /> Logged in as user@example.com
          </CodeBlock>
        </section>

        {/* ── Authentication ── */}
        <section className="doc-section mb-12" id="auth">
          <SectionHeading id="auth">Authentication</SectionHeading>
          <Para>{isKhmer ? "CLI ប្រើ token-based authentication។ Credentials ត្រូវបានរក្សាទុកយ៉ាងសុវត្ថិភាពនៅក្នុង local config directory របស់អ្នក។ រាល់ CLI requests ទៅ backend ទាមទារ session ដែលមានសុពលភាព។" : "The CLI uses token-based authentication. Credentials are securely stored in your local config directory. All CLI requests to the backend require a valid session."}</Para>

          <FeatureList>
            <FeatureItem icon="🔑" title="Login command" desc={isKhmer ? <>រត់ <InlineCode>pentest login</InlineCode> ដើម្បី authenticate แบบ interactive ឬប្រើ <InlineCode>--token &lt;api-token&gt;</InlineCode> សម្រាប់ការប្រើប្រាស់ non-interactive នៅក្នុង CI environment។</> : <>Run <InlineCode>pentest login</InlineCode> to authenticate interactively, or pass <InlineCode>--token &lt;api-token&gt;</InlineCode> for non-interactive use in CI environments.</>} tag={<Tag variant="muted">Interactive</Tag>} />
            <FeatureItem icon="🗃️" title={isKhmer ? "Stored credentials" : "Stored credentials"} desc={isKhmer ? "Authentication credentials ត្រូវបានរក្សាទុក locally នៅក្នុង config file របស់អ្នក។ វាមិនត្រូវបានបញ្ជូនឡើយ លើកលែងតែជា bearer tokens នៅពេលធ្វើ API request នីមួយៗ។" : "Authentication credentials are stored locally in your config file. They are never transmitted except as bearer tokens on each API request."} tag={<Tag variant="green">Secure</Tag>} />
            <FeatureItem icon="🚪" title="Logout" desc={isKhmer ? <>រត់ <InlineCode>pentest logout</InlineCode> ដើម្បីបិទ local session។ token របស់អ្នកនៅតែមានសុពលភាពនៅលើឧបករណ៍ផ្សេងទៀត រហូតទាល់តែអ្នកដកសិទ្ធិវាដោយដៃពី dashboard។</> : <>Run <InlineCode>pentest logout</InlineCode> to revoke the local session. Your token remains valid on other devices until manually revoked from the dashboard.</>} />
          </FeatureList>

          <CodeBlock title="bash — authentication">
            <Cm># Interactive login{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" login\n  Email: user@example.com\n  Password: ••••••••\n"}
            <Ok /> Authenticated. Token saved to ~/.pentest/config{"\n\n"}
            <Cm># Non-interactive (CI / scripted){"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" login "}
            <Flag>--token</Flag>
            {" "}
            <Val>pt_live_xxxxxxxxxxxx</Val>
            {"\n"}
            <Ok /> Token accepted{"\n\n"}
            <Cm># View current session{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" whoami\n"}
            <Dim>user@example.com  ·  Free plan  ·  48 scans remaining today</Dim>
          </CodeBlock>
        </section>

        {/* ── Commands ── */}
        <section className="doc-section mb-12" id="commands">
          <SectionHeading id="commands">{isKhmer ? "ការប្រើ Commands" : "Command Execution"}</SectionHeading>
          <Para>{isKhmer ? "CLI command នីមួយៗត្រូវបានផ្គូផ្គងដោយផ្ទាល់ទៅកាន់ backend tool ដែលគាំទ្រ។ CLI នឹង validate input parameters ទាំងអស់មុនពេលផ្ញើ request ហើយ parameters ដែលមិនត្រឹមត្រូវ ឬមិនគាំទ្រ នឹងត្រូវបដិសេធនៅ local មុនពេលមាន network call ណាមួយ។" : "Each CLI command maps directly to a supported backend tool. The CLI validates all input parameters before sending the request — invalid or unsupported parameters are rejected locally before any network call is made."}</Para>

          <Callout type="info" icon="ℹ️" title={isKhmer ? "ទម្រង់ Command" : "Command format"}>
            {isKhmer ? <>Commands អនុវត្តតាមទម្រង់ <InlineCode>pentest &lt;tool&gt; [flags]</InlineCode>។ tool នីមួយៗបង្ហាញតែ flags ដែលវាគាំទ្រប៉ុណ្ណោះ ហើយមិនអនុញ្ញាត arbitrary shell arguments ឱ្យឆ្លងកាត់ទេ។</> : <>Commands follow the pattern <InlineCode>pentest &lt;tool&gt; [flags]</InlineCode>. Each tool exposes only its supported flags — no arbitrary shell arguments are passed through.</>}
          </Callout>

          <SubHeading>{isKhmer ? "ឧទាហរណ៍ Commands" : "Example commands"}</SubHeading>
          <CodeBlock title="bash — example commands">
            <Cm># Subdomain enumeration{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" subfinder "}
            <Flag>-d</Flag>
            {" "}
            <Val>example.com</Val>
            {"\n\n"}
            <Cm># HTTP probing from a domain list file{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" httpx "}
            <Flag>-l</Flag>
            {" "}
            <Val>domains.txt</Val>
            {"\n\n"}
            <Cm># Port scanning on specific ports{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" naabu "}
            <Flag>-host</Flag>
            {" "}
            <Val>example.com</Val>
            {" "}
            <Flag>-p</Flag>
            {" "}
            <Val>80,443,8080</Val>
            {"\n\n"}
            <Cm># Vulnerability scan with nuclei templates{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" nuclei "}
            <Flag>-u</Flag>
            {" "}
            <Val>https://example.com</Val>
            {" "}
            <Flag>-t</Flag>
            {" "}
            <Val>cves</Val>
          </CodeBlock>

          <SubHeading>Parameter validation</SubHeading>
          <FeatureList>
            <FeatureItem icon="✅" title="Local validation" desc={isKhmer ? "CLI ពិនិត្យ flags និង values ទាំងអស់នៅ local មុនពេលផ្ញើ។ flags ដែលត្រូវការ តែខ្វះ, format មិនត្រឹមត្រូវ ឬ parameters ដែលមិនគាំទ្រ នឹងត្រូវរកឃើញភ្លាមៗជាមួយ error message ដែលយល់ងាយ។" : "The CLI checks all flags and values locally before sending. Missing required flags, invalid formats, or unsupported parameters are caught immediately with a helpful error message."} />
            <FeatureItem icon="🚫" title={isKhmer ? "Unsupported flags ត្រូវបានបដិសេធ" : "Unsupported flags are rejected"} desc={isKhmer ? "ទទួលយកតែ predefined flags សម្រាប់ tool នីមួយៗប៉ុណ្ណោះ។ ការបញ្ជូន arbitrary shell arguments ឬព្យាយាម chain commands មិនត្រូវបានគាំទ្រ ហើយនឹងត្រូវបដិសេធ។" : "Only predefined flags for each tool are accepted. Passing arbitrary shell arguments or attempting to chain commands is not supported and will be refused."} />
          </FeatureList>
        </section>

        {/* ── Supported Tools ── */}
        <section className="doc-section mb-12" id="tools">
          <SectionHeading id="tools">{isKhmer ? "Tools ដែលគាំទ្រ" : "Supported Tools"}</SectionHeading>
          <Para>{isKhmer ? "ខាងក្រោមនេះគឺជា tools ដែលអាចប្រើបានតាមរយៈ CLI។ tool នីមួយៗត្រូវបានបង្ហាញតាម predefined commands ជាមួយសំណុំ parameters ដែលគាំទ្រថេរ។" : "The following tools are available through the CLI. Each is exposed through predefined commands with a fixed set of supported parameters."}</Para>

          <div className="overflow-x-auto my-3.5 rounded-xl border border-[#E2DDD5] dark:border-white/10 bg-white dark:bg-[#121214]">
            <table className="w-max min-w-full border-collapse">
              <thead className="bg-[#F0EDE6] dark:bg-white/5">
                <tr>
                  {(isKhmer ? ["Command", "Tool", "Category", "ការពិពណ៌នា"] : ["Command", "Tool", "Category", "Description"]).map((h) => (
                    <th key={h} className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#88837B] dark:text-[#9CA3AF] px-3.5 py-2.5 text-left border-b border-[#E2DDD5] dark:border-white/10 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cmd: "pentest subfinder", tool: "subfinder", cat: <Tag variant="recon">Recon</Tag>, desc: isKhmer ? "ស្វែងរក subdomain ពី passive sources និង DNS brute-force" : "Subdomain enumeration from passive sources and DNS brute-force" },
                  { cmd: "pentest httpx", tool: "httpx", cat: <Tag variant="web">Web</Tag>, desc: isKhmer ? "HTTP probing ដូចជា status codes, titles, server technologies និង response headers" : "HTTP probing — status codes, titles, server technologies, response headers" },
                  { cmd: "pentest naabu", tool: "naabu", cat: <Tag variant="net">Network</Tag>, desc: isKhmer ? "TCP port scanning ល្បឿនលឿន ជាមួយ built-in service detection" : "Fast TCP port scanning with built-in service detection" },
                  { cmd: "pentest nuclei", tool: "nuclei", cat: <Tag variant="web">Web</Tag>, desc: isKhmer ? "scanner សម្រាប់ vulnerability និង misconfiguration ដែលផ្អែកលើ templates" : "Template-based vulnerability and misconfiguration scanner" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[#F0EDE6] dark:hover:bg-white/5 transition-colors duration-150">
                    <td
                      className="px-3.5 py-2.5 border-b border-[#E2DDD5] dark:border-white/10 last:border-b-0 text-[16px] md:text-[18px] lg:text-[20px] text-[#00BCA1] font-medium whitespace-nowrap"
                      style={monoFontStyle}
                    >
                      {row.cmd}
                    </td>
                    <td
                      className="px-3.5 py-2.5 border-b border-[#E2DDD5] dark:border-white/10 text-[16px] md:text-[18px] lg:text-[20px] text-[#00BCA1] font-medium whitespace-nowrap"
                      style={monoFontStyle}
                    >
                      {row.tool}
                    </td>
                    <td className="px-3.5 py-2.5 border-b border-[#E2DDD5] dark:border-white/10 whitespace-nowrap">{row.cat}</td>
                    <td
                      className="px-3.5 py-2.5 border-b border-[#E2DDD5] dark:border-white/10 text-base md:text-[18px] lg:text-[20px] text-[#4A4540] dark:text-[#C9CDD4] whitespace-nowrap"
                      style={{ fontFamily: "var(--font-google-sans), var(--font-noto-khmer), sans-serif" }}
                    >
                      {row.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Remote Execution ── */}
        <section className="doc-section mb-12" id="execution">
          <SectionHeading id="execution">Remote Execution Model</SectionHeading>
          <Para>{isKhmer ? "CLI មិនដែលដំណើរការ tools នៅ local ទេ។ វាដើរតួជាកម្មវិធី client សម្រាប់ validate input, ផ្ញើ structured request ទៅ backend ហើយ stream results ត្រឡប់មកវិញ។" : "The CLI never executes tools locally. It acts purely as a client — validating input, sending a structured request to the backend, and streaming back the results."}</Para>

          <FeatureList>
            <FeatureItem icon="📤" title="Structured request" desc={isKhmer ? "CLI បម្លែង command និង flags របស់អ្នកទៅជា structured JSON request ហើយផ្ញើទៅ Auto Offensive backend តាម authenticated HTTPS connection។" : "The CLI serialises your command and flags into a structured JSON request and sends it to the Auto Offensive backend over an authenticated HTTPS connection."} />
            <FeatureItem icon="🏗️" title={isKhmer ? "ការបង្កើត scan job" : "Scan job creation"} desc={isKhmer ? "backend ទទួល request, validate វាតាម parameter schema ដែលអនុញ្ញាត ហើយបង្កើត scan job ថ្មីមួយជាមួយ job ID ពិសេស។" : "The backend receives the request, validates it against the allowed parameter schema, and creates a new scan job with a unique job ID."} />
            <FeatureItem icon="🔒" title="Isolated environment" desc={isKhmer ? "job ដំណើរការនៅក្នុង sandboxed isolated container ដែលគ្រប់គ្រងដោយ backend workers។ execution នីមួយៗមានអាយុកាលខ្លី និងដាច់ដោយឡែកពីគ្នា។" : "The job executes in a sandboxed, isolated container managed by backend workers. Each execution is ephemeral and independent — no state bleeds between jobs."} />
            <FeatureItem icon="📡" title={isKhmer ? "Results ត្រូវបាន stream ត្រឡប់មកវិញ" : "Results streamed back"} desc={isKhmer ? "នៅពេល tool កំពុងដំណើរការ stdout និង stderr ត្រូវបាន stream ត្រឡប់មក terminal របស់អ្នកជាពេលវេលាជាក់ស្តែង តាម persistent connection ដើម្បីឱ្យមានអារម្មណ៍ដូចដំណើរការនៅ local។" : "As the tool runs, stdout and stderr are streamed in real time back to your terminal via a persistent connection — so it feels like a local execution."} />
          </FeatureList>
        </section>

        {/* ── Streaming ── */}
        <section className="doc-section mb-12" id="streaming">
          <SectionHeading id="streaming">Real-Time Output Streaming</SectionHeading>
          <Para>{isKhmer ? "CLI រក្សាទុក streaming connection ជាមួយ backend ក្នុងអំឡុងពេល job ដំណើរការ។ Live logs នឹងបង្ហាញក្នុង terminal របស់អ្នក ដូចជាអ្នករត់ tool នៅ local ផ្ទាល់។" : "The CLI maintains a streaming connection with the backend throughout job execution. Live logs appear in your terminal exactly as they would if you ran the tool locally."}</Para>

          <CodeBlock title="live output — pentest subfinder -d example.com">
            <Prompt />
            <Cmd>pentest</Cmd>
            {" subfinder "}
            <Flag>-d</Flag>
            {" "}
            <Val>example.com</Val>
            {"\n\n"}
            <Dim>  Job ID  :  job_01HXYZ9KM3...{"\n"}</Dim>
            <Dim>  Status  :  Running{"\n"}</Dim>
            <Dim>  Tool    :  subfinder  ·  Remote execution{"\n\n"}</Dim>
            <Ok /> api.example.com{"\n"}
            <Ok /> dev.example.com{"\n"}
            <Ok /> staging.example.com{"\n"}
            <Ok /> mail.example.com{"\n"}
            <Ok /> vpn.example.com{"\n\n"}
            <Acc>──────────────────────────────────{"\n"}</Acc>
            <Dim>  Found   :  5 subdomains{"\n"}</Dim>
            <Dim>  Elapsed :  3.4s{"\n"}</Dim>
            <Ok /> Results saved  ·  View: https://app.autooffensive.io/jobs/job_01HXYZ9KM3
          </CodeBlock>
        </section>

        {/* ── Results ── */}
        <section className="doc-section mb-12" id="results">
          <SectionHeading id="results">{isKhmer ? "ការគ្រប់គ្រង Results" : "Result Handling"}</SectionHeading>
          <Para>{isKhmer ? "Results ត្រូវបានបង្ហាញទាំងក្នុង terminal របស់អ្នក និងរក្សាទុកដោយស្វ័យប្រវត្តិនៅក្នុង backend system។ អ្នកអាចចូលមើលវាម្ដងទៀតពេលក្រោយ ដោយមិនចាំបាច់រត់ scan សារជាថ្មី។" : "Results are both displayed in your terminal and automatically stored in the backend system. You can access them again later without re-running the scan."}</Para>

          <FeatureList>
            <FeatureItem icon="🖥️" title={isKhmer ? "ការបង្ហាញក្នុង terminal" : "Terminal display"} desc={isKhmer ? "output ទាំងអស់ត្រូវបានបោះពុម្ពបន្តផ្ទាល់ទៅ terminal របស់អ្នកនៅពេល job កំពុងដំណើរការ រួមទាំង summary ចុងក្រោយ និង direct link ទៅកាន់ job result page។" : "All output is printed live to your terminal as the job runs — including final summary counts and a direct link to the job result page."} />
            <FeatureItem icon="💾" title="Automatic backend storage" desc={isKhmer ? "result នីមួយៗត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិទៅក្នុង account របស់អ្នក។ Results ត្រូវបានភ្ជាប់ទៅ scan job និង project ដែលត្រូវគ្នានៅក្នុង web UI។" : "Every result is automatically saved to your account. Results are attached to the corresponding scan job and project in the web UI."} />
            <FeatureItem icon="🌐" title={isKhmer ? "មើលតាម web UI" : "View via web UI"} desc={isKhmer ? "ចូលមើល job result ចាស់ៗណាមួយពី Auto Offensive web dashboard ដោយមាន AI analysis, severity scoring និង report generation ពេញលេញ។" : "Access any past job result from the Auto Offensive web dashboard — with full AI analysis, severity scoring, and report generation available."} />
            <FeatureItem icon="📋" title={isKhmer ? "រួមបញ្ចូលក្នុង reports" : "Included in reports"} desc={isKhmer ? "CLI job results អាចរួមបញ្ចូលក្នុង security reports ដែលបានបង្កើត ដូចគ្នានឹង results ពី web UI scans ដែរ ហើយគាំទ្រ PDF, DOCX, Excel និង JSON។" : "CLI job results can be included in generated security reports just like results from web UI scans — PDF, DOCX, Excel, and JSON all supported."} />
          </FeatureList>
        </section>

        {/* ── Job Lifecycle ── */}
        <section className="doc-section mb-12" id="jobs">
          <SectionHeading id="jobs">{isKhmer ? "ការគ្រប់គ្រង Job Lifecycle" : "Job Lifecycle Management"}</SectionHeading>
          <Para>{isKhmer ? "រាល់ការដំណើរការ CLI នីមួយៗនឹងបង្កើត backend job មួយ។ Jobs ផ្លាស់ទីតាម states ដែលបានកំណត់ ហើយអាចសួរមើលបានគ្រប់ពេល។" : "Every CLI execution creates a backend job. Jobs move through defined states and can be queried at any time."}</Para>

          <Lifecycle isKhmer={isKhmer} />

          <SubHeading>{isKhmer ? "Commands សម្រាប់គ្រប់គ្រង Job" : "Job management commands"}</SubHeading>
          <CodeBlock title="bash — job management">
            <Cm># List recent jobs{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" jobs list\n"}
            <Dim>  job_01HXYZ9KM3  subfinder  example.com    completed  3.4s ago{"\n"}</Dim>
            <Dim>  job_01HXYZ7AB1  naabu      192.168.1.0/24  running   12s{"\n"}</Dim>
            <Dim>  job_01HXYZ5CD2  httpx      domains.txt    failed    1m ago{"\n\n"}</Dim>
            <Cm># Check status of a specific job{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" jobs status "}
            <Val>job_01HXYZ9KM3</Val>
            {"\n"}
            <Ok /> Status: completed  ·  5 results  ·  Elapsed: 3.4s{"\n\n"}
            <Cm># Retrieve results of a past job{"\n"}</Cm>
            <Prompt />
            <Cmd>pentest</Cmd>
            {" jobs results "}
            <Val>job_01HXYZ9KM3</Val>
            {"\n"}
            <Ok /> api.example.com{"\n"}
            <Ok /> dev.example.com{"\n"}
            <Dim>  ...</Dim>
          </CodeBlock>
        </section>

        {/* ── Security ── */}
        <section className="doc-section mb-12" id="security">
          <SectionHeading id="security">{isKhmer ? "Security និង Access Control" : "Security & Access Control"}</SectionHeading>
          <Para>{isKhmer ? "CLI អនុវត្តការគ្រប់គ្រងយ៉ាងតឹងរឹងលើអ្វីដែលអាចដំណើរការ។ មិនមាន arbitrary commands ឬ shell access ឡើយ ហើយ execution ទាំងអស់ត្រូវបានគ្រប់គ្រង និង sandboxed ដោយ backend។" : "The CLI enforces strict controls on what can be executed. No arbitrary commands or shell access are provided — execution is fully managed and sandboxed by the backend."}</Para>

          <div className="hidden">
          <SecGrid>
            <SecItem icon="🚫" title="Predefined tools only" desc="Only the supported tool set is accessible. Requests for unlisted tools or custom binaries are rejected before execution." />
            <SecItem icon="🔍" title="Parameter validation" desc="Every request is validated against the allowed parameter schema on both the CLI and the backend. Injection attempts are blocked." />
            <SecItem icon="📦" title="Isolated execution" desc="Each job runs in its own isolated container. There is no shared state, no persistent filesystem access, and no system-level exposure." />
            <SecItem icon="🔐" title="Authenticated requests" desc="All CLI requests require a valid API token. Unauthenticated or expired sessions are rejected immediately with a clear error." />
            <SecItem icon="📝" title="Audit log" desc="Every command, job, and result is logged against your account. Full audit history is available from the web dashboard." />
            <SecItem icon="⛔" title="No arbitrary execution" desc="The CLI does not support shell pass-through, piping, or arbitrary command injection. The execution surface is completely controlled." />
          </SecGrid>
          </div>
          <SecurityList isKhmer={isKhmer} />
        </section>

        {/* ── Concept ── */}
        <section className="doc-section mb-12" id="concept">
          <SectionHeading id="concept">{isKhmer ? "របៀបដំណើរការ" : "How It Works"}</SectionHeading>
          <Para>{isKhmer ? "អ្នកប្រើមិនចាំបាច់ដំឡើង security tools នីមួយៗឡើយ។ Platform ផ្តល់ tools ទាំងអស់ជា managed service ដែលអាចចូលប្រើបានតាម CLI binary តែមួយ ហើយ execution ទាំងអស់ត្រូវបានគ្រប់គ្រងដោយ backend។" : "Users never install individual security tools. The platform provides all tools as a managed service, accessible through a single CLI binary. Execution is always handled by the backend."}</Para>

          <ManagedExecutionList isKhmer={isKhmer} />
          <div className="hidden">
            <NotList isKhmer={isKhmer} />
          </div>

          <Callout type="tip" icon="✅" title={isKhmer ? "អត្ថប្រយោជន៍នៃ managed execution" : "Benefits of managed execution"}>
            {isKhmer ? <><strong className="text-[#1A1714] dark:text-white font-semibold">Environment ស្ថិតស្ថេរ</strong> — scan នីមួយៗដំណើរការលើ infrastructure ដែលគ្រប់គ្រងដូចគ្នា មិនថា local OS របស់អ្នកជាអ្វីក៏ដោយ។
            <br /><br />
            <strong className="text-[#1A1714] dark:text-white font-semibold">Centralised updates</strong> — tools ត្រូវបានធ្វើបច្ចុប្បន្នភាពដោយ platform។ អ្នកតែងតែប្រើ version ចុងក្រោយដោយមិនចាំបាច់ធ្វើអ្វីបន្ថែម។
            <br /><br />
            <strong className="text-[#1A1714] dark:text-white font-semibold">Controlled usage</strong> — execution limits, rate controls និង audit logging ត្រូវបានអនុវត្តដូចគ្នាសម្រាប់អ្នកប្រើទាំងអស់។</> : <><strong className="text-[#1A1714] dark:text-white font-semibold">Consistent environments</strong> — every scan runs on the same controlled infrastructure, regardless of your local OS.
            <br /><br />
            <strong className="text-[#1A1714] dark:text-white font-semibold">Centralised updates</strong> — tools are kept up to date by the platform. You always run the latest version without any action on your side.
            <br /><br />
            <strong className="text-[#1A1714] dark:text-white font-semibold">Controlled usage</strong> — execution limits, rate controls, and audit logging are enforced uniformly across all users.</>}
          </Callout>
        </section>

        {/* Prev / Next */}
          <div className="flex justify-between gap-4 pt-9 mt-10 border-t border-[#E2DDD5] dark:border-white/10 max-[640px]:flex-col">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[#E2DDD5] dark:border-white/10 max-w-57.5 flex-1 bg-white dark:bg-[#121214] hover:border-[#CEC9BF] hover:bg-[#F0EDE6] dark:hover:bg-white/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150 cursor-pointer">
            <svg className="w-3.75 h-3.75 stroke-[#88837B] fill-none shrink-0" viewBox="0 0 24 24" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
            <div>
              <div className="text-[11px] text-[#88837B] dark:text-[#9CA3AF] mb-0.5">{isKhmer ? "មុន" : "Previous"}</div>
              <div className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white">Multi-Tool Pipeline</div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 px-4 py-3 rounded-xl border border-[#E2DDD5] dark:border-white/10 max-w-57.5 flex-1 bg-white dark:bg-[#121214] hover:border-[#CEC9BF] hover:bg-[#F0EDE6] dark:hover:bg-white/5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-150 cursor-pointer text-right">
            <div>
              <div className="text-[11px] text-[#88837B] dark:text-[#9CA3AF] mb-0.5">{isKhmer ? "បន្ទាប់" : "Next"}</div>
              <div className="text-base md:text-[18px] lg:text-[20px] font-semibold text-[#1A1714] dark:text-white">Report Generation</div>
            </div>
            <svg className="w-3.75 h-3.75 stroke-[#88837B] fill-none shrink-0" viewBox="0 0 24 24" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
      </main>

      {/* Right TOC */}
      <TOC activeId={activeId} isKhmer={isKhmer} />
    </div>
  );
}

