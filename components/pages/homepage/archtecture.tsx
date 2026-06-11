'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Brain, Cpu, Database, Globe, Server, Shield, Zap } from 'lucide-react'
import { useLocale } from 'next-intl'

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
      className={`absolute z-20 w-45.5 rounded-[22px] p-0.5 overflow-hidden ${className}`}
      style={{ background: 'transparent' }}
    >
      {/* Animated rotating border */}
      <div className={`arch-node-border-spin absolute inset-0 rounded-[22px] overflow-hidden z-0 ${tone === 'primary' ? 'arch-node-border-primary' : 'arch-node-border-secondary'}`}>
        <div className="arch-node-border-ray" />
      </div>
      {/* Static fallback border underneath */}
      <div className={`absolute inset-0 rounded-[22px] z-0 ${tone === 'primary' ? 'bg-[rgba(0,208,178,0.25)]' : 'bg-[rgba(0,80,158,0.2)]'}`} />
      {/* Card content */}
      <div className={`relative z-10 rounded-[20px] p-4 bg-[#F7F5F0] dark:bg-[#09090B] ${palette.wrapper}`}>
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
      </div>
    </motion.div>
  )
}

function CoreChip({
  className,
  bodyFontFamily,
  displayFontFamily,
  
  title,
  body,
}: {
  className: string
  bodyFontFamily: string
  displayFontFamily: string
 
  title: string
  body: string
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
     
        </p>
        <h3
          className="mt-2 text-[1.2rem] font-bold leading-tight text-white md:text-[1.35rem]"
          style={{ fontFamily: displayFontFamily }}
        >
          {title}
        </h3>
        <p
          className="mt-2 max-w-55 text-[0.8rem] leading-relaxed text-slate-300 md:text-[0.88rem]"
          style={{ fontFamily: bodyFontFamily }}
        >
          {body}
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
  const isKhmer = locale === 'km'
  const bodyFontFamily = 'var(--font-google-sans), var(--font-kantumruy-pro), sans-serif'
  const displayFontFamily = isKhmer
    ? 'var(--font-hanuman), sans-serif'
    : 'var(--font-hackdaddy), var(--font-kantumruy-pro), sans-serif'
  const copy = {
        titleLine1: 'Branded Data Paths,',
        titleLine2: 'Real-Time System Flow',
        description:
          'The web app, gateway, scanner engine, AI service, and storage layer all feed through a single core control plane, with circuit-style paths that visualize the way traffic and analysis move across the platform.',
        coreEyebrow: 'Auto Offensive',
        coreTitle: 'Core Control Plane',
        coreBody:
          'Gateway orchestration, scan events, AI jobs, and persistence all converge here.',
        nodes: {
          webApp: ['Web App', 'Dashboard UI and analyst workflows'],
          gateway: ['FastAPI Gateway', 'Auth, request routing, and SSE delivery'],
          aiService: ['AI Service', 'Parallel summaries, reports, and findings'],
          grpc: ['gRPC Go Services', 'Scanner engine and task execution'],
          storage: ['PostgreSQL + Redis', 'Persistent state, queues, and cache'],
          sonar: ['SonarQube', 'Static analysis branch for code security'],
        },
        badges: {
          rest: 'REST / SSE',
          auth: 'Auth / Routing',
          ai: 'AI Reporting',
          grpc: 'gRPC',
          pubsub: 'Pub / Sub',
          sast: 'SAST',
        },
      }

  return (
    <section
      id="architecture"
      className="relative overflow-hidden border-t border-slate-200/80 bg-[#F7F5F0] py-16 dark:border-white/10 dark:bg-[#09090B] md:py-24"
      style={{ fontFamily: bodyFontFamily }}
    >
      <style>{`
        @keyframes arch-border-spin {
          to { transform: rotate(360deg); }
        }
        .arch-node-border-spin {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 22px;
          z-index: 0;
        }
        .arch-node-border-ray {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          animation: arch-border-spin 3s linear infinite;
        }
        .arch-node-border-primary .arch-node-border-ray {
          background: conic-gradient(
            from 0deg,
            transparent,
            #00D0B2,
            #00cfff,
            transparent,
            transparent,
            #00D0B2,
            #00cfff,
            transparent
          );
        }
        .arch-node-border-secondary .arch-node-border-ray {
          background: conic-gradient(
            from 0deg,
            transparent,
            #00509E,
            #1675B1,
            transparent,
            transparent,
            #00509E,
            #28CCE7,
            transparent
          );
        }
      `}</style>
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
          </p>
          <h2
            className="text-[2rem] font-bold leading-[1.05] tracking-[-0.03em] text-slate-900 dark:text-white md:text-[3rem] lg:text-[3.7rem]"
            style={{ fontFamily: displayFontFamily }}
          >
            <span className="text-[#01509e] dark:text-[#4fa3e5]">{copy.titleLine1}</span>
            <br />
            {copy.titleLine2}
          </h2>
          <p
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 md:text-[18px]"
            style={{ fontFamily: bodyFontFamily }}
          >
            {copy.description}
          </p>
        </motion.div>

        <div className="relative mx-auto w-full max-w-295">
          <div className="h-62.5 sm:h-80 md:h-107.5 lg:h-140 xl:h-170">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
              className="absolute left-1/2 top-0 h-170 w-275 origin-top -translate-x-1/2 scale-[0.36] overflow-hidden rounded-[34px] sm:scale-[0.46] md:scale-[0.63] lg:scale-[0.82] xl:scale-100"
            >
              <div className="absolute inset-0" />
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[rgba(0,208,178,0.35)] to-transparent" />

              <svg viewBox="0 0 1100 680" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="arch-grid-glow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgba(0,208,178,0.18)" />
                    <stop offset="100%" stopColor="rgba(1,80,158,0.16)" />
                  </linearGradient>
                </defs>

                <TracePath d="M118 120 H200 V160 H260 V246 H380 V246 H456" tone="secondary" />
                <TracePath d="M118 140 H180 V200 H240 V260 H320 V246 H456" tone="primary" delay={0.06} />
                <TracePath d="M96 300 H170 V280 H230 V298 H360 V298 H456" tone="primary" delay={0.08} />
                <TracePath d="M96 320 H150 V310 H210 V305 H300 V298 H456" tone="secondary" delay={0.14} />
                <TracePath d="M118 564 H200 V520 H278 V440 H340 V386 H456" tone="primary" delay={0.16} />
                <TracePath d="M118 544 H180 V490 H258 V420 H320 V386 H456" tone="secondary" delay={0.22} />
                <TracePath d="M982 118 H900 V160 H846 V246 H720 V246 H644" tone="secondary" delay={0.24} />
                <TracePath d="M982 138 H920 V200 H866 V260 H780 V246 H644" tone="primary" delay={0.3} />
                <TracePath d="M1004 302 H930 V320 H862 V336 H740 V336 H644" tone="primary" delay={0.32} />
                <TracePath d="M1004 322 H950 V330 H882 V340 H760 V336 H644" tone="secondary" delay={0.38} />
                <TracePath d="M982 564 H900 V520 H834 V440 H760 V386 H644" tone="secondary" delay={0.4} />
                <TracePath d="M982 542 H920 V490 H854 V420 H780 V386 H644" tone="primary" delay={0.46} />

                {/* Junction nodes along paths */}
                <circle cx="200" cy="160" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="260" cy="246" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="230" cy="298" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="278" cy="440" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="846" cy="246" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="862" cy="336" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="900" cy="160" r="3" fill="url(#arch-grid-glow)" />
                <circle cx="834" cy="440" r="3" fill="url(#arch-grid-glow)" />

                {/* Endpoint nodes at center card */}
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
      
                title={copy.coreTitle}
                body={copy.coreBody}
              />

              <SceneDot className="left-[10.50%] top-[23.35%]" side="right" />
              <SceneDot className="left-[8.65%] top-[44.59%]" side="right" />
              <SceneDot className="left-[10.95%] top-[72.25%]" side="right" />
              <SceneDot className="left-[41.45%] top-[36.18%]" dark={false} />
              <SceneDot className="left-[41.45%] top-[43.82%]" dark={false} />
              <SceneDot className="left-[41.45%] top-[56.76%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[36.18%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[49.41%]" dark={false} />
              <SceneDot className="left-[58.55%] top-[56.76%]" dark={false} />
              <SceneDot className="left-[89.27%] top-[23.82%]" side="left" />
              <SceneDot className="left-[91.27%] top-[46.88%]" side="left" />
              <SceneDot className="left-[88.50%] top-[76.47%]" side="left" />

              <ArchitectureNode
                icon={<Globe className="h-5 w-5" />}
                label={copy.nodes.webApp[0]}
                sub={copy.nodes.webApp[1]}
                tone="secondary"
                className="left-[4.2%] top-[8%]"
                delay={0.05}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Zap className="h-5 w-5" />}
                label={copy.nodes.gateway[0]}
                sub={copy.nodes.gateway[1]}
                tone="primary"
                className="left-[2.4%] top-[34.5%]"
                delay={0.1}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Brain className="h-5 w-5" />}
                label={copy.nodes.aiService[0]}
                sub={copy.nodes.aiService[1]}
                tone="primary"
                className="left-[4.8%] top-[68%]"
                delay={0.15}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Server className="h-5 w-5" />}
                label={copy.nodes.grpc[0]}
                sub={copy.nodes.grpc[1]}
                tone="secondary"
                className="right-[4.2%] top-[8%]"
                delay={0.2}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Database className="h-5 w-5" />}
                label={copy.nodes.storage[0]}
                sub={copy.nodes.storage[1]}
                tone="primary"
                className="right-[1.9%] top-[35.5%]"
                delay={0.25}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />
              <ArchitectureNode
                icon={<Shield className="h-5 w-5" />}
                label={copy.nodes.sonar[0]}
                sub={copy.nodes.sonar[1]}
                tone="secondary"
                className="right-[4.8%] top-[68%]"
                delay={0.3}
                bodyFontFamily={bodyFontFamily}
                displayFontFamily={displayFontFamily}
              />

              <PathBadge
                label={copy.badges.rest}
                className="left-[24%] top-[14%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label={copy.badges.auth}
                className="left-[22.5%] top-[40%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label={copy.badges.ai}
                className="left-[24.5%] top-[69%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label={copy.badges.grpc}
                className="right-[25.5%] top-[14%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label={copy.badges.pubsub}
                className="right-[23.5%] top-[45%]"
                tone="primary"
                fontFamily={bodyFontFamily}
              />
              <PathBadge
                label={copy.badges.sast}
                className="right-[27%] top-[69%]"
                tone="secondary"
                fontFamily={bodyFontFamily}
              />
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  )
}
