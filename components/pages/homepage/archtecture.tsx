'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { Brain, Cpu, Database, Globe, Server, Shield, Zap } from 'lucide-react'

type NodeTone = 'primary' | 'secondary'

interface ArchitectureNodeProps {
  icon: ReactNode
  label: string
  sub: string
  tone: NodeTone
  className: string
  delay?: number
  bodyFontFamily: string
  displayFontFamily: string
}

interface TracePathProps {
  d: string
  tone: NodeTone
  delay?: number
}

interface SceneDotProps {
  className: string
  dark?: boolean
  side?: 'left' | 'right'
}

const toneClasses = {
  primary: {
    wrapper:
      'border-[rgba(0,208,178,0.34)] bg-[#F7F5F0] dark:bg-[#09090B]',
    iconWrap: 'border-[rgba(0,208,178,0.34)] bg-[rgba(0,208,178,0.06)] dark:bg-[rgba(0,208,178,0.08)]',
    icon: 'text-[#00d0b2]',
  },
  secondary: {
    wrapper:
      'border-[rgba(1,80,158,0.28)] bg-[#F7F5F0] dark:bg-[#09090B]',
    iconWrap: 'border-[rgba(1,80,158,0.3)] bg-[rgba(1,80,158,0.05)] dark:bg-[rgba(1,80,158,0.08)]',
    icon: 'text-[#01509e] dark:text-[#4fa3e5]',
  },
} satisfies Record<NodeTone, Record<string, string>>

function TracePath({ d, tone, delay = 0 }: TracePathProps) {
  const flowClass =
    tone === 'primary'
      ? 'stroke-[#00d0b2] text-[#00d0b2]'
      : 'stroke-[#01509e] text-[#01509e] dark:stroke-[#4fa3e5] dark:text-[#4fa3e5]'

  return (
    <>
      <path
        d={d}
        className="fill-none stroke-2 stroke-linecap-round stroke-linejoin-round stroke-[rgba(1,80,158,0.18)] dark:stroke-white/16"
      />
      <motion.path
        d={d}
        initial={{ strokeDashoffset: 464 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{
          duration: 3.1,
          delay,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.5, 0, 0.9, 1],
          repeatDelay: 0,
        }}
        className={`fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round [stroke-dasharray:44_420] ${flowClass}`}
      />
    </>
  )
}

function SceneDot({ className, dark = true, side }: SceneDotProps) {
  return (
    <span
      className={`absolute z-40 h-3.5 w-3.5 -translate-y-1/2 rounded-full border ${
        dark
          ? 'border-slate-200 bg-[#0f172a] dark:border-slate-700 dark:bg-slate-100'
          : 'border-[rgba(255,255,255,0.7)] bg-slate-200/95 dark:border-slate-500 dark:bg-slate-300/90'
      } ${
        side === 'right'
          ? 'translate-x-26.25'
          : side === 'left'
            ? '-translate-x-28.75'
            : '-translate-x-1/2'
      } ${className}`}
      aria-hidden="true"
    />
  )
}

function ArchitectureNode({
  icon,
  label,
  sub,
  tone,
  className,
  delay = 0,
  bodyFontFamily,
  displayFontFamily,
}: ArchitectureNodeProps) {
  const palette = toneClasses[tone]

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -6 }}
      className={`absolute z-20 w-45.5 rounded-[22px] border p-4 ${palette.wrapper} ${className}`}
    >
      <div
        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${palette.iconWrap}`}
      >
        <div className={palette.icon}>{icon}</div>
      </div>

      <p
        className="mb-1 text-[0.95rem] font-bold leading-tight text-slate-900 dark:text-white"
        style={{ fontFamily: displayFontFamily }}
      >
        {label}
      </p>
      <p
        className="text-[0.78rem] leading-relaxed text-slate-600 dark:text-slate-300"
        style={{ fontFamily: bodyFontFamily }}
      >
        {sub}
      </p>
    </motion.div>
  )
}

function CoreChip({
  className,
  bodyFontFamily,
  displayFontFamily,
}: {
  className: string
  bodyFontFamily: string
  displayFontFamily: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: 0.15 }}
      className={`absolute z-10 overflow-visible rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[#0f172a] px-7 py-5 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[24px] border border-white/8 bg-transparent px-5 py-6">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,208,178,0.28)] bg-transparent text-[#00d0b2]">
          <Cpu className="h-6 w-6" />
        </div>

        <p
          className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#00d0b2]"
          style={{ fontFamily: bodyFontFamily }}
        >
          Auto Offensive
        </p>
        <h3
          className="mt-2 text-[1.2rem] font-bold leading-tight text-white md:text-[1.35rem]"
          style={{ fontFamily: displayFontFamily }}
        >
          Core Control Plane
        </h3>
        <p
          className="mt-2 max-w-55 text-[0.8rem] leading-relaxed text-slate-300 md:text-[0.88rem]"
          style={{ fontFamily: bodyFontFamily }}
        >
          Gateway orchestration, scan events, AI jobs, and persistence all converge here.
        </p>
      </div>
    </motion.div>
  )
}

function PathBadge({
  label,
  className,
  tone,
  fontFamily,
}: {
  label: string
  className: string
  tone: NodeTone
  fontFamily: string
}) {
  const accent =
    tone === 'primary'
      ? 'border-[rgba(0,208,178,0.22)] bg-[rgba(0,208,178,0.08)] text-[#00a896] dark:text-[#00d0b2]'
      : 'border-[rgba(1,80,158,0.2)] bg-[rgba(1,80,158,0.08)] text-[#01509e] dark:text-[#6ab4ec]'

  return (
    <div
      className={`absolute z-30 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] backdrop-blur ${accent} ${className}`}
      style={{ fontFamily }}
    >
      {label}
    </div>
  )
}

export function Architecture() {
  const locale = useLocale()
  const bodyFontFamily =
    locale === 'kh'
      ? 'var(--font-noto-khmer), var(--font-google-sans), sans-serif'
      : 'var(--font-google-sans), var(--font-noto-khmer), sans-serif'
  const displayFontFamily =
    locale === 'kh'
      ? 'var(--font-noto-khmer), var(--font-hackdaddy), sans-serif'
      : 'var(--font-hackdaddy), var(--font-noto-khmer), sans-serif'

  return (
    <section
      id="architecture"
      className="relative overflow-hidden border-t border-slate-200/80 bg-[#F7F5F0] py-16 dark:border-white/10 dark:bg-[#09090B] md:py-24"
      style={{ fontFamily: bodyFontFamily }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,208,178,0.14)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-6%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(1,80,158,0.16)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col px-4 sm:px-5 md:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <p
            className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#00a896] md:text-[12px]"
            style={{ fontFamily: bodyFontFamily }}
          >
            System Architecture
          </p>
          <h2
            className="text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900 dark:text-white md:text-[3rem] lg:text-[3.7rem]"
            style={{ fontFamily: displayFontFamily }}
          >
            Branded Data Paths,
            <br />
            Real-Time System Flow
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[18px]"
            style={{ fontFamily: bodyFontFamily }}
          >
            The web app, gateway, scanner engine, AI service, and storage layer all feed through a single core
            control plane, with circuit-style paths that visualize the way traffic and analysis move across the
            platform.
          </p>
        </motion.div>

        <div className="relative mx-auto w-full max-w-295">
          <div className="h-56.25 sm:h-75 md:h-107.5 lg:h-140 xl:h-170">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="absolute left-1/2 top-0 h-170 w-275 origin-top -translate-x-1/2 scale-[0.31] overflow-hidden rounded-[34px] border border-[rgba(0,208,178,0.14)] bg-[linear-gradient(135deg,rgba(0,208,178,0.05),rgba(247,245,240,0.98)_36%,rgba(1,80,158,0.06))] backdrop-blur-md sm:scale-[0.43] md:scale-[0.63] lg:scale-[0.82] xl:scale-100 dark:border-[rgba(255,255,255,0.08)] dark:bg-[linear-gradient(135deg,rgba(0,208,178,0.08),rgba(9,9,11,0.98)_36%,rgba(1,80,158,0.12))]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,208,178,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(1,80,158,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(0,208,178,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(1,80,158,0.14),transparent_32%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[rgba(0,208,178,0.35)] to-transparent" />

              <svg viewBox="0 0 1100 680" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="arch-grid-glow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(0,208,178,0.18)" />
                    <stop offset="100%" stopColor="rgba(1,80,158,0.16)" />
                  </linearGradient>
                </defs>

                <TracePath d="M118 120 H260 V246 H456" tone="secondary" />
                <TracePath d="M96 300 H230 V298 H456" tone="primary" delay={0.08} />
                <TracePath d="M118 564 H278 V386 H456" tone="primary" delay={0.16} />
                <TracePath d="M982 118 H846 V246 H644" tone="secondary" delay={0.24} />
                <TracePath d="M1004 302 H862 V336 H644" tone="primary" delay={0.32} />
                <TracePath d="M982 564 H834 V386 H644" tone="secondary" delay={0.4} />

                <circle cx="456" cy="246" r="5" fill="url(#arch-grid-glow)" />
                <circle cx="456" cy="298" r="5" fill="url(#arch-grid-glow)" />
                <circle cx="456" cy="386" r="5" fill="url(#arch-grid-glow)" />
                <circle cx="644" cy="246" r="5" fill="url(#arch-grid-glow)" />
                <circle cx="644" cy="336" r="5" fill="url(#arch-grid-glow)" />
                <circle cx="644" cy="386" r="5" fill="url(#arch-grid-glow)" />
              </svg>

              <CoreChip
                className="left-1/2 top-1/2 w-62.5 -translate-x-1/2 -translate-y-1/2"
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />

              <SceneDot className="left-[10.73%] top-[17.65%]" side="right" />
              <SceneDot className="left-[8.73%] top-[44.12%]" side="right" />
              <SceneDot className="left-[10.73%] top-[82.94%]" side="right" />
              <SceneDot className="left-[41.45%] top-[36.18%]" dark={false} />
              <SceneDot className="left-[41.45%] top-[43.82%]" dark={false} />
              <SceneDot className="left-[41.45%] top-[56.76%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[36.18%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[49.41%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[56.76%]" dark={false} />
              <SceneDot className="left-[89.27%] top-[17.35%]" side="left" />
              <SceneDot className="left-[91.27%] top-[44.41%]" side="left" />
              <SceneDot className="left-[89.27%] top-[82.94%]" side="left" />

              <ArchitectureNode
                icon={<Globe className="h-5 w-5" />}
                label="Web App"
                sub="Dashboard UI and analyst workflows"
                tone="secondary"
                className="left-[4.2%] top-[8%]"
                delay={0.05}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Zap className="h-5 w-5" />}
                label="FastAPI Gateway"
                sub="Auth, request routing, and SSE delivery"
                tone="primary"
                className="left-[2.4%] top-[34.5%]"
                delay={0.1}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Brain className="h-5 w-5" />}
                label="AI Service"
                sub="Parallel summaries, reports, and findings"
                tone="primary"
                className="left-[4.8%] top-[68%]"
                delay={0.15}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Server className="h-5 w-5" />}
                label="gRPC Go Services"
                sub="Scanner engine and task execution"
                tone="secondary"
                className="right-[4.2%] top-[8%]"
                delay={0.2}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Database className="h-5 w-5" />}
                label="PostgreSQL + Redis"
                sub="Persistent state, queues, and cache"
                tone="primary"
                className="right-[1.9%] top-[35.5%]"
                delay={0.25}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Shield className="h-5 w-5" />}
                label="SonarQube"
                sub="Static analysis branch for code security"
                tone="secondary"
                className="right-[4.8%] top-[68%]"
                delay={0.3}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />

              <PathBadge
                label="REST / SSE"
                className="left-[24%] top-[14%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label="Auth / Routing"
                className="left-[22.5%] top-[40%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label="AI Reporting"
                className="left-[24.5%] top-[69%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label="gRPC"
                className="right-[25.5%] top-[14%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label="Pub / Sub"
                className="right-[23.5%] top-[45%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label="SAST"
                className="right-[27%] top-[69%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
            </motion.div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-[24px] border border-[rgba(0,208,178,0.24)] bg-transparent p-5 md:p-6"
          >
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00a896]"
              style={{ fontFamily: bodyFontFamily }}
            >
              Primary Path
            </p>
            <h3
              className="text-[1.15rem] font-bold leading-tight text-slate-900 dark:text-white md:text-[1.4rem]"
              style={{ fontFamily: displayFontFamily }}
            >
              Real-time scan traffic stays fast and visible.
            </h3>
            <p
              className="mt-3 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[16px]"
              style={{ fontFamily: bodyFontFamily }}
            >
              Requests move from the web dashboard into the FastAPI gateway, across the scanner engine, and into
              persistence services with live feedback flowing back through the same responsive channel.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="rounded-[24px] border border-[rgba(1,80,158,0.22)] bg-transparent p-5 md:p-6"
          >
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#01509e] dark:text-[#6ab4ec]"
              style={{ fontFamily: bodyFontFamily }}
            >
              Secondary Path
            </p>
            <h3
              className="text-[1.15rem] font-bold leading-tight text-slate-900 dark:text-white md:text-[1.4rem]"
              style={{ fontFamily: displayFontFamily }}
            >
              AI and SAST analysis branch without slowing the core flow.
            </h3>
            <p
              className="mt-3 text-[14px] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[16px]"
              style={{ fontFamily: bodyFontFamily }}
            >
              Parallel services generate reports, summarize findings, and run code analysis while the main execution
              path stays focused on collection, streaming, and system coordination.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
