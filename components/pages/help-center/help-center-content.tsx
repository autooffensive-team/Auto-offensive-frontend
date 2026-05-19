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
        <span className={`shrink-0 mt-px ${item.no ? "text-[#9A9A9A]" : "text-[#00BCA1]"}`}>
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

const ItemCard = ({ label, val }: { label: string; val: string }) => (
  <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4">
    <div className="text-[11px] tracking-[0.14em] uppercase text-[#9A9A9A] mb-2 font-sans">{label}</div>
    <div className="text-[20px] text-[#1A1A1A] dark:text-[#EDEDED] leading-[1.6]">{val}</div>
  </div>
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
    <div className="text-[11px] tracking-[0.16em] uppercase text-[#9A9A9A] mb-2.5 font-sans">{type}</div>
    <div className="text-[20px] text-[#00BCA1] mb-1.5 break-all font-medium">{email}</div>
    <div className="text-[20px] text-[#9A9A9A]">{note}</div>
  </div>
);

/* ─── Main Export ────────────────────────────── */
export default function HelpCenterContent() {
  const t = useTranslations("helpCenterPage");
  const [openId, setOpenId] = useState<string>("what-is");
  const [activeNav, setActiveNav] = useState<string>("what-is");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const accordionItems: AccordionItem[] = [
    {
      id: "what-is",
      index: "01",
      title: t("faq.whatIs.question"),
      content: (
        <>
          <BodyP>{t("faq.whatIs.p1")}</BodyP>
          <BodyP>{t("faq.whatIs.p2")}</BodyP>
        </>
      ),
    },
    {
      id: "who-for",
      index: "02",
      title: t("faq.whoFor.question"),
      content: (
        <>
          <BodyP>{t("faq.whoFor.intro")}</BodyP>
          <CheckList
            items={Array.from({ length: 5 }, (_, i) => ({
              text: t(`faq.whoFor.items.${i}`),
            }))}
          />
        </>
      ),
    },
    {
      id: "how-start",
      index: "03",
      title: t("faq.howStart.question"),
      content: (
        <>
          <CheckList
            items={Array.from({ length: 5 }, (_, i) => ({
              text: t(`faq.howStart.steps.${i}`),
            }))}
          />
          <Notice>{t("faq.howStart.note")}</Notice>
        </>
      ),
    },
    {
      id: "legal-scanning",
      index: "04",
      title: t("faq.legalScanning.question"),
      content: (
        <>
          <BodyP>{t("faq.legalScanning.p1")}</BodyP>
          <Warning>
            <p className="text-amber-800 dark:text-amber-200">{t("faq.legalScanning.warning")}</p>
          </Warning>
          <BodyP>{t("faq.legalScanning.p2")}</BodyP>
        </>
      ),
    },
    {
      id: "free-tier",
      index: "05",
      title: t("faq.freeTier.question"),
      content: (
        <>
          <BodyP>{t("faq.freeTier.intro")}</BodyP>
          <DataRow label="Daily scans" val="3 scans / day" />
          <DataRow label="Max scan duration" val="30 minutes" />
          <DataRow label="Concurrent scans" val="1 at a time" />
          <DataRow label="Target scope" val="Single domain per scan" />
          <DataRow label="Storage" val="100 GB scan history" />
          <DataRow label="Tools available" val="All 14+ tools" last />
          <BodyP className="mt-4">{t("faq.freeTier.outro")}</BodyP>
        </>
      ),
    },
    {
      id: "tools-available",
      index: "06",
      title: t("faq.toolsAvailable.question"),
      content: (
        <>
          <BodyP>{t("faq.toolsAvailable.intro")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            {Array.from({ length: 12 }, (_, i) => (
              <ItemCard key={i} label={`Tool ${String(i + 1).padStart(2, "0")}`} val={t(`faq.toolsAvailable.items.${i}`)} />
            ))}
          </div>
        </>
      ),
    },
    {
      id: "api-access",
      index: "07",
      title: t("faq.apiAccess.question"),
      content: (
        <>
          <BodyP>{t("faq.apiAccess.intro")}</BodyP>
          <CheckList
            items={Array.from({ length: 4 }, (_, i) => ({
              text: t(`faq.apiAccess.items.${i}`),
            }))}
          />
          <BodyP className="mt-4">{t("faq.apiAccess.outro")}</BodyP>
        </>
      ),
    },
    {
      id: "data-security",
      index: "08",
      title: t("faq.dataSecurity.question"),
      content: (
        <>
          <BodyP>{t("faq.dataSecurity.intro")}</BodyP>
          <CheckList
            items={Array.from({ length: 5 }, (_, i) => ({
              text: t(`faq.dataSecurity.items.${i}`),
            }))}
          />
          <Notice>{t("faq.dataSecurity.outro")}</Notice>
        </>
      ),
    },
    {
      id: "team-collab",
      index: "09",
      title: t("faq.teamCollab.question"),
      content: (
        <>
          <BodyP>{t("faq.teamCollab.intro")}</BodyP>
          <CheckList
            items={Array.from({ length: 5 }, (_, i) => ({
              text: t(`faq.teamCollab.items.${i}`),
            }))}
          />
          <BodyP className="mt-4">{t("faq.teamCollab.outro")}</BodyP>
        </>
      ),
    },
    {
      id: "export-data",
      index: "10",
      title: t("faq.exportData.question"),
      content: (
        <>
          <BodyP>{t("faq.exportData.intro")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
            {["JSON", "CSV", "PDF"].map((format, i) => (
              <ItemCard key={format} label={format} val={t(`faq.exportData.formats.${i}`)} />
            ))}
          </div>
          <BodyP>{t("faq.exportData.outro")}</BodyP>
        </>
      ),
    },
    {
      id: "upgrade-plan",
      index: "11",
      title: t("faq.upgradePlan.question"),
      content: (
        <>
          <BodyP>{t("faq.upgradePlan.intro")}</BodyP>
          <CheckList
            items={Array.from({ length: 4 }, (_, i) => ({
              text: t(`faq.upgradePlan.steps.${i}`),
            }))}
          />
          <BodyP className="mt-4">{t("faq.upgradePlan.outro")}</BodyP>
        </>
      ),
    },
    {
      id: "refund-policy",
      index: "12",
      title: t("faq.refundPolicy.question"),
      content: (
        <>
          <BodyP>{t("faq.refundPolicy.p1")}</BodyP>
          <BodyP>{t("faq.refundPolicy.p2")}</BodyP>
          <BodyP>{t("faq.refundPolicy.p3")}</BodyP>
        </>
      ),
    },
    {
      id: "report-bug",
      index: "13",
      title: t("faq.reportBug.question"),
      content: (
        <>
          <BodyP>{t("faq.reportBug.intro")}</BodyP>
          <ContactCard
            type="Security"
            email="security@auto-offensive.com"
            note={t("faq.reportBug.response")}
          />
          <BodyP className="mt-4">{t("faq.reportBug.include")}</BodyP>
          <CheckList
            items={Array.from({ length: 3 }, (_, i) => ({
              text: t(`faq.reportBug.items.${i}`),
            }))}
          />
        </>
      ),
    },
    {
      id: "get-support",
      index: "14",
      title: t("faq.getSupport.question"),
      content: (
        <>
          <BodyP>{t("faq.getSupport.intro")}</BodyP>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 3 }, (_, i) => (
              <ContactCard
                key={i}
                type={t(`faq.getSupport.cards.${i}.title`)}
                email={t(`faq.getSupport.cards.${i}.value`)}
                note={t(`faq.getSupport.cards.${i}.meta`)}
              />
            ))}
          </div>
        </>
      ),
    },
  ];

  const navItems = accordionItems.map((item) => ({ href: item.id, label: item.title }));

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
          Help Center · Auto-Offensive<br />Free Platform · Open Source Friendly
        </p>
      </footer>
    </>
  );
}
