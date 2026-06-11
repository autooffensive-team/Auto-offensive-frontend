"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

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

const sectionIds = [
  "collect",
  "gdpr",
  "use",
  "scan",
  "limits",
  "sharing",
  "retention",
  "rights",
  "security",
  "contact",
] as const;

/* ─── Main Export ────────────────────────────── */
export default function PrivacyContent() {
  const t = useTranslations("privacy");
  const [openId, setOpenId] = useState<string>("collect");
  const [activeNav, setActiveNav] = useState<string>("collect");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const navItems = sectionIds.map((id) => ({
    href: id,
    label: t(`nav.${id}`),
  }));

  const providers = t.raw("accordion.sharing.providers") as string[];

  const accordionItems: AccordionItem[] = [
    {
      id: "collect",
      index: "01",
      title: t("accordion.collect.title"),
      content: (
        <>
          <BodyP>{t("accordion.collect.lead")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            <ItemCard label={t("accordion.collect.items.account")} val={t("accordion.collect.items.accountVal")} />
            <ItemCard label={t("accordion.collect.items.scanData")} val={t("accordion.collect.items.scanDataVal")} />
            <ItemCard label={t("accordion.collect.items.usageSignals")} val={t("accordion.collect.items.usageSignalsVal")} />
            <ItemCard label={t("accordion.collect.items.technical")} val={t("accordion.collect.items.technicalVal")} />
          </div>
          <Notice>{t("accordion.collect.notice")}</Notice>
        </>
      ),
    },
    {
      id: "gdpr",
      index: "02",
      title: t("accordion.gdpr.title"),
      content: (
        <>
          <BodyP>{t("accordion.gdpr.lead")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            <ItemCard label={t("accordion.gdpr.items.compliance")} val={t("accordion.gdpr.items.complianceVal")} />
            <ItemCard label={t("accordion.gdpr.items.dataController")} val={t("accordion.gdpr.items.dataControllerVal")} />
            <ItemCard label={t("accordion.gdpr.items.dpoContact")} val={t("accordion.gdpr.items.dpoContactVal")} />
            <ItemCard label={t("accordion.gdpr.items.dataProtection")} val={t("accordion.gdpr.items.dataProtectionVal")} />
          </div>
          <Notice>{t("accordion.gdpr.notice")}</Notice>
          <CheckList
            items={[
              { text: t("accordion.gdpr.rights.lawfulBasis") },
              { text: t("accordion.gdpr.rights.rightToAccess") },
              { text: t("accordion.gdpr.rights.rightToRectification") },
              { text: t("accordion.gdpr.rights.rightToErasure") },
              { text: t("accordion.gdpr.rights.dataPortability") },
              { text: t("accordion.gdpr.rights.rightToObject") },
              { text: t("accordion.gdpr.rights.internationalTransfers") },
              { text: t("accordion.gdpr.rights.crossBorderTransfers") },
            ]}
          />
          <BodyP className="mt-4">{t("accordion.gdpr.gdprFooter")}</BodyP>
        </>
      ),
    },
    {
      id: "use",
      index: "03",
      title: t("accordion.use.title"),
      content: (
        <CheckList
          items={[
            { text: t("accordion.use.items.runScans") },
            { text: t("accordion.use.items.auth") },
            { text: t("accordion.use.items.limits") },
            { text: t("accordion.use.items.abuse") },
            { text: t("accordion.use.items.anonymized") },
            { text: t("accordion.use.items.alerts") },
            { text: t("accordion.use.items.sellData"), no: true },
            { text: t("accordion.use.items.commercial"), no: true },
          ]}
        />
      ),
    },
    {
      id: "scan",
      index: "04",
      title: t("accordion.scan.title"),
      content: (
        <>
          <BodyP>{t("accordion.scan.lead")}</BodyP>
          <Notice dark>{t("accordion.scan.notice")}</Notice>
          <BodyP className="mt-4">{t("accordion.scan.export")}</BodyP>
        </>
      ),
    },
    {
      id: "limits",
      index: "05",
      title: t("accordion.limits.title"),
      content: (
        <>
          <DataRow label={t("accordion.limits.items.dailyScans")} val={t("accordion.limits.items.dailyScansVal")} />
          <DataRow label={t("accordion.limits.items.maxScanDuration")} val={t("accordion.limits.items.maxScanDurationVal")} />
          <DataRow label={t("accordion.limits.items.concurrentScans")} val={t("accordion.limits.items.concurrentScansVal")} />
          <DataRow label={t("accordion.limits.items.targetScope")} val={t("accordion.limits.items.targetScopeVal")} />
          <DataRow label={t("accordion.limits.items.storage")} val={t("accordion.limits.items.storageVal")} />
          <DataRow label={t("accordion.limits.items.toolsAvailable")} val={t("accordion.limits.items.toolsAvailableVal")} last />
          <Notice>{t("accordion.limits.notice")}</Notice>
        </>
      ),
    },
    {
      id: "sharing",
      index: "06",
      title: t("accordion.sharing.title"),
      content: (
        <>
          <BodyP>{t("accordion.sharing.lead")}</BodyP>
          <div className="flex flex-wrap gap-2 my-4">
            {providers.map((provider) => (
              <Pill key={provider}>{provider}</Pill>
            ))}
          </div>
          <BodyP>{t("accordion.sharing.notice")}</BodyP>
        </>
      ),
    },
    {
      id: "retention",
      index: "07",
      title: t("accordion.retention.title"),
      content: (
        <>
          <DataRow label={t("accordion.retention.items.accountDeleted")} val={t("accordion.retention.items.accountDeletedVal")} />
          <DataRow label={t("accordion.retention.items.scanResults")} val={t("accordion.retention.items.scanResultsVal")} />
          <DataRow label={t("accordion.retention.items.backups")} val={t("accordion.retention.items.backupsVal")} />
          <DataRow label={t("accordion.retention.items.anonymizedAnalytics")} val={t("accordion.retention.items.anonymizedAnalyticsVal")} />
          <DataRow label={t("accordion.retention.items.securityLogs")} val={t("accordion.retention.items.securityLogsVal")} last />
          <Notice>{t("accordion.retention.notice")}</Notice>
        </>
      ),
    },
    {
      id: "rights",
      index: "08",
      title: t("accordion.rights.title"),
      content: (
        <CheckList
          items={[
            { text: t("accordion.rights.items.viewData") },
            { text: t("accordion.rights.items.editData") },
            { text: t("accordion.rights.items.exportData") },
            { text: t("accordion.rights.items.deleteAccount") },
            { text: t("accordion.rights.items.unsubscribe") },
            { text: t("accordion.rights.items.optOutAnalytics") },
            { text: t("accordion.rights.items.complaint") },
          ]}
        />
      ),
    },
    {
      id: "security",
      index: "09",
      title: t("accordion.security.title"),
      content: (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            <ItemCard label={t("accordion.security.items.inTransit")} val={t("accordion.security.items.inTransitVal")} />
            <ItemCard label={t("accordion.security.items.atRest")} val={t("accordion.security.items.atRestVal")} />
            <ItemCard label={t("accordion.security.items.access")} val={t("accordion.security.items.accessVal")} />
            <ItemCard label={t("accordion.security.items.monitoring")} val={t("accordion.security.items.monitoringVal")} />
          </div>
          <BodyP>{t("accordion.security.lead")}</BodyP>
        </>
      ),
    },
    {
      id: "contact",
      index: "10",
      title: t("accordion.contact.title"),
      content: (
        <>
          <BodyP>{t("accordion.contact.lead")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <ContactCard type={t("accordion.contact.privacy")} email={t("accordion.contact.privacyEmail")} note={t("accordion.contact.privacyNote")} />
            <ContactCard type={t("accordion.contact.dpo")} email={t("accordion.contact.dpoEmail")} note={t("accordion.contact.dpoNote")} />
            <ContactCard type={t("accordion.contact.security")} email={t("accordion.contact.securityEmail")} note={t("accordion.contact.securityNote")} />
          </div>
        </>
      ),
    },
  ];

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
            {t("sectionsLabel")}
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
          {t("footerLine1")}<br />{t("footerLine2")}
        </p>
      </footer>
    </>
  );
}
