'use client'

import { Database, BarChart3, Zap} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const paths = [
  {
    icon: Database,
    title: 'Data Requests',
    description: 'Complete guide for requesting and managing clinical data with proper documentation and audit trails.',
    link: '#'
  },
  {
    icon: BarChart3,
    title: 'PLR Marketplace',
    description: 'Explore our patient level research marketplace with curated datasets and integration examples.',
    link: '#'
  },
  {
    icon: Zap,
    title: 'EDSA Integration',
    description: 'Step-by-step integration guide for the External Data Source API with code samples.',
    link: '#'
  }
]

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
    <section className="py-16 md:py-24 bg-white dark:bg-black dark:to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {t('quickStart.title')}
          </h2>
          <p className="text-lg text-foreground/60">
            {t('quickStart.subtitle')}
          </p>
        </motion.div>
        <motion.div
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
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
                className="p-6 md:p-8 border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {path.title}
                </h3>
                <p className="text-foreground/70 mb-4 leading-relaxed">
                  {path.description}
                </p>
                <a href={path.link} className="text-primary font-semibold hover:text-primary/80 transition flex items-center gap-2">
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