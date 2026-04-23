'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { easeOut } from 'framer-motion'
import { useTranslations } from 'next-intl'

export default function Hero() {
  const t = useTranslations("resourcePage")

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: easeOut },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: easeOut },
    },
  }

  return (
    <section className="bg-white dark:bg-black dark:to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span
              variants={itemVariants}
              className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4"
            >
              {t('hero.badge')}
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight text-balance"
            >
              {t('hero.titleLine1')} <span className='text-primary'>{t('hero.titleLine2')}</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-lg text-foreground/70 mb-6 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                {t('categories.viewAll')}
                <ArrowRight size={18} />
              </button>
              <button className="border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition">
                {t('quickLinks.items.0.title')}
              </button>
            </motion.div>
          </motion.div>
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden"
          >
            <Image src="/images/ddoc.png" alt="Resource Center" width={600} height={400} className="object-contain" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}