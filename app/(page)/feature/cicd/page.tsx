"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ExternalLink, GitBranch, CheckCircle, AlertTriangle, Shield } from "lucide-react";

const pipelineSteps = [
  {
    num: "1",
    icon: "🔗",
    title: "Connect",
    desc: "Native OAuth integration with GitHub, GitLab, and Bitbucket cloud or on-prem.",
    active: false,
  },
  {
    num: "2",
    icon: "☁️",
    title: "Clone & Hash",
    desc: "Ephemeral cloning in sandbox containers. Every file is SHA-256 hashed for integrity tracking.",
    active: false,
  },
  {
    num: "3",
    icon: "🔍",
    title: "SonarScan",
    desc: "Deep SAST analysis powered by SonarQube engines, identifying patterns of OWASP Top 10.",
    active: true,
  },
  {
    num: "4",
    icon: "📡",
    title: "Signal",
    desc: "Instant feedback via Slack, Jira, or inline PR comments with remediation steps.",
    active: false,
  },
];

const githubYaml = `name: Security Scan
on: [push, pull_request]

jobs:
  guardian-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Auto-Offensive Scan
        uses: auto-offensive/scan@v1
        with:
          api_key: \${{ secrets.AUTO_OFFENSIVE_API_KEY }}`;

const gitlabYaml = `auto-offensive-scan:
  stage: security
  image: auto-offensive/scanner:latest
  script:
    - ao scan --full-depth
    - ao report --format sarif
  artifacts:
    reports:
      sast: ao-report.json
  only:
    - merge_requests
    - main`;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function CICDFeature() {
  const [activeTab, setActiveTab] = useState<"github" | "gitlab">("github");

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,188,161,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#00BCA1]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase bg-[#00BCA1]/10 text-[#00BCA1] border border-[#00BCA1]/20 rounded-full px-3 py-1.5 mb-6">
                <GitBranch className="w-3.5 h-3.5" />
                CI/CD Integration
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] dark:text-[#EDEDED] leading-tight mb-5">
                Repository<br />
                <span className="text-[#00BCA1]">Scanning.</span>
              </h1>

              <p className="text-[#5C5C5C] dark:text-[#9A9A9A] text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Integrate deep-code analysis directly into your SDLC. Detect vulnerabilities before they reach production.
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#00BCA1] hover:bg-[#00A390] text-white rounded-xl text-sm font-bold transition-colors">
                  <GitBranch className="w-4 h-4" />
                  Connect Repository
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 text-[#1A1A1A] dark:text-[#EDEDED] rounded-xl text-sm font-semibold hover:border-[#00BCA1] transition-colors">
                  View Docs <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div {...fadeUp(0.2)} className="relative">
              <div className="bg-white dark:bg-[#111113] rounded-2xl border border-black/9 dark:border-white/9 p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch className="w-5 h-5 text-[#1A1A1A] dark:text-[#EDEDED]" />
                  <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">auto-offensive/target-repo</span>
                  <span className="ml-auto text-xs px-2 py-1 rounded-full bg-[#00BCA1]/10 text-[#00BCA1]">Active</span>
                </div>
                <div className="space-y-3">
                  {[1,2,3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#F7F5F0] dark:bg-[#1A1A1A]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 2 ? 'bg-amber-500/20' : 'bg-[#00BCA1]/10'}`}>
                        {i === 2 ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle className="w-4 h-4 text-[#00BCA1]" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#1A1A1A] dark:text-[#EDEDED]">Security Scan</div>
                        <div className="text-xs text-[#9A9A9A]">{i === 2 ? '1 vulnerability found' : 'Passed'}</div>
                      </div>
                      <span className="text-xs text-[#9A9A9A]">{i === 1 ? '2m ago' : i === 2 ? 'Just now' : '5m ago'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Pipeline Steps ── */}
      <section className="py-16 border-t border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              The Analysis Pipeline
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
              Four steps from code commit to security intelligence
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.1)}
                whileHover={{ y: -4 }}
                className={`rounded-xl p-5 transition-all ${
                  step.active
                    ? "bg-gradient-to-br from-[#3B82F6] to-indigo-600 shadow-lg shadow-blue-500/20"
                    : "bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-4 ${
                  step.active ? "bg-white/15" : "bg-[#00BCA1]/10"
                }`}>
                  {step.icon}
                </div>
                <h3 className={`text-sm font-bold mb-2 ${step.active ? "text-white" : "text-[#1A1A1A] dark:text-[#EDEDED]"}`}>
                  {step.num}. {step.title}
                </h3>
                <p className={`text-xs leading-relaxed ${step.active ? "text-white/70" : "text-[#5C5C5C] dark:text-[#9A9A9A]"}`}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Vulnerability Finding ── */}
      <section className="py-16 bg-white dark:bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Code Panel */}
            <motion.div {...fadeUp(0)} className="bg-[#0D1117] rounded-xl border border-white/10 overflow-hidden font-mono text-xs">
              <div className="bg-[#161B22] px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#00BCA1]" />
                <span className="ml-2 text-slate-500 text-xs">AUTH_SERVICE.PY</span>
                <span className="ml-auto text-red-500 text-xs font-bold">SQL INJECTION</span>
              </div>
              <div className="p-5">
                <div className="text-slate-500 mb-1">def validate_user(user_input, password):</div>
                <div className="text-slate-300 mb-1 pl-4 text-cyan-400">
                  sql = &quot;SELECT * FROM users WHERE user = &apos;...&apos;&quot; [SQL INJECTION]
                </div>
                <div className="text-slate-300 mb-4 pl-4">cursor.execute(query)</div>
                <div className="text-slate-300 mb-4 pl-4">cursor.execute(query)</div>
                <div className="bg-[#00BCA1]/10 rounded px-3 py-3 border border-[#00BCA1]/20">
                  <div className="text-[10px] text-[#00BCA1] font-bold tracking-widest mb-2">REMEDIATION</div>
                  <div className="text-slate-300">query = &quot;SELECT * FROM users WHERE user = %s&quot;</div>
                  <div className="text-slate-300">cursor.execute(query, (user_input,))</div>
                </div>
              </div>
            </motion.div>

            {/* Finding Card */}
            <motion.div {...fadeUp(0.1)} className="bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🔴</span>
                <span className="text-xs font-black text-red-500 tracking-widest uppercase">Critical Flaw</span>
              </div>
              <p className="text-[#5C5C5C] dark:text-[#9A9A9A] text-sm leading-relaxed mb-5">
                SQL Injection: User input concatenated directly into SQL query. An attacker could bypass authentication.
              </p>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between py-2 border-b border-black/9 dark:border-white/9">
                  <span className="text-sm text-[#9A9A9A]">Confidence</span>
                  <span className="text-sm font-semibold text-[#00BCA1]">98% (High)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-black/9 dark:border-white/9">
                  <span className="text-sm text-[#9A9A9A]">CWE</span>
                  <span className="text-sm font-semibold text-blue-500">CWE-89</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-[#9A9A9A]">Fix Time</span>
                  <span className="text-sm font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">5 Minutes</span>
                </div>
              </div>
              <button className="w-full py-3 bg-[#00BCA1] hover:bg-[#00A390] text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Create Fix PR
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CI/CD Integration ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              CI/CD Integration Guide
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
              Deploy security scanning in seconds
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* YAML Panel */}
            <motion.div {...fadeUp(0)} className="bg-[#0D1117] rounded-xl border border-white/10 overflow-hidden">
              <div className="flex border-b border-white/10">
                {(["github", "gitlab"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
                      activeTab === tab
                        ? "bg-[#161B22] text-white border-[#00BCA1]"
                        : "text-slate-500 border-transparent hover:text-slate-300"
                    }`}
                  >
                    {tab === "github" ? "GitHub Actions" : "GitLab CI"}
                  </button>
                ))}
              </div>
              <pre className="p-5 m-0 text-xs text-slate-300 leading-relaxed overflow-x-auto font-mono">
                <code>{activeTab === "github" ? githubYaml : gitlabYaml}</code>
              </pre>
            </motion.div>

            {/* Features */}
            <motion.div {...fadeUp(0.1)} className="flex flex-col gap-5">
              {[
                { icon: "🛡️", title: "Shift Left Security", desc: "Block vulnerabilities before main branch" },
                { icon: "⚡", title: "Native Integration", desc: "Pre-configured YAML, copy-paste deploy" },
                { icon: "📋", title: "Full Audit Trail", desc: "Compliance-ready scan history" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-[#00BCA1]/10 flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-1">{item.title}</h3>
                    <p className="text-xs text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="relative rounded-2xl px-6 py-12 overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0f2940 100%)" }}>
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#00BCA1]/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#0077B6]/10 blur-3xl" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to secure your pipeline?
              </h2>
              <p className="text-[#9A9A9A] mb-8 max-w-md mx-auto">
                Start scanning your repositories in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-[#00BCA1] hover:bg-[#00A390] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors">
                  Get Started Free
                </button>
                <button className="border border-white/20 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors">
                  Schedule Demo
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}