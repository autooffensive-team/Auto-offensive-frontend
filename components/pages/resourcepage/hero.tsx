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
    <>
      <style>{`
        .resource-ripple-button {
          position: relative;
          overflow: hidden;
        }
        .resource-ripple-button::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -25%;
          width: 70%;
          height: 220%;
          transform: translateY(-50%) rotate(24deg);
          background: linear-gradient(90deg, transparent, rgba(0, 208, 178, 0.16), transparent);
          transition: transform .45s cubic-bezier(.22, 1, .36, 1), opacity .45s ease;
          opacity: 0;
          pointer-events: none;
        }
        .resource-ripple-button::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0, 208, 178, 0.12), transparent 60%);
          opacity: 0;
          transition: opacity .3s ease;
          pointer-events: none;
        }
        .resource-ripple-button:hover::before {
          transform: translate(155%, -50%) rotate(24deg);
          opacity: 1;
        }
        .resource-ripple-button:hover::after {
          opacity: 1;
        }
      `}</style>
    <section className="bg-white dark:bg-black dark:to-white pt-18 pb-12 md:pt-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10 items-center">
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            className="order-1 relative h-64 sm:h-72 md:order-2 md:h-96 flex items-center justify-center overflow-hidden"
          >
            <Image src="/images/ddoc.png" alt="Resource Center" width={600} height={400} className="object-contain" />
          </motion.div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="order-2 text-center md:order-1 md:text-left"
          >
            <motion.span
              variants={itemVariants}
              className="resource-page-meta inline-block px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold mb-3"
            >
              {t('hero.badge')}
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="display-font text-4xl md:text-5xl font-bold text-foreground mb-3 leading-tight text-balance"
            >
              {t('hero.titleLine1')} <span className='text-primary'>{t('hero.titleLine2')}</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="resource-page-copy text-foreground/70 mb-5"
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-3 md:flex md:flex-row"
            >
              <button className="
                resource-page-button
                group relative inline-flex items-center justify-center gap-2
                overflow-hidden rounded-xl border-2 border-primary bg-primary
                min-h-12 px-3 py-2.5 text-center text-[13px] font-semibold leading-tight text-primary-foreground
                transition-colors duration-200
                before:pointer-events-none before:absolute before:inset-0 before:translate-y-full
                before:rounded-xl before:bg-[linear-gradient(90deg,rgba(0,122,104,0.22)_25%,transparent_0,transparent_50%,rgba(0,122,104,0.22)_0,rgba(0,122,104,0.22)_75%,transparent_0)]
                before:transition-transform before:duration-200 before:content-['']
                after:pointer-events-none after:absolute after:inset-0 after:-translate-y-full
                after:rounded-xl after:bg-[linear-gradient(90deg,transparent_0,transparent_25%,rgba(0,122,104,0.36)_0,rgba(0,122,104,0.36)_50%,transparent_0,transparent_75%,rgba(0,122,104,0.28)_0)]
                after:transition-transform after:duration-200 after:content-['']
                hover:before:translate-y-0 hover:after:translate-y-0
                md:min-h-0 md:px-6 md:py-3 md:text-[15px]
              ">
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  {t('categories.viewAll')}
                  <ArrowRight size={18} />
                </span>
              </button>
              <button className="
                resource-page-button resource-ripple-button
                inline-flex items-center justify-center gap-2
                rounded-xl border border-[rgba(0,208,178,0.28)] dark:border-[rgba(0,208,178,0.2)]
                bg-white dark:bg-[rgba(0,208,178,0.06)]
                min-h-12 px-3 py-2.5 text-center text-[13px] font-semibold leading-tight text-black dark:text-white
                backdrop-blur-sm transition-colors duration-200
                md:min-h-0 md:px-6 md:py-3 md:text-[15px]
              ">
                <span className="relative z-10">{t('quickLinks.items.0.title')}</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  )
}
