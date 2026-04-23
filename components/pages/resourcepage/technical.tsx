'use client'

import { BookOpen, Code, Users, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'

const staticTags = {
  api: ['REST', 'GraphQL', 'Webhooks'],
  sdk: ['Python', 'JavaScript', 'Java'],
  security: ['HIPAA', 'Encryption', 'Audit Logs'],
  user: ['RBAC', 'SSO', 'Teams']
}

export default function TechnicalDeepDives() {
  const t = useTranslations("resourcePage")

  const technicalData = [
    {
      icon: BookOpen,
      title: t('technical.items.api.title'),
      description: t('technical.items.api.description'),
      tags: staticTags.api
    },
    {
      icon: Code,
      title: t('technical.items.sdk.title'),
      description: t('technical.items.sdk.description'),
      tags: staticTags.sdk
    },
    {
      icon: Shield,
      title: t('technical.items.security.title'),
      description: t('technical.items.security.description'),
      tags: staticTags.security
    },
    {
      icon: Users,
      title: t('technical.items.user.title'),
      description: t('technical.items.user.description'),
      tags: staticTags.user
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black dark:to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div className="mb-12" initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('technical.title')}
          </h2>
          <p className="text-lg text-foreground/60">
            {t('technical.subtitle')}
          </p>
        </motion.div>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {technicalData.map((dive, idx) => {
            const Icon = dive.icon
            return (
              <motion.div key={idx} variants={itemVariants} className="p-6 bg-white rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition dark:bg-black dark:to-white" whileHover={{ y: -5 }}>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={20} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {dive.title}
                </h3>
                <p className="text-foreground/70 text-sm mb-4 leading-relaxed">
                  {dive.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {dive.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}