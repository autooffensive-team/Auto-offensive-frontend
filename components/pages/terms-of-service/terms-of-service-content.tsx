"use client";

import { useState, useEffect, useRef } from "react";

interface AccordionItem {
  id: string;
  index: string;
  title: string;
  content: React.ReactNode;
}

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

const Warning = ({ children }: { children: React.ReactNode }) => (
  <div className="border-l-[3px] border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4.5 py-3.5 rounded-r-lg text-[20px] leading-[1.7] my-4">
    {children}
  </div>
);

const CheckList = ({ items }: { items: { text: React.ReactNode; no?: boolean }[] }) => (
  <ul className="list-none my-3">
    {items.map((item, i) => (
      <li key={i} className="text-[20px] text-[#5C5C5C] dark:text-[#9A9A9A] py-1.5 flex gap-2.5 items-start leading-[1.6]">
        <span className={`shrink-0 mt-px ${item.no ? "text-red-500" : "text-[#00BCA1]"}`}>
          {item.no ? "✕" : "→"}
        </span>
        <span>{item.text}</span>
      </li>
    ))}
  </ul>
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

const accordionItems: AccordionItem[] = [
  {
    id: "acceptance",
    index: "01",
    title: "Acceptable Use",
    content: (
      <>
        <BodyP>Auto Offensive is provided for <Em>legitimate security testing, education, and authorized penetration testing</Em>. By using our platform, you agree to the following:</BodyP>
        <CheckList
          items={[
            { text: "Only test systems you own or have explicit written authorization to test" },
            { text: "Use the platform for defensive security purposes only" },
            { text: "Respect rate limits and fair usage policies" },
            { text: "Report vulnerabilities responsibly through proper channels" },
            { text: "Use findings to improve security, not for exploitation" },
            { text: "Attack systems you don't own without authorization", no: true },
            { text: "Use automated tools for malicious scanning or DDoS", no: true },
            { text: "Share or publish vulnerabilities without responsible disclosure", no: true },
            { text: "Use the platform to harm, exploit, or steal from others", no: true },
          ]}
        />
        <Notice>
          <strong className="text-[#00BCA1]">Penetration Testing:</strong> If you're a security professional conducting authorized assessments, you may test client systems with documented permission.
        </Notice>
      </>
    ),
  },
  {
    id: "prohibited",
    index: "02",
    title: "Prohibited Activities",
    content: (
      <>
        <BodyP>The following activities are strictly prohibited and may result in immediate account suspension:</BodyP>
        <CheckList
          items={[
            { text: "Testing or attacking government, military, or critical infrastructure without authorization", no: true },
            { text: "Attempting to gain unauthorized access to systems or data", no: true },
            { text: "Conducting any form of DDoS or resource exhaustion attacks", no: true },
            { text: "Distributing malware, ransomware, or malicious tools", no: true },
            { text: "Phishing, social engineering, or identity theft operations", no: true },
            { text: "Exploiting vulnerabilities for financial gain", no: true },
            { text: "Bypassing or attempting to bypass security controls", no: true },
            { text: "Scanning or attacking targets in restricted jurisdictions", no: true },
          ]}
        />
        <Warning>
          <strong className="text-amber-600 dark:text-amber-400">Warning:</strong> Violation of these terms may result in permanent account termination, IP blocking, and legal action. We cooperate with law enforcement when required.
        </Warning>
      </>
    ),
  },
  {
    id: "account",
    index: "03",
    title: "Account Responsibilities",
    content: (
      <>
        <BodyP>You are responsible for maintaining the security of your account:</BodyP>
        <CheckList
          items={[
            { text: "Use strong, unique passwords and enable MFA when available" },
            { text: "Keep your API keys and credentials secure" },
            { text: "Report any suspicious activity immediately" },
            { text: "Ensure your team members understand and comply with these terms" },
            { text: "Do not share account credentials with unauthorized users" },
          ]}
        />
        <DataRow label="Account age requirement" val="18+ or parental consent" />
        <DataRow label="One account per person" val="Required" />
        <DataRow label="Verified email" val="Required" last />
        <Notice>
          <strong className="text-[#00BCA1]">Enterprise accounts:</strong> Organizations must designate authorized users and maintain audit logs of all testing activities.
        </Notice>
      </>
    ),
  },
  {
    id: "scans",
    index: "04",
    title: "Scan Limits & Fair Use",
    content: (
      <>
        <BodyP>To ensure platform stability and fairness, we enforce the following limits:</BodyP>
        <DataRow label="Free tier daily scans" val="3 scans / day" />
        <DataRow label="Max scan duration" val="30 minutes" />
        <DataRow label="Concurrent scans" val="1 at a time" />
        <DataRow label="Target scope" val="Single domain per scan" />
        <DataRow label="Storage" val="100 GB scan history" />
        <DataRow label="API rate limits" val="100 requests / minute" last />
        <Notice>
          <strong className="text-[#00BCA1]">Enterprise tier:</strong> Higher limits available. Contact sales@auto-offensive.com for custom plans.
        </Notice>
      </>
    ),
  },
  {
    id: "intellectual",
    index: "05",
    title: "Intellectual Property",
    content: (
      <>
        <BodyP>
          <Em>Auto Offensive platform:</Em> All software, tools, code, and content are the property of Auto Offensive. You may not copy, reverse engineer, or distribute our proprietary technology.
        </BodyP>
        <BodyP>
          <Em>Your findings:</Em> You own all scan results, findings, and reports you generate. We provide export options in JSON, CSV, and PDF formats.
        </BodyP>
        <BodyP>
          <Em>Open source tools:</Em> Many tools in our platform are open source (Nmap, SQLmap, etc.). Their respective licenses apply independently.
        </BodyP>
        <CheckList
          items={[
            { text: "Export your findings anytime from the dashboard" },
            { text: "Use reports for client deliverables and documentation" },
            { text: "Share anonymized findings for community improvement" },
            { text: "Resell or redistribute Auto Offensive scan data", no: true },
          ]}
        />
      </>
    ),
  },
  {
    id: "liability",
    index: "06",
    title: "Limitation of Liability",
    content: (
      <>
        <BodyP>Auto Offensive is provided "as is" without warranties. We are not liable for:</BodyP>
        <CheckList
          items={[
            { text: "Any damages resulting from your use of the platform" },
            { text: "Legal consequences of unauthorized testing" },
            { text: "Loss of data due to service interruptions" },
            { text: "Actions taken by third parties using your account" },
            { text: "Indirect, incidental, or consequential damages" },
          ]}
        />
        <Notice dark>
          <strong className="text-[#00BCA1]">User responsibility:</strong> You are solely responsible for ensuring your testing activities are legal and authorized in your jurisdiction.
        </Notice>
      </>
    ),
  },
  {
    id: "termination",
    index: "07",
    title: "Termination",
    content: (
      <>
        <BodyP>We may suspend or terminate your account at any time for:</BodyP>
        <CheckList
          items={[
            { text: "Violation of these Terms of Service" },
            { text: "Suspicious or illegal activity" },
            { text: "Non-payment (for enterprise accounts)" },
            { text: "Abuse of platform resources" },
            { text: "Failure to respond to security inquiries" },
          ]}
        />
        <BodyP className="mt-4">You may delete your account at any time. Upon termination, we retain data per our Privacy Policy.</BodyP>
      </>
    ),
  },
  {
    id: "changes",
    index: "08",
    title: "Changes to Terms",
    content: (
      <>
        <BodyP>We may update these terms periodically. Significant changes will be communicated via:</BodyP>
        <CheckList
          items={[
            { text: "Email notification to your registered address" },
            { text: "Platform dashboard notice" },
            { text: "Announcement on our website" },
          ]}
        />
        <BodyP>Continued use after changes constitutes acceptance of updated terms.</BodyP>
      </>
    ),
  },
  {
    id: "contact",
    index: "09",
    title: "Contact",
    content: (
      <>
        <BodyP>Questions about these terms? Reach out to our legal and compliance team.</BodyP>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-5">
            <div className="text-[20px] tracking-[0.16em] uppercase text-[#9A9A9A] mb-2.5 font-sans">Legal</div>
            <div className="text-[20px] text-[#00BCA1] mb-1.5 break-all font-medium">legal@auto-offensive.com</div>
            <div className="text-[20px] text-[#9A9A9A]">For legal inquiries</div>
          </div>
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-5">
            <div className="text-[20px] tracking-[0.16em] uppercase text-[#9A9A9A] mb-2.5 font-sans">Compliance</div>
            <div className="text-[20px] text-[#00BCA1] mb-1.5 break-all font-medium">compliance@auto-offensive.com</div>
            <div className="text-[20px] text-[#9A9A9A]">For compliance questions</div>
          </div>
        </div>
      </>
    ),
  },
];

const navItems = [
  { href: "acceptance", label: "Acceptable Use" },
  { href: "prohibited", label: "Prohibited Activities" },
  { href: "account", label: "Account Responsibilities" },
  { href: "scans", label: "Scan Limits & Fair Use" },
  { href: "intellectual", label: "Intellectual Property" },
  { href: "liability", label: "Limitation of Liability" },
  { href: "termination", label: "Termination" },
  { href: "changes", label: "Changes to Terms" },
  { href: "contact", label: "Contact" },
];

export default function TermsOfServiceContent() {
  const [openId, setOpenId] = useState<string>("acceptance");
  const [activeNav, setActiveNav] = useState<string>("acceptance");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      <div
        className="max-w-7xl mx-auto grid gap-10 lg:gap-16"
        style={{
          gridTemplateColumns: "220px 1fr",
          padding: "clamp(40px,6vw,72px) clamp(24px,6vw,80px)",
        }}
      >
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

      <footer
        className="border-t border-black/[0.14] dark:border-white/[0.14] flex justify-end items-center"
        style={{ padding: "32px clamp(24px,6vw,80px)" }}
      >
        <p className="text-[11px] text-[#9A9A9A] tracking-[0.06em] text-right leading-[1.8]">
          Terms of Service v2.0 · April 2026<br />Ethical Security Testing Platform
        </p>
      </footer>
    </>
  );
}