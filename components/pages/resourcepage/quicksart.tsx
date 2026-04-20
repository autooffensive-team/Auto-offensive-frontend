import { Database, BarChart3, Zap } from 'lucide-react'

const bodyCopy = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.75]";

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

export default function QuickStartPaths() {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black dark:to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Quick Start Paths
          </h2>
          <p className={`text-foreground/60 ${bodyCopy}`}>
            Get up and running with these essential pathways
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {paths.map((path, idx) => {
            const Icon = path.icon
            return (
              <div key={idx} className="p-6 md:p-8 border border-border rounded-xl hover:border-primary/50 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {path.title}
                </h3>
                <p className={`text-foreground/70 mb-4 ${bodyCopy}`}>
                  {path.description}
                </p>
                <a href={path.link} className="text-primary font-semibold hover:text-primary/80 transition flex items-center gap-2">
                  Learn more
                  <span>→</span>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
