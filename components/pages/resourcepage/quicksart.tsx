'use client'

import { Database, BarChart3, Zap} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

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
      link: '#'
    },
    {
      icon: BarChart3,
      title: t('quickStart.items.marketplace.title'),
      description: t('quickStart.items.marketplace.description'),
      link: '#'
    },
    {
      icon: Zap,
      title: t('quickStart.items.integration.title'),
      description: t('quickStart.items.integration.description'),
      link: '#'
    }
  ]

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-black dark:to-white">
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
                className="p-6 md:p-7 border border-border rounded-xl transition-colors"
                variants={itemVariants}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {path.title}
                </h3>
                <p className="resource-page-copy text-foreground/70 mb-3">
                  {path.description}
                </p>
                <a href={path.link} className="resource-page-button text-primary font-semibold hover:text-primary/80 transition flex items-center gap-2">
                  {t('quickStart.learnMore')}
                  <span>→</span>
                </a>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
