'use client'

import { FileText, Link2, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { TbPoint } from 'react-icons/tb'
import AnimatedCta from '../homepage/animated-cta'

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
                <AnimatedCta
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
                  {resource.cta}
                </AnimatedCta>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}