import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const bodyCopy = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.75]";

export default function Hero() {
  return (
    <section className="bg-white dark:bg-black dark:to-white py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4">
              TECHNICAL RESOURCES
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight text-balance">
              Clinical Precision <span className='text-primary'>Resource Center</span>
            </h1>
            <p className={`text-foreground/70 mb-6 ${bodyCopy}`}>
              Access technical specifications, integration guides, and best practices for the comprehensive security workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2">
                Browse Resources
                <ArrowRight size={18} />
              </button>
              <button className="border border-2  text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition">
                View Documentation
              </button>
            </div>
          </div>
          <div className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden">
            <Image src="/images/ddoc.png" alt="Resource Center" width={600} height={400} className="object-contain" />
          </div>
        </div>
      </div>
    </section>
  )
}
