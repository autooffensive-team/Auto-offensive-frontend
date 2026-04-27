"use client";

import Sidebar from "@/components/Sidebar";
import { useLocale } from "next-intl";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  FileJson,
  ShieldAlert,
  WandSparkles,
} from "lucide-react";

type SuggestionMode = "analysis" | "next_steps" | "report";

type SuggestionMock = {
  label: string;
  badge: string;
  provider: string;
  model: string;
  tokens: {
    input: number;
    output: number;
  };
  title: string;
  body: string;
  bullets: string[];
  output: Record<string, unknown>;
};

const modes: Array<{ value: SuggestionMode; label: string; helper: string }> = [
  {
    value: "analysis",
    label: "Analysis",
    helper: "Explain the strongest risk patterns from scan evidence.",
  },
  {
    value: "next_steps",
    label: "Next Steps",
    helper: "Turn findings into prioritized remediation actions.",
  },
  {
    value: "report",
    label: "Report",
    helper: "Create a compact stakeholder-ready security summary.",
  },
];

const mockSuggestions: Record<SuggestionMode, SuggestionMock> = {
  analysis: {
    label: "Analysis",
    badge: "Evidence-based",
    provider: "Gemini",
    model: "gemini-2.0-flash",
    tokens: { input: 842, output: 219 },
    title: "Primary exposure centers on a public API host with layered access risk.",
    body:
      "The scan suggests the most meaningful security concern is the combination of an outdated web-facing service and an exposed administrative surface on the same target. Even without a confirmed exploit chain, this pattern raises the likelihood of opportunistic probing and gives attackers two very different paths to test: an internet-facing application service and a reachable SSH entry point.",
    bullets: [
      "Outdated fingerprint on port 443 raises patching urgency.",
      "SSH exposure increases brute-force and credential replay risk.",
      "The findings matter more together than in isolation because they widen the attack surface on one host.",
    ],
    output: {
      summary: "A concentrated external attack surface exists on api.mock.internal.",
      highlights: [
        "Public HTTPS service appears outdated.",
        "SSH is internet reachable.",
        "The host likely needs exposure reduction and patch validation.",
      ],
    },
  },
  next_steps: {
    label: "Next Steps",
    badge: "Action-first",
    provider: "Groq",
    model: "llama-3.3-70b-versatile",
    tokens: { input: 611, output: 168 },
    title: "Start with exposure reduction, then verify service patching.",
    body:
      "The fastest risk reduction comes from limiting administrative access before making deeper application changes. Once SSH is restricted, validate the exact web-service version behind port 443, patch or upgrade it, and re-run the scan to confirm both findings disappear.",
    bullets: [
      "Restrict SSH to trusted admin networks only.",
      "Verify and patch the public HTTPS component on port 443.",
      "Re-scan after remediation to confirm the attack surface is reduced.",
    ],
    output: {
      steps: [
        "Restrict public access to SSH on api.mock.internal:22.",
        "Confirm the exact component version on api.mock.internal:443 and patch it.",
        "Review firewall rules and remove unnecessary inbound exposure.",
      ],
    },
  },
  report: {
    label: "Report",
    badge: "Stakeholder-ready",
    provider: "Anthropic",
    model: "claude-sonnet-4-20250514",
    tokens: { input: 703, output: 190 },
    title: "The scan found moderate-to-high operational exposure on a public API host.",
    body:
      "Executive summary: api.mock.internal presents an avoidable internet-facing attack surface. The most notable issues are an outdated public web service and exposed SSH access. Recommended follow-up: restrict administrative access, verify and patch the web-facing component, and validate the reduced exposure with a fresh scan.",
    bullets: [
      "One host contains both application-layer and administrative exposure.",
      "The findings indicate elevated reconnaissance and compromise opportunity.",
      "Remediation should focus on access control and patch validation first.",
    ],
    output: {
      report: "api.mock.internal shows externally reachable services that increase attack opportunity. Restrict SSH, patch the public web service, and revalidate the host after remediation.",
    },
  },
};

const findings = [
  {
    severity: "High",
    title: "Outdated web service fingerprint detected",
    location: "api.mock.internal:443",
  },
  {
    severity: "Medium",
    title: "SSH exposed to the internet",
    location: "api.mock.internal:22",
  },
];

function severityClass(severity: string) {
  if (severity === "High") return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200";
  if (severity === "Medium") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200";
  return "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200";
}

export default function AISuggestionPage() {
  const locale = useLocale();
  const isKhmer = locale === "kh";
  const bodyFontFamily = isKhmer
    ? "var(--font-noto-khmer), var(--font-google-sans), sans-serif"
    : "var(--font-google-sans), var(--font-noto-khmer), sans-serif";

  const [jobId, setJobId] = useState("e6eeb9a1-6c51-4bbb-95aa-97d9f74382d6");
  const [mode, setMode] = useState<SuggestionMode>("analysis");
  const [hasGenerated, setHasGenerated] = useState(true);
  const [lastGeneratedAt, setLastGeneratedAt] = useState("just now");

  const selectedMode = modes.find((entry) => entry.value === mode) ?? modes[0];
  const selectedSuggestion = mockSuggestions[mode];
  const requestBody = JSON.stringify({ job_id: jobId, mode }, null, 2);
  const responseBody = JSON.stringify(selectedSuggestion.output, null, 2);

  const handleGenerate = () => {
    setHasGenerated(true);
    setLastGeneratedAt(new Date().toLocaleTimeString());
  };

  return (
    <div
      className="flex min-h-screen bg-white text-gray-900 transition-colors dark:bg-black dark:text-white"
      style={{ fontFamily: bodyFontFamily }}
    >
      <aside className="hidden w-64 border-r border-gray-200 dark:border-gray-900 md:block">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">
          <section className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
            <div className="space-y-6 rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
                    Request Builder
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">Prepare the AI suggestion call</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-200">
                  <CheckCircle2 size={14} />
                  /ai-suggestions/generate
                </div>
              </div>

              <label className="space-y-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scan Job ID</span>
                <input
                  value={jobId}
                  onChange={(event) => setJobId(event.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-400 focus:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus:border-teal-500"
                  placeholder="Enter scan job UUID"
                />
              </label>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggestion Mode</p>
                <div className="grid gap-3">
                  {modes.map((entry) => {
                    const active = entry.value === mode;
                    return (
                      <button
                        key={entry.value}
                        type="button"
                        onClick={() => setMode(entry.value)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-teal-400 bg-teal-50 shadow-sm dark:border-teal-500 dark:bg-teal-500/10"
                            : "border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-teal-500/40 dark:hover:bg-teal-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-base font-semibold">{entry.label}</span>
                          {active ? <WandSparkles size={16} className="text-teal-600 dark:text-teal-300" /> : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{entry.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-gray-300">
                  <span className="inline-flex items-center gap-2">
                    <FileJson size={16} />
                    Request Body
                  </span>
                  <span>{selectedMode.label}</span>
                </div>
                <pre className="overflow-x-auto p-4 text-sm leading-7 text-teal-100">{requestBody}</pre>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-500/25 transition hover:scale-[1.01]"
              >
                Generate {selectedMode.label}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="space-y-6 rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
                    Suggestion Output
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedSuggestion.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                    {selectedSuggestion.body}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    {selectedSuggestion.provider}
                  </span>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 dark:bg-teal-500/15 dark:text-teal-200">
                    {selectedSuggestion.model}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                    {selectedSuggestion.badge}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Input tokens</p>
                  <p className="mt-2 text-2xl font-semibold">{selectedSuggestion.tokens.input}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Output tokens</p>
                  <p className="mt-2 text-2xl font-semibold">{selectedSuggestion.tokens.output}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last generated</p>
                  <p className="mt-2 text-2xl font-semibold">{hasGenerated ? lastGeneratedAt : "Not yet"}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <BrainCircuit size={16} />
                    Narrative Response
                  </div>
                  <div className="mt-4 space-y-4">
                    {selectedSuggestion.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <Bot size={16} />
                    Backend Flow
                  </div>
                  <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    <p>1. FastAPI receives the public request and forwards it to Go by gRPC.</p>
                    <p>2. Go loads scan job, findings, target, and scan results.</p>
                    <p>3. FastAPI internal AI route builds the prompt and calls the provider.</p>
                    <p>4. Go stores the final suggestion in <code className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">ai_suggestions</code>.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <ShieldAlert size={16} />
                    Source Findings
                  </div>
                  <div className="mt-4 space-y-3">
                    {findings.map((finding) => (
                      <div
                        key={finding.title}
                        className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{finding.title}</p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityClass(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{finding.location}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gray-950 text-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-sm text-gray-300">
                    <span className="inline-flex items-center gap-2">
                      <FileJson size={16} />
                      output_json Preview
                    </span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{selectedMode.label}</span>
                  </div>
                  <pre className="overflow-x-auto p-4 text-sm leading-7 text-cyan-100">{responseBody}</pre>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
