'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type LayoutPreloaderProps = {
  className?: string
  title?: string
  eyebrow?: string
  status?: string
}

const panelMotion = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

const lineMotion = {
  hidden: { opacity: 0, x: -18 },
  visible: (delay = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
}

export function LayoutPreloader({
  className,
  title = 'RESOURCE INDEX',
  eyebrow = 'Layout Preloader',
  status = 'Streaming interface assets',
}: LayoutPreloaderProps) {
  return (
    <motion.div
      variants={panelMotion}
      initial="hidden"
      animate="visible"
      className={cn(
        'relative isolate overflow-hidden rounded-[28px] border border-[#00BCA1]/25 bg-[#04131A]/92 p-5 text-white shadow-[0_24px_80px_rgba(1,80,158,0.28)] backdrop-blur-xl',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,208,178,0.26),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(1,80,158,0.34),transparent_42%)]" />
      <div className="absolute inset-0 opacity-15 mix-blend-screen">
        <div
          className="h-[200%] w-[200%] bg-[linear-gradient(0deg,transparent_0%,rgba(255,255,255,0.9)_1%,transparent_2%,transparent_100%)]"
          style={{ animation: 'noise-animation 0.9s steps(8) infinite' }}
        />
      </div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7CE5D4] to-transparent opacity-80" />
      <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-[#7CE5D4]/60 via-transparent to-transparent" />

      <div className="relative z-10">
        <motion.div
          custom={0.05}
          variants={lineMotion}
          className="mb-4 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#7CE5D4]"
        >
          <span>{eyebrow}</span>
          <span className="rounded-full border border-[#7CE5D4]/20 bg-white/5 px-2 py-1 tracking-[0.18em] text-white/70">
            Active
          </span>
        </motion.div>

        <motion.div custom={0.12} variants={lineMotion} className="mb-5">
          <div className="text-[1.65rem] font-bold leading-none tracking-[0.16em] text-white md:text-[2rem]">
            {title}
          </div>
          <div className="mt-2 max-w-[26ch] text-sm text-[#D4F8F3]/70">
            {status}
          </div>
        </motion.div>

        <motion.div custom={0.2} variants={lineMotion} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-3 text-xs text-[#D9E7EE]">
          <span className="text-[#7CE5D4]">01</span>
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-white/8">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#00D0B2] to-[#28CCE7]" />
            </div>
            <p>Loading structured docs, references, and scanner modules.</p>
          </div>

          <span className="text-[#7CE5D4]">02</span>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 rounded-lg border border-white/10 bg-white/6" />
              <div className="h-12 rounded-lg border border-[#00D0B2]/25 bg-[#00D0B2]/10" />
              <div className="h-12 rounded-lg border border-white/10 bg-white/6" />
            </div>
            <p>Preparing the hero layout with layered motion and ambient noise.</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
