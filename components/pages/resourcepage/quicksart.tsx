'use client'

import { Database, BarChart3, Zap} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import AnimatedCta from '../homepage/animated-cta'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export default function QuickStartPaths() {
  const t = useTranslations("resourcePage")

  const pathsData = [
    {
      icon: Database,
      title: t('quickStart.items.data.title'),
      description: t('quickStart.items.data.description'),
      link: '#',
      iconColor: 'text-primary'
    },
    {
      icon: BarChart3,
      title: t('quickStart.items.marketplace.title'),
      description: t('quickStart.items.marketplace.description'),
      link: '#',
      iconColor: 'text-primary'
    },
    {
      icon: Zap,
      title: t('quickStart.items.integration.title'),
      description: t('quickStart.items.integration.description'),
      link: '#',
      iconColor: 'text-primary'
    }
  ]

  return (
    <section className="py-12 md:py-16 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {t('quickStart.title')}
          </h2>
          <p className="resource-page-copy text-foreground/60">
            {t('quickStart.subtitle')}
          </p>
        </motion.div>
        <motion.div
          className="grid md:grid-cols-3 gap-5 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {pathsData.map((path, idx) => {
            const Icon = path.icon
            return (
              <motion.div 
                key={idx} 
                className="flex h-full flex-col rounded-xl border border-border bg-white dark:bg-[#111113] p-6 md:p-7 transition-[border-color,box-shadow] duration-200 hover:border-[#00BCA1]/60 hover:shadow-[0_0_0_1px_rgba(0,188,161,0.18),0_0_16px_rgba(0,188,161,0.10)]"
                variants={itemVariants}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-primary/5">
                  <Icon className={path.iconColor} size={24} />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-foreground">
                  {path.title}
                </h3>
                <p className="resource-page-copy mb-4 flex-1 text-foreground/70">
                  {path.description}
                </p>
                <AnimatedCta
                  as="a"
                  href={path.link}
                  className="resource-page-button mt-auto mx-auto w-auto min-w-42 self-center rounded-xl border-2 border-[#00BCA1] bg-[#00BCA1] text-[15px] font-bold text-white hover:bg-[#00a892] dark:border-[#00BCA1] dark:bg-[#00BCA1] dark:text-white dark:hover:bg-[#009d88]"
                  iconClassName="bg-white text-[#00BCA1] shadow-[0.1em_0.1em_0.6em_0.2em_rgba(0,188,161,0.16)] dark:bg-white dark:text-[#00BCA1]"
                  icon={
                    <svg className="h-3 w-3 flex-none" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6 1L11 6L6 11M11 6H1"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                >
                  {t('quickStart.learnMore')}
                </AnimatedCta>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}