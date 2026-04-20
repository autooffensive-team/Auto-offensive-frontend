"use client";

import { motion } from "framer-motion";
import { Brain, ArrowRight, ExternalLink } from "lucide-react";

const workflowSteps = [
  {
    num: "1",
    icon: "📥",
    title: "Findings Aggregation",
    desc: "Pull data from active scans, manual entries, and exports into unified environment.",
  },
  {
    num: "2",
    icon: "🧠",
    title: "AI Synthesis",
    desc: "LLMs analyze and correlate vulnerabilities to generate contextual risk narratives.",
  },
  {
    num: "3",
    icon: "📄",
    title: "Multi-Persona Output",
    desc: "Generate distinct versions for Executives, Engineers, and Developers.",
  },
];

const severityData = [
  { label: "Critical", count: 38, color: "#ef4444", pct: 31 },
  { label: "High", count: 52, color: "#f97316", pct: 42 },
  { label: "Medium", count: 34, color: "#3b82f6", pct: 27 },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export default function AIFeature() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] font-sans">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(rgba(0,188,161,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#00BCA1]/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase bg-[#00BCA1]/10 text-[#00BCA1] border border-[#00BCA1]/20 rounded-full px-3 py-1.5 mb-6">
                <Brain className="w-3.5 h-3.5" />
                AI-Powered Reporting
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A1A] dark:text-[#EDEDED] leading-tight mb-5">
                AI-Assisted<br />
                <span className="text-[#00BCA1]">Reporting.</span>
              </h1>

              <p className="text-[#5C5C5C] dark:text-[#9A9A9A] text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Transform raw vulnerability data into boardroom-ready intelligence. Our AI automates analysis, narrative, and remediation strategies.
              </p>

              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#00BCA1] hover:bg-[#00A390] text-white rounded-xl text-sm font-bold transition-colors">
                  Generate Report
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-3 bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 text-[#1A1A1A] dark:text-[#EDEDED] rounded-xl text-sm font-semibold hover:border-[#00BCA1] transition-colors">
                  View Demo <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div {...fadeUp(0.2)} className="relative">
              <div className="bg-white dark:bg-[#111113] rounded-2xl border border-black/9 dark:border-white/9 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#EDEDED]">Report Preview</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00BCA1]/10 text-[#00BCA1]">AI Generated</span>
                </div>
                
                {/* Severity Donut Chart */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="94.2 301.4" />
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#f97316" strokeWidth="16" strokeDasharray="126.6 301.4" strokeDashoffset="-94.2" />
                      <circle cx="64" cy="64" r="48" fill="none" stroke="#3b82f6" strokeWidth="16" strokeDasharray="80.8 301.4" strokeDashoffset="-220.8" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">124</span>
                      <span className="text-xs text-[#9A9A9A]">findings</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg p-3">
                    <div className="text-xs text-[#9A9A9A] mb-1">Critical</div>
                    <div className="text-xl font-bold text-red-500">38</div>
                  </div>
                  <div className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-lg p-3">
                    <div className="text-xs text-[#9A9A9A] mb-1">High</div>
                    <div className="text-xl font-bold text-orange-500">52</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              The Reporting Workflow
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
              Three steps from raw data to comprehensive documentation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.1)}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#00BCA1]/10 flex items-center justify-center text-2xl mb-4">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-2">
                  {step.num}. {step.title}
                </h3>
                <p className="text-sm text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Dashboard */}
      <section className="py-16 bg-white dark:bg-[#111113] border-y border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Severity Card */}
            <motion.div {...fadeUp(0)} className="bg-[#F7F5F0] dark:bg-[#1A1A1A] rounded-2xl p-6 border border-black/9 dark:border-white/9">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-[#1A1A1A] dark:text-[#EDEDED]">Severity Distribution</h3>
                <span className="text-xs bg-[#00BCA1]/10 text-[#00BCA1] px-2 py-1 rounded-full font-semibold">Real Time</span>
              </div>

              <div className="flex items-center gap-8 mb-6">
                <div className="relative w-28 h-28">
                  <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
                    {severityData.map((d, i) => {
                      const prev = severityData.slice(0, i).reduce((a, b) => a + b.pct, 0);
                      return (
                        <circle
                          key={i}
                          cx="56"
                          cy="56"
                          r="40"
                          fill="none"
                          stroke={d.color}
                          strokeWidth="14"
                          strokeDasharray={`${(d.pct / 100) * 251.2} 251.2`}
                          strokeDashoffset={`-${(prev / 100) * 251.2}`}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">124</span>
                    <span className="text-xs text-[#9A9A9A]">total</span>
                  </div>
                </div>

                <div>
                  {severityData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-sm text-[#5C5C5C] dark:text-[#9A9A9A]">{d.label} ({d.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/9 dark:border-white/9">
                <div>
                  <div className="text-xs text-[#9A9A9A] uppercase tracking-wider mb-1">Mean Time to Fix</div>
                  <div className="text-xl font-black text-[#1A1A1A] dark:text-[#EDEDED]">4.2 Days</div>
                </div>
                <div>
                  <div className="text-xs text-[#9A9A9A] uppercase tracking-wider mb-1">Exploitability</div>
                  <div className="text-lg font-black text-red-500">High Risk</div>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div {...fadeUp(0.1)}>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-4">
                Live Result Dashboard
              </h2>
              <p className="text-[#5C5C5C] dark:text-[#9A9A9A] leading-relaxed mb-6">
                Provide a living portal of security intelligence. Transform data into actionable insights through dynamic charts and trend analysis.
              </p>
              <div className="space-y-3">
                {[
                  { icon: "📊", text: "Interactive severity breakdowns" },
                  { icon: "🔗", text: "Secure, shareable live links" },
                  { icon: "📜", text: "Historical remediation tracking" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-[#5C5C5C] dark:text-[#9A9A9A]">{item.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI Edge */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-3">
              The AI Edge
            </h2>
            <p className="text-[#5C5C5C] dark:text-[#9A9A9A]">
              Intelligent features that set us apart
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: "⚡",
                title: "Automated Risk Explanation",
                desc: "AI cross-references findings with threat intelligence to explain why a vulnerability matters to your business.",
                dark: false,
              },
              {
                icon: "🔧",
                title: "Remediation Guidance",
                desc: "Personalized fix recommendations in your team's programming language.",
                dark: true,
              },
              {
                icon: "🔄",
                title: "Continuous Updates",
                desc: "Reports evolve as you fix vulnerabilities. Information is always current.",
                dark: false,
              },
              {
                icon: "🗺️",
                title: "Compliance Mapping",
                desc: "Automatic mapping to SOC2, HIPAA, and ISO 27001 controls.",
                dark: false,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp(0.1 + i * 0.1)}
                whileHover={{ y: -2 }}
                className={`rounded-xl p-6 border transition-all ${
                  item.dark
                    ? "bg-[#0D1117] border-white/10"
                    : "bg-white dark:bg-[#111113] border-black/9 dark:border-white/9"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{item.icon}</span>
                  <h3 className={`text-base font-bold ${item.dark ? "text-white" : "text-[#1A1A1A] dark:text-[#EDEDED]"}`}>
                    {item.title}
                  </h3>
                </div>
                <p className={`text-sm leading-relaxed ${item.dark ? "text-slate-400" : "text-[#5C5C5C] dark:text-[#9A9A9A]"}`}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp(0)} className="relative rounded-2xl px-6 py-12 overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1B2A 0%, #0f2940 100%)" }}>
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#00BCA1]/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#0077B6]/10 blur-3xl" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Stop writing reports. Start securing.
              </h2>
              <p className="text-[#9A9A9A] mb-8 max-w-md mx-auto">
                Join security teams who have automated their reporting workflows.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-[#00BCA1] hover:bg-[#00A390] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors">
                  Try It Free
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