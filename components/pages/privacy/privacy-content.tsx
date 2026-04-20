"use client";

import { useState, useEffect, useRef } from "react";

/* ─── Types ─────────────────────────────────── */
interface AccordionItem {
  id: string;
  index: string;
  title: string;
  content: React.ReactNode;
}

/* ─── Accordion Item Component ───────────────── */
function AccItem({
  item,
  isOpen,
  onToggle,
}: {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div id={item.id} className="border-t border-black/[0.14] dark:border-white/[0.14]">
      <button
        aria-expanded={isOpen}
        onClick={onToggle}
        className="w-full bg-transparent border-none cursor-pointer py-5 md:py-7 grid items-center text-left text-[#1A1A1A] dark:text-[#EDEDED] gap-5"
        style={{ gridTemplateColumns: "44px 1fr auto" }}
      >
        <span className="text-[11px] text-[#9A9A9A] tracking-[0.08em] font-sans">
          {item.index}
        </span>
        <span
          className={`text-base md:text-[1.1rem] font-semibold tracking-[-0.01em] transition-colors duration-200 font-heading ${
            isOpen ? "text-[#00BCA1]" : ""
          }`}
        >
          {item.title}
        </span>
        <span
          className={`w-8 h-8 border rounded-full flex items-center justify-center text-xl leading-none shrink-0 transition-all duration-300 ${
            isOpen
              ? "bg-[#00BCA1] border-[#00BCA1] text-white rotate-45"
              : "border-black/[0.14] dark:border-white/[0.14] text-[#5C5C5C] dark:text-[#9A9A9A]"
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "block pb-9 pl-16" : "hidden"
        }`}
      >
        {item.content}
      </div>
    </div>
  );
}

/* ─── Reusable content components ────────────── */
const BodyP = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A] mb-4 ${className}`}>
    {children}
  </p>
);

const Em = ({ children }: { children: React.ReactNode }) => (
  <strong className="text-[#1A1A1A] dark:text-[#EDEDED] font-medium">{children}</strong>
);

const Notice = ({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) => (
  <div
    className={`border-l-[3px] border-[#00BCA1] px-4.5 py-3.5 rounded-r-lg text-[20px] leading-[1.7] my-4 ${
      dark
        ? "bg-[#1A1A1A] dark:bg-[#111113] text-[#F7F5F0] dark:text-[#EDEDED]"
        : "bg-[rgba(0,188,161,0.09)] dark:bg-[rgba(0,188,161,0.12)] text-[#1A1A1A] dark:text-[#EDEDED]"
    }`}
  >
    {children}
  </div>
);

const ItemCard = ({ label, val }: { label: string; val: string }) => (
  <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4">
    <div className="text-[20px] tracking-[0.14em] uppercase text-[#9A9A9A] mb-2 font-sans">{label}</div>
    <div className="text-[20px] text-[#1A1A1A] dark:text-[#EDEDED] leading-[1.6]">{val}</div>
  </div>
);

const DataRow = ({ label, val, last = false }: { label: string; val: string; last?: boolean }) => (
  <div
    className={`flex justify-between items-center py-2.75 text-[20px] ${
      !last ? "border-b border-black/9 dark:border-white/9" : ""
    }`}
  >
    <span className="text-[#5C5C5C] dark:text-[#9A9A9A]">{label}</span>
    <span className="text-[#1A1A1A] dark:text-[#EDEDED] font-medium">{val}</span>
  </div>
);

const CheckList = ({ items }: { items: { text: React.ReactNode; no?: boolean }[] }) => (
  <ul className="list-none my-3">
    {items.map((item, i) => (
      <li key={i} className="text-[20px] text-[#5C5C5C] dark:text-[#9A9A9A] py-1.5 flex gap-2.5 items-start leading-[1.6]">
        <span className={`shrink-0 mt-px ${item.no ? "text-[#9A9A9A]" : "text-[#00BCA1]"}`}>
          {item.no ? "✕" : "→"}
        </span>
        <span>{item.text}</span>
      </li>
    ))}
  </ul>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[11px] px-2.75 py-1.25 bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded text-[#5C5C5C] dark:text-[#9A9A9A] tracking-[0.04em]">
    {children}
  </span>
);

const ContactCard = ({
  type,
  email,
  note,
}: {
  type: string;
  email: string;
  note: string;
}) => (
  <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-5">
    <div className="text-[20px] tracking-[0.16em] uppercase text-[#9A9A9A] mb-2.5 font-sans">{type}</div>
    <div className="text-[20px] text-[#00BCA1] mb-1.5 break-all font-medium">{email}</div>
    <div className="text-[20px] text-[#9A9A9A]">{note}</div>
  </div>
);

/* ─── Accordion data ─────────────────────────── */
const accordionItems: AccordionItem[] = [
  {
    id: "collect",
    index: "01",
    title: "What We Collect",
    content: (
      <>
        <BodyP>We only collect what's needed to run the platform and keep your account secure.</BodyP>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <ItemCard label="Account" val="Email, username, bcrypt-hashed password, encrypted API tokens" />
          <ItemCard label="Scan Data" val="Targets, findings, logs, metadata — isolated to your account" />
          <ItemCard label="Usage Signals" val="Features used, scan frequency, tool selection, login history" />
          <ItemCard label="Technical" val="IP address, browser/OS, device type — for security & abuse prevention" />
        </div>
        <Notice>
          <strong className="text-[#00BCA1]">Repository scanning is opt-in.</strong> We only access GitHub/GitLab when you explicitly authorize it.
        </Notice>
      </>
    ),
  },
  {
    id: "gdpr",
    index: "02",
    title: "GDPR & Legal Compliance",
    content: (
      <>
        <BodyP>Auto-Offensive is fully compliant with the <Em>General Data Protection Regulation (GDPR)</Em> and other international data protection laws.</BodyP>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <ItemCard label="Compliance" val="GDPR (EU/UK), CCPA (California), LGPD (Brazil)" />
          <ItemCard label="Data Controller" val="Auto-Offensive Technologies Ltd." />
          <ItemCard label="DPO Contact" val="dpo@auto-offensive.com" />
          <ItemCard label="Data Protection" val="SHA-256 encryption, annual audits" />
        </div>
        <Notice>
          <strong className="text-[#00BCA1]">Your data stays yours.</strong> We are committed to data sovereignty — your scan data is stored in your designated region unless you choose otherwise.
        </Notice>
        <CheckList
          items={[
            { text: <><Em>Lawful Basis:</Em> Performance of contract (service delivery) and legitimate interests (security)</> },
            { text: <><Em>Right to Access:</Em> Get a copy of all personal data we hold within 30 days</> },
            { text: <><Em>Right to Rectification:</Em> Correct inaccurate personal data instantly</> },
            { text: <><Em>Right to Erasure:</Em> Request deletion ("right to be forgotten") with no delay</> },
            { text: <><Em>Data Portability:</Em> Receive your data in machine-readable format (JSON/CSV)</> },
            { text: <><Em>Right to Object:</Em> Opt out of processing for marketing or legitimate interests</> },
            { text: <><Em>International Transfers:</Em> Protected by Standard Contractual Clauses (SCCs)</> },
            { text: <><Em>Cross-Border Transfers:</Em> GDPR-compliant via EU-US Data Privacy Framework</> },
          ]}
        />
        <BodyP className="mt-4">
          For GDPR data requests, email <Em>dpo@auto-offensive.com</Em> — we respond within <Em>72 hours</Em> as required by Article 12.
        </BodyP>
      </>
    ),
  },
  {
    id: "use",
    index: "03",
    title: "How We Use It",
    content: (
      <CheckList
        items={[
          { text: "Run and store your scans, display results in your dashboard" },
          { text: "Manage authentication and account security" },
          { text: "Enforce fair usage limits (3 scans/day on free tier)" },
          { text: "Detect and prevent platform abuse or DDoS misuse" },
          { text: <><Em>anonymized</Em> scan patterns to improve vulnerability detection</> },
          { text: "Send scan completion alerts and security notifications" },
          { text: "Sell, rent, or trade your data to anyone", no: true },
          { text: "Use your personal scan results for commercial purposes", no: true },
        ]}
      />
    ),
  },
  {
    id: "scan",
    index: "04",
    title: "Your Scan Data",
    content: (
      <>
        <BodyP>
          <Em>You own it entirely.</Em> Scan configs, findings, reports, history — all yours. Each account is fully isolated at the database level.
        </BodyP>
        <Notice dark>
          <strong className="text-[#00BCA1]">On AI training:</strong> We may use anonymized, aggregated patterns to improve detection models. We never identify your org, expose specific findings, or use raw data commercially.
        </Notice>
        <BodyP className="mt-4">
          Export your data anytime in <Em>JSON</Em>, <Em>CSV</Em>, or <Em>PDF</Em> from the dashboard.
        </BodyP>
      </>
    ),
  },
  {
    id: "limits",
    index: "05",
    title: "Free Tier Limits",
    content: (
      <>
        <DataRow label="Daily scans" val="3 scans / day" />
        <DataRow label="Max scan duration" val="30 minutes" />
        <DataRow label="Concurrent scans" val="1 at a time" />
        <DataRow label="Target scope" val="Single domain per scan" />
        <DataRow label="Storage" val="100 GB scan history" />
        <DataRow label="Tools available" val="All 14+ tools" last />
        <Notice>
          Accounts that abuse free resources (e.g. mass automated scanning of targets you don't own) may be suspended. Legitimate learning and testing is always welcome.
        </Notice>
      </>
    ),
  },
  {
    id: "sharing",
    index: "06",
    title: "Who We Share With",
    content: (
      <>
        <BodyP>We share the minimum necessary with trusted providers who help us operate.</BodyP>
        <div className="flex flex-wrap gap-2 my-4">
          {["AWS — Hosting", "SendGrid — Email", "Google Analytics — Aggregated metrics", "GitHub / GitLab — If you authorize", "Intercom — Support"].map((p) => (
            <Pill key={p}>{p}</Pill>
          ))}
        </div>
        <BodyP>
          All providers are contractually required to protect your data and use it only for the specified purpose. We may disclose data to authorities when required by law — and we'll notify you when legally permitted to do so.
        </BodyP>
      </>
    ),
  },
  {
    id: "retention",
    index: "07",
    title: "Data Retention",
    content: (
      <>
        <DataRow label="Account deleted" val="Credentials removed immediately" />
        <DataRow label="Scan results" val="Deleted within 7 days" />
        <DataRow label="Backups" val="Purged within 30 days" />
        <DataRow label="Anonymized analytics" val="Up to 90 days" />
        <DataRow label="Security logs" val="Up to 1 year (abuse prevention)" last />
        <Notice>
          <strong className="text-[#00BCA1]">Heads up:</strong> Download your data before deleting your account — deletion is permanent.
        </Notice>
      </>
    ),
  },
  {
    id: "rights",
    index: "08",
    title: "Your Rights",
    content: (
      <CheckList
        items={[
          { text: "View and download all your account data anytime" },
          { text: "Edit or correct your account information in settings" },
          { text: "Request full data export in portable format (within 30 days)" },
          { text: "Delete your account and all associated data permanently" },
          { text: "Unsubscribe from non-essential emails at any time" },
          { text: 'Opt out of analytics via browser "Do Not Track" or account settings' },
          { text: "File a complaint with your local data protection authority" },
        ]}
      />
    ),
  },
  {
    id: "security",
    index: "09",
    title: "Security",
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <ItemCard label="In Transit" val="HTTPS / TLS 256-bit encryption on all connections" />
          <ItemCard label="At Rest" val="AES-256 for sensitive data, bcrypt for passwords" />
          <ItemCard label="Access" val="Role-based controls, MFA available, session timeouts" />
          <ItemCard label="Monitoring" val="24/7 intrusion detection, WAF, DDoS protection on AWS" />
        </div>
        <BodyP>
          If we detect a breach, we notify you within <Em>48 hours</Em> with details and protective steps.
        </BodyP>
      </>
    ),
  },
  {
    id: "scan",
    index: "03",
    title: "Your Scan Data",
    content: (
      <>
        <BodyP>
          <Em>You own it entirely.</Em> Scan configs, findings, reports, history — all yours. Each account is fully isolated at the database level.
        </BodyP>
        <Notice dark>
          <strong className="text-[#00BCA1]">On AI training:</strong> We may use anonymized, aggregated patterns to improve detection models. We never identify your org, expose specific findings, or use raw data commercially.
        </Notice>
        <BodyP className="mt-4">
          Export your data anytime in <Em>JSON</Em>, <Em>CSV</Em>, or <Em>PDF</Em> from the dashboard.
        </BodyP>
      </>
    ),
  },
  {
    id: "limits",
    index: "04",
    title: "Free Tier Limits",
    content: (
      <>
        <DataRow label="Daily scans" val="3 scans / day" />
        <DataRow label="Max scan duration" val="30 minutes" />
        <DataRow label="Concurrent scans" val="1 at a time" />
        <DataRow label="Target scope" val="Single domain per scan" />
        <DataRow label="Storage" val="100 GB scan history" />
        <DataRow label="Tools available" val="All 14+ tools" last />
        <Notice>
          Accounts that abuse free resources (e.g. mass automated scanning of targets you don&rsquo;t own) may be suspended. Legitimate learning and testing is always welcome.
        </Notice>
      </>
    ),
  },
  {
    id: "sharing",
    index: "05",
    title: "Who We Share With",
    content: (
      <>
        <BodyP>We share the minimum necessary with trusted providers who help us operate.</BodyP>
        <div className="flex flex-wrap gap-2 my-4">
          {["AWS — Hosting", "SendGrid — Email", "Google Analytics — Aggregated metrics", "GitHub / GitLab — If you authorize", "Intercom — Support"].map((p) => (
            <Pill key={p}>{p}</Pill>
          ))}
        </div>
        <BodyP>
          All providers are contractually required to protect your data and use it only for the specified purpose. We may disclose data to authorities when required by law — and we&rsquo;ll notify you when legally permitted to do so.
        </BodyP>
      </>
    ),
  },
  {
    id: "retention",
    index: "06",
    title: "Data Retention",
    content: (
      <>
        <DataRow label="Account deleted" val="Credentials removed immediately" />
        <DataRow label="Scan results" val="Deleted within 7 days" />
        <DataRow label="Backups" val="Purged within 30 days" />
        <DataRow label="Anonymized analytics" val="Up to 90 days" />
        <DataRow label="Security logs" val="Up to 1 year (abuse prevention)" last />
        <Notice>
          <strong className="text-[#00BCA1]">Heads up:</strong> Download your data before deleting your account — deletion is permanent.
        </Notice>
      </>
    ),
  },
  {
    id: "rights",
    index: "07",
    title: "Your Rights",
    content: (
      <CheckList
        items={[
          { text: "View and download all your account data anytime" },
          { text: "Edit or correct your account information in settings" },
          { text: "Request full data export in portable format (within 30 days)" },
          { text: "Delete your account and all associated data permanently" },
          { text: "Unsubscribe from non-essential emails at any time" },
          { text: 'Opt out of analytics via browser "Do Not Track" or account settings' },
          { text: "File a complaint with your local data protection authority" },
        ]}
      />
    ),
  },
  {
    id: "security",
    index: "08",
    title: "Security",
    content: (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
          <ItemCard label="In Transit" val="HTTPS / TLS 256-bit encryption on all connections" />
          <ItemCard label="At Rest" val="AES-256 for sensitive data, bcrypt for passwords" />
          <ItemCard label="Access" val="Role-based controls, MFA available, session timeouts" />
          <ItemCard label="Monitoring" val="24/7 intrusion detection, WAF, DDoS protection on AWS" />
        </div>
        <BodyP>
          If we detect a breach, we notify you within <Em>48 hours</Em> with details and protective steps.
        </BodyP>
      </>
    ),
  },
  {
    id: "contact",
    index: "10",
    title: "Contact",
    content: (
      <>
        <BodyP>
          Questions about your data? We respond to all privacy requests within 7 business days, security issues within 24 hours.
        </BodyP>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <ContactCard type="Privacy" email="privacy@auto-offensive.com" note="Within 7 business days" />
          <ContactCard type="DPO (GDPR)" email="dpo@auto-offensive.com" note="Within 72 hours" />
          <ContactCard type="Security" email="security@auto-offensive.com" note="Within 24 hours" />
        </div>
      </>
    ),
  },
];

const navItems = [
  { href: "collect", label: "What We Collect" },
  { href: "gdpr", label: "GDPR & Legal Compliance" },
  { href: "use", label: "How We Use It" },
  { href: "scan", label: "Your Scan Data" },
  { href: "limits", label: "Free Tier Limits" },
  { href: "sharing", label: "Who We Share With" },
  { href: "retention", label: "Data Retention" },
  { href: "rights", label: "Your Rights" },
  { href: "security", label: "Security" },
  { href: "contact", label: "Contact" },
];

/* ─── Main Export ────────────────────────────── */
export default function PrivacyContent() {
  const [openId, setOpenId] = useState<string>("collect");
  const [activeNav, setActiveNav] = useState<string>("collect");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* Scroll spy */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (id: string) => {
    setOpenId(id);
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  };

  return (
    <>
      {/* ── MAIN CONTENT ── */}
      <div
        className="max-w-7xl mx-auto grid gap-10 lg:gap-16"
        style={{
          gridTemplateColumns: "220px 1fr",
          padding: "clamp(40px,6vw,72px) clamp(24px,6vw,80px)",
        }}
      >
        {/* Sidebar */}
        <aside className="hidden md:block sticky top-8 h-fit">
          <div className="text-[11px] tracking-[0.2em] uppercase text-[#9A9A9A] mb-3.5 font-sans">
            Sections
          </div>
          <ul className="list-none border-l border-black/[0.14] dark:border-white/[0.14]">
            {navItems.map((nav) => (
              <li key={nav.href}>
                <button
                  onClick={() => handleNavClick(nav.href)}
                  className={`block w-full text-left px-4 py-2 text-[20px] tracking-[0.02em] border-l-2 -ml-px transition-all duration-200 bg-transparent border-t-0 border-r-0 border-b-0 cursor-pointer ${
                    activeNav === nav.href
                      ? "text-[#1A1A1A] dark:text-[#EDEDED] font-semibold border-l-[#00BCA1]"
                      : "text-[#5C5C5C] dark:text-[#9A9A9A] border-l-transparent hover:text-[#1A1A1A] dark:hover:text-[#EDEDED]"
                  }`}
                >
                  {nav.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Accordion */}
        <div className="flex flex-col col-span-full md:col-auto">
          {accordionItems.map((item) => (
            <div
              key={item.id}
              ref={(el) => { sectionRefs.current[item.id] = el; }}
            >
              <AccItem
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? "" : item.id)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        className="border-t border-black/[0.14] dark:border-white/[0.14] flex justify-end items-center"
        style={{ padding: "32px clamp(24px,6vw,80px)" }}
      >
        <p className="text-[11px] text-[#9A9A9A] tracking-[0.06em] text-right leading-[1.8]">
          Privacy Policy v2.0 · March 2026<br />Free Platform · Open Source Friendly
        </p>
      </footer>
    </>
  );
}