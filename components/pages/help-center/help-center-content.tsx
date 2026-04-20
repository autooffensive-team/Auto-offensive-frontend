"use client";

import { useState } from "react";
import { Search, ChevronRight, BookOpen, Shield, Zap, Users, CreditCard, Mail } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const categories = [
  { id: "getting-started", label: "Getting Started", icon: BookOpen },
  { id: "account", label: "Account & Security", icon: Shield },
  { id: "scanning", label: "Scanning & Tools", icon: Zap },
  { id: "team", label: "Team Collaboration", icon: Users },
  { id: "billing", label: "Billing & Plans", icon: CreditCard },
  { id: "contact", label: "Contact Us", icon: Mail },
];

const faqItems: FAQItem[] = [
  {
    id: "what-is",
    question: "What is Auto Offensive?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Auto Offensive is a <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">next-generation penetration testing platform</strong> designed for security professionals, ethical hackers, and organizations.</p>
        <p>Our platform provides automated security workflows, vulnerability scanning, and comprehensive reporting tools to identify and address security weaknesses in your systems.</p>
      </div>
    ),
  },
  {
    id: "who-for",
    question: "Who can use Auto Offensive?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Auto Offensive is designed for:</p>
        <ul className="list-none space-y-2">
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Security professionals and penetration testers</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> DevSecOps teams integrating security into CI/CD</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Organizations conducting authorized security assessments</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Security researchers and bug bounty hunters</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Students learning ethical hacking and cybersecurity</li>
        </ul>
      </div>
    ),
  },
  {
    id: "how-start",
    question: "How do I get started?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <ol className="list-decimal list-inside space-y-3">
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Sign up</strong> — Create a free account with your email</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Verify</strong> — Confirm your email address</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Configure</strong> — Set up your first scan target</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Scan</strong> — Run your first vulnerability assessment</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Review</strong> — Analyze findings in your dashboard</li>
        </ol>
        <p className="mt-4">New users get <strong className="text-[#00BCA1]">3 free scans per day</strong> to test the platform.</p>
      </div>
    ),
  },
  {
    id: "legal-scanning",
    question: "Is penetration testing legal?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Penetration testing is legal when you have <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">explicit authorization</strong> to test target systems.</p>
        <div className="border-l-[3px] border-amber-500 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 rounded-r-lg">
          <p className="text-amber-800 dark:text-amber-200"><strong className="text-amber-600 dark:text-amber-400">Important:</strong> Always obtain written permission before testing systems you don't own. Unauthorized access is illegal and may result in criminal charges.</p>
        </div>
        <p className="mt-4">For owned systems, internal security testing is generally permitted. Check your local laws and organizational policies.</p>
      </div>
    ),
  },
  {
    id: "free-tier",
    question: "What's included in the free tier?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Our free tier includes:</p>
        <ul className="space-y-2 mb-4">
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> 3 scans per day</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> 30-minute max scan duration</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Single domain per scan</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> 100 GB scan history storage</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Access to all 14+ security tools</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> JSON, CSV, PDF export</li>
        </ul>
        <p>Perfect for learning, personal projects, and small-scale testing.</p>
      </div>
    ),
  },
  {
    id: "tools-available",
    question: "What security tools are available?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Auto Offensive integrates <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">14+ industry-standard tools</strong>:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["Nmap — Network scanning", "Nikto — Web vulnerability", "SQLmap — SQL injection", "Burp Suite — Web testing", "OWASP ZAP — App scanning", "Amass — Subdomain enum", "Dirb — Directory brute", "Gobuster — Fuzzing", "Hydra — Password cracking", "Metasploit — Exploitation", " Nessus compatibility", "OpenVAS integration"].map((tool) => (
            <div key={tool} className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded px-3 py-2 text-[#1A1A1A] dark:text-[#EDEDED]">
              {tool}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "api-access",
    question: "Is there API access?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Yes! Auto Offensive provides a <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">RESTful API</strong> for programmatic access:</p>
        <ul className="space-y-2 mb-4">
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Start/stop scans programmatically</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Retrieve scan results</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Manage targets and schedules</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Integrate with CI/CD pipelines</li>
        </ul>
        <p>API rate limits: <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">100 requests/minute</strong> (free tier), higher for enterprise.</p>
      </div>
    ),
  },
  {
    id: "data-security",
    question: "How is my data secured?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">We take security seriously:</p>
        <ul className="space-y-3">
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">In Transit:</strong> TLS 256-bit encryption on all connections</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">At Rest:</strong> AES-256 encryption for sensitive data</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Passwords:</strong> Bcrypt hashed with salt</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Access:</strong> Role-based controls, MFA available</li>
          <li><strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Monitoring:</strong> 24/7 intrusion detection, WAF, DDoS protection</li>
        </ul>
        <p className="mt-4">Each account is <strong className="text-[#00BCA1]">fully isolated</strong> at the database level.</p>
      </div>
    ),
  },
  {
    id: "team-collab",
    question: "Can I collaborate with my team?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Yes! Our <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">team collaboration features</strong> include:</p>
        <ul className="space-y-2 mb-4">
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Shared project workspaces</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Role-based access control (Admin, Editor, Viewer)</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Real-time scan activity</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Team activity logs</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Collaborative report editing</li>
        </ul>
        <p>Enterprise plans include unlimited team members.</p>
      </div>
    ),
  },
  {
    id: "export-data",
    question: "Can I export my scan data?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">Absolutely! You own your data. Export options include:</p>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4 text-center">
            <div className="text-[24px] font-bold text-[#00BCA1] mb-1">JSON</div>
            <div className="text-[14px] text-[#9A9A9A]">Machine readable</div>
          </div>
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4 text-center">
            <div className="text-[24px] font-bold text-[#00BCA1] mb-1">CSV</div>
            <div className="text-[14px] text-[#9A9A9A]">Spreadsheet friendly</div>
          </div>
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4 text-center">
            <div className="text-[24px] font-bold text-[#00BCA1] mb-1">PDF</div>
            <div className="text-[14px] text-[#9A9A9A]">Client reports</div>
          </div>
        </div>
        <p>Export from your dashboard at any time.</p>
      </div>
    ),
  },
  {
    id: "upgrade-plan",
    question: "How do I upgrade my plan?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">To upgrade to <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">Pro or Enterprise</strong>:</p>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Go to <strong className="text-[#00BCA1]">Settings → Billing</strong></li>
          <li>Select your plan (Pro or Enterprise)</li>
          <li>Add your payment method</li>
          <li>Confirm and start using premium features</li>
        </ol>
        <p>Enterprise plans include custom quotas, dedicated support, and SLA guarantees. Contact <strong className="text-[#00BCA1]">sales@auto-offensive.com</strong></p>
      </div>
    ),
  },
  {
    id: "refund-policy",
    question: "What is your refund policy?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p>We offer a <strong className="text-[#1A1A1A] dark:text-[#EDEDED]">14-day money-back guarantee</strong> for Pro plans.</p>
        <p className="mt-4">If you're not satisfied, contact <strong className="text-[#00BCA1]">support@auto-offensive.com</strong> within 14 days of purchase for a full refund.</p>
        <p className="mt-4">Enterprise contracts follow custom terms outlined in your agreement.</p>
      </div>
    ),
  },
  {
    id: "report-bug",
    question: "How do I report a bug or vulnerability?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">We take security seriously. Report platform vulnerabilities responsibly:</p>
        <div className="bg-[#111113] dark:bg-[#1A1A1A] border border-black/[0.14] dark:border-white/[0.14] rounded p-4 mb-4">
          <div className="text-[20px] text-[#00BCA1] font-medium">security@auto-offensive.com</div>
          <div className="text-[16px] text-[#9A9A9A] mt-1">Response within 24 hours</div>
        </div>
        <p>Please include:</p>
        <ul className="space-y-1 mt-2">
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Description of the vulnerability</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Steps to reproduce</li>
          <li className="flex gap-2"><span className="text-[#00BCA1]">→</span> Potential impact assessment</li>
        </ul>
      </div>
    ),
  },
  {
    id: "get-support",
    question: "How can I get support?",
    answer: (
      <div className="text-[20px] leading-[1.9] text-[#5C5C5C] dark:text-[#9A9A9A]">
        <p className="mb-4">We're here to help! Reach out through:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4">
            <div className="text-[16px] text-[#00BCA1] font-medium mb-2">Email Support</div>
            <div className="text-[14px]">support@auto-offensive.com</div>
            <div className="text-[12px] text-[#9A9A9A] mt-1">24-48 hour response</div>
          </div>
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4">
            <div className="text-[16px] text-[#00BCA1] font-medium mb-2">Documentation</div>
            <div className="text-[14px]">docs.auto-offensive.com</div>
            <div className="text-[12px] text-[#9A9A9A] mt-1">24/7 access</div>
          </div>
          <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4">
            <div className="text-[16px] text-[#00BCA1] font-medium mb-2">Community</div>
            <div className="text-[14px]">discord.gg/auto-offensive</div>
            <div className="text-[12px] text-[#9A9A9A] mt-1">Live discussion</div>
          </div>
        </div>
      </div>
    ),
  },
];

function FAQAccordion({ searchQuery }: { searchQuery: string }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-0">
      {filteredFAQs.map((item) => (
        <div key={item.id} className="border-t border-black/[0.14] dark:border-white/[0.14]">
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full bg-transparent border-none cursor-pointer py-5 md:py-7 text-left flex items-center justify-between gap-4"
          >
            <span className="text-base md:text-[1.1rem] font-semibold tracking-[-0.01em] text-[#1A1A1A] dark:text-[#EDEDED]">
              {item.question}
            </span>
            <span
              className={`w-8 h-8 border rounded-full flex items-center justify-center text-xl leading-none shrink-0 transition-all duration-300 ${
                openId === item.id
                  ? "bg-[#00BCA1] border-[#00BCA1] text-white rotate-45"
                  : "border-black/[0.14] dark:border-white/[0.14] text-[#5C5C5C] dark:text-[#9A9A9A]"
              }`}
            >
              +
            </span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openId === item.id ? "block pb-9" : "hidden"}`}>
            {item.answer}
          </div>
        </div>
      ))}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">No matching FAQs found. Try a different search term.</p>
        </div>
      )}
    </div>
  );
}

export default function HelpCenterContent() {
  const [activeCategory, setActiveCategory] = useState<string>("getting-started");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="max-w-7xl mx-auto" style={{ padding: "clamp(40px,6vw,72px) clamp(24px,6vw,80px)" }}>
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9A9A]" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded-lg text-[#1A1A1A] dark:text-[#EDEDED] placeholder:text-[#9A9A9A] text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#00BCA1] text-white"
                    : "bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] text-[#5C5C5C] dark:text-[#9A9A9A] hover:border-[#00BCA1]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded-xl p-6 md:p-10">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-[#9A9A9A] mb-8 font-sans">Frequently Asked Questions</h2>
          <FAQAccordion searchQuery={searchQuery} />
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-[#5C5C5C] dark:text-[#9A9A9A] mb-4">Can't find what you're looking for?</p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact-us" className="flex items-center gap-2 px-6 py-3 bg-[#00BCA1] text-white rounded-lg font-medium hover:bg-[#00A390] transition-colors">
              Contact Us <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/docs" className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] text-[#1A1A1A] dark:text-[#EDEDED] rounded-lg font-medium hover:border-[#00BCA1] transition-colors">
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}