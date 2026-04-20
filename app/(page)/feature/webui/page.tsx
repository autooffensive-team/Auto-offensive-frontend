"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const terminalLines = [
  { text: "$ guardian-ai scan start", color: "#e2e8f0", delay: 0 },
  { text: "[+] Initializing Subfinder...", color: "#10b981", delay: 0.4 },
  { text: "[+] Found 142 subdomains", color: "#10b981", delay: 0.8 },
  { text: "[+] Naabu: Port scanning active", color: "#10b981", delay: 1.2 },
  { text: "[-] CVE-2023-XXXX detected on dev.api...", color: "#f59e0b", delay: 1.6 },
];

const liveScanLines = [
  { time: "14:20:01", level: "INFO", text: "Loading configuration from cloud-vault...", color: "#94a3b8" },
  { time: "14:20:05", level: "SUBFINDER", text: "Enumerating targets for api.guardian.ai", color: "#10b981" },
  { time: "", level: "", text: "- dev.api.guardian.ai [Found]", color: "#10b981" },
  { time: "", level: "", text: "- staging.api.guardian.ai [Found]", color: "#10b981" },
  { time: "14:20:12", level: "NAABU", text: "Starting fast port scan on 12 targets", color: "#f59e0b" },
  { time: "", level: "", text: "- 10.0.4.12:443 [OPEN]", color: "#94a3b8" },
  { time: "", level: "", text: "- 10.0.4.12:80 [OPEN]", color: "#94a3b8" },
  { time: "", level: "", text: "- 10.0.4.15:22 [OPEN]", color: "#94a3b8" },
  { time: "14:20:45", level: "NUCLEI", text: "Template match: CVE-2023-XXXX on dev.api...", color: "#ef4444" },
];

const tools = [
  { name: "Subfinder", icon: "⚡", checked: true },
  { name: "Naabu", icon: "🔍", checked: true },
  { name: "Nuclei", icon: "🛡️", checked: false },
];

const steps = [
  {
    num: "1",
    title: "Target Input & Scope",
    desc: "Paste your root domains, IP ranges, or CIDR blocks. Guardian AI automatically validates ownership through integrated cloud connector APIs.",
  },
  {
    num: "2",
    title: "Tool Chain Selection",
    desc: "Choose from our curated library of top-tier offensive security tools. Enable 'Auto-Mode' to let our AI select the best tools based on the target's technology stack.",
  },
  {
    num: "3",
    title: "Autonomous Execution",
    desc: "The engine starts the sub-process chain. Data flows seamlessly from one tool to the next — Subfinder's output becomes Naabu's input automatically.",
  },
];

const benefits = [
  {
    icon: "⏱",
    title: "90% Faster Setup",
    desc: "Reduce scan configuration time from hours of scripting to seconds of toggling. Deploy complex reconnaissance pipelines instantly.",
  },
  {
    icon: "👥",
    title: "Democratized Security",
    desc: "Enable analysts of all skill levels to run professional-grade tests without deep CLI knowledge, freeing senior staff for high-level strategy.",
  },
  {
    icon: "⚙️",
    title: "Centralized Logic",
    desc: "Standardize your testing methodology across the entire organization. Ensure consistent tool flags and update versions globally with one click.",
  },
];

function TerminalHero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= terminalLines.length) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      className="relative rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-linear-to-br from-slate-900 via-slate-800 to-blue-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
    >
      {/* Window bar */}
      <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-amber-500" />
        <div className="w-3 h-3 rounded-full bg-emerald-500" />
        <span className="ml-2 text-xs text-slate-400 font-mono">guardian-ai terminal</span>
        <div className="ml-auto text-xs px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
          CONNECTED
        </div>
      </div>

      <div className="p-6 min-h-40 font-mono text-sm">
        {terminalLines.slice(0, visibleLines).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} style={{ color: line.color }} className="mb-1.5">
            {line.text}
          </motion.div>
        ))}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="inline-block w-2 h-3.5 bg-emerald-500"
        />
      </div>
    </motion.div>
  );
}

function LiveScanSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [checkedTools, setCheckedTools] = useState([true, true, false]);

  return (
    <section ref={ref} className="py-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-2"
        >
          <div className="w-8 h-0.5 bg-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-mono font-semibold tracking-widest uppercase">
            The Orchestration Engine
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mt-8">
          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-3 rounded-lg border border-emerald-500/15 bg-slate-900 dark:bg-slate-950 overflow-hidden font-mono text-xs"
          >
            <div className="bg-slate-800 dark:bg-slate-900 px-4 py-2.5 flex justify-between items-center border-b border-slate-700 dark:border-slate-800">
              <span className="text-slate-400">live_output_stream.sh</span>
              <span className="text-emerald-400 text-xs font-semibold tracking-widest">● ACTIVE SCAN</span>
            </div>
            <div className="p-5">
              {liveScanLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.4 + i * 0.12, duration: 0.3 }}
                  className="mb-1"
                  style={{ color: line.color }}
                >
                  {line.time && <span className="text-slate-500">[{line.time}] </span>}
                  {line.level && (
                    <span
                      className={
                        line.level === "SUBFINDER"
                          ? "text-emerald-400"
                          : line.level === "NAABU"
                          ? "text-amber-400"
                          : line.level === "NUCLEI"
                          ? "text-red-400"
                          : "text-slate-400"
                      }
                    >
                      {line.level}:{" "}
                    </span>
                  )}
                  <span>{line.text}</span>
                </motion.div>
              ))}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-0.5 bg-emerald-500"
              />
            </div>
          </motion.div>

          {/* Tool config */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Tool Configuration</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Select your automated stack. No syntax flags required.</p>
            {tools.map((tool, i) => (
              <div
                key={i}
                onClick={() => {
                  const next = [...checkedTools];
                  next[i] = !next[i];
                  setCheckedTools(next);
                }}
                className={`flex items-center justify-between p-3 rounded-lg mb-2.5 cursor-pointer border transition-all ${
                  checkedTools[i]
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                }`}
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {tool.icon} {tool.name}
                </span>
                <div
                  className={`w-5 h-5 border-2 rounded transition-all flex items-center justify-center ${
                    checkedTools[i]
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-slate-300 dark:border-slate-600 bg-transparent"
                  }`}
                >
                  {checkedTools[i] && <span className="text-white text-xs">✓</span>}
                </div>
              </div>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Update Live Scan
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 5 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black text-slate-900 dark:text-white leading-tight mb-4"
          >
            How it Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8"
          >
            The transition from manual terminal inputs to autonomous orchestration is handled by our Guardian Kernel.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 2 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-lg bg-slate-900 dark:bg-slate-900 border border-emerald-500/20 p-5"
          >
            <div className="text-amber-500 text-xs font-bold tracking-widest mb-2 font-mono">TECHNICAL NOTE</div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              &quot;Our backend translates your UI selections into optimized Go-binary commands, handling concurrency and resource management automatically.&quot;
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-3 flex flex-col gap-8 pt-1">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className="flex gap-5 items-start"
            >
              <div className="w-10 h-10 rounded-full border-2 border-slate-900 dark:border-slate-400 text-slate-900 dark:text-slate-400 flex items-center justify-center text-base font-bold shrink-0 ">
                {step.num}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 5 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-3xl font-black text-slate-900 dark:text-white text-center mb-12"
        >
          Engineered for Enterprise ROI
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -2, borderColor: "#10b981" }}
              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 transition-colors hover:border-emerald-500/40"
            >
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{b.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WebUIFeature() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen font-sans">
      {/* Hero */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-full px-3 py-1 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
                Auto-Offensive Suite
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl lg:text-7
      xl font-black text-slate-900 dark:text-white leading-tight mb-5"
            >
              Orchestrate Scans{" "}
              <span className="text-emerald-600 dark:text-emerald-400 block">Without the CLI.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-base text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-sm"
            >
              Guardian AI bridges the gap between powerful open-source security tools and enterprise-grade usability. Run Subfinder, Naabu, and Nuclei in a seamless, unified workflow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                Launch First Scan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Watch Demo
              </motion.button>
            </motion.div>
          </div>

          <TerminalHero />
        </div>
      </section>

      <LiveScanSection />
      <HowItWorksSection />
      <BenefitsSection />

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center rounded-3xl border border-emerald-500/20 bg-linear-to-br from-blue-900 to-slate-900 dark:from-slate-950 dark:to-slate-900 p-16 lg:p-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-linear(rgba(16,185,129,0.06)_1px,transparent_1px)] bg-position-[24px_24px] pointer-events-none" />
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 relative">
            Ready to automate your offensive posture?
          </h2>
          <p className="text-base text-slate-300 mb-8 relative max-w-2xl mx-auto">
            Enterprise-grade reconnaissance pipelines in seconds, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(16,185,129,0.5)" }}
              whileTap={{ scale: 0.96 }}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors"
            >
              Start Your Free Scan
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="px-7 py-3.5 border border-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              View Document
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
