'use client'

import { FileText, Link2, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TbPoint } from 'react-icons/tb'

export default function ResourceSections() {
  const t = useTranslations("resourcePage")

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

  const resourcesData = [
    {
      title: t('resourceSections.items.dll.title'),
      description: t('resourceSections.items.dll.description'),
      icon: FileText,
      items: t.raw('resourceSections.items.dll.items') as string[],
      color: 'bg-white dark:bg-[#111113]',
      iconBg: 'bg-primary/5',
      iconColor: 'text-primary',
      cta: t('resourceSections.items.dll.cta')
    },
    {
      title: t('resourceSections.items.api.title'),
      description: t('resourceSections.items.api.description'),
      icon: Code2,
      items: t.raw('resourceSections.items.api.items') as string[],
      color: 'bg-white dark:bg-[#111113]',
      iconBg: 'bg-primary/5',
      iconColor: 'text-primary',
      cta: t('resourceSections.items.api.cta')
    },
    {
      title: t('resourceSections.items.integration.title'),
      description: t('resourceSections.items.integration.description'),
      icon: Link2,
      items: t.raw('resourceSections.items.integration.items') as string[],
      color: 'bg-white dark:bg-[#111113]',
      iconBg: 'bg-primary/5',
      iconColor: 'text-primary',
      cta: t('resourceSections.items.integration.cta')
    }
  ]

  return (
    <section className="py-12 md:py-16 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {resourcesData.map((resource, idx) => {
            const Icon = resource.icon
            return (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                className={`flex h-full flex-col rounded-xl border border-border p-6 md:p-7 transition-[border-color,box-shadow] duration-200 hover:border-[#00BCA1]/60 hover:shadow-[0_0_0_1px_rgba(0,188,161,0.18),0_0_16px_rgba(0,188,161,0.10)] ${resource.color}`}
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border ${resource.iconBg}`}>
                  <Icon className={resource.iconColor} size={24} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {resource.title}
                </h3>
                <p className="resource-page-copy text-foreground/70 mb-4">
                  {resource.description}
                </p>
                <div className="mb-5 space-y-1.5 flex-1">
                  {resource.items.map((item, iIdx) => (
                    <div key={iIdx} className="resource-page-meta flex items-center gap-2 text-foreground/80">
                      <TbPoint className={resource.iconColor} size={18} />
                      {item}
                    </div>
                  ))}
                </div>
                <button className="
                  resource-page-button
                  group relative mt-auto inline-flex w-full items-center justify-center gap-2
                  overflow-hidden rounded-xl border-2 border-primary/35 bg-primary/6
                  py-2.5 font-semibold text-primary
                  transition-colors duration-200 hover:border-primary/55 hover:bg-primary/10
                  before:pointer-events-none before:absolute before:inset-0 before:translate-y-full
                  before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,208,178,0.10)_25%,transparent_0,transparent_50%,rgba(0,208,178,0.10)_0,rgba(0,208,178,0.10)_75%,transparent_0)]
                  before:transition-transform before:duration-200 before:content-['']
                  after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full
                  after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,208,178,0.16)_0,rgba(0,208,178,0.16)_50%,transparent_0,transparent_75%,rgba(0,208,178,0.12)_0)]
                  after:transition-transform after:duration-200 after:content-['']
                  hover:before:translate-y-0 hover:after:translate-y-0
                ">
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {resource.cta}
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      →
                    </motion.span>
                  </span>
                </button>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
