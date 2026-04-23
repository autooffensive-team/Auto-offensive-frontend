'use client'

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface StatusItem {
  service: string
  status: 'operational' | 'degraded' | 'maintenance'
  uptime: string
  lastIncident: string
}

const statusData: StatusItem[] = [
  {
    service: 'API Server',
    status: 'operational',
    uptime: '99.98%',
    lastIncident: '2 weeks ago'
  },
  {
    service: 'Data Processing',
    status: 'operational',
    uptime: '99.95%',
    lastIncident: '1 month ago'
  },
  {
    service: 'Authentication Service',
    status: 'operational',
    uptime: '100%',
    lastIncident: '45 days ago'
  },
  {
    service: 'Dashboard',
    status: 'degraded',
    uptime: '99.5%',
    lastIncident: '2 hours ago'
  },
  {
    service: 'Report Generation',
    status: 'maintenance',
    uptime: '99.92%',
    lastIncident: '5 days ago'
  },
  {
    service: 'Compliance Audit',
    status: 'operational',
    uptime: '99.99%',
    lastIncident: '3 weeks ago'
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="text-green-500" size={20} />
    case 'degraded':
      return <AlertCircle className="text-yellow-500" size={20} />
    case 'maintenance':
      return <Clock className="text-blue-500" size={20} />
    default:
      return <AlertCircle className="text-red-500" size={20} />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-700'
    case 'degraded':
      return 'bg-yellow-100 text-yellow-700'
    case 'maintenance':
      return 'bg-blue-100 text-blue-700'
    default:
      return 'bg-red-100 text-red-700'
  }
}

export default function StatusTable() {
  const t = useTranslations("resourcePage")

  return (
    <section className="py-12 md:py-16 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('status.title')}
          </h2>
          <p className="resource-page-copy text-foreground/60">
            {t('status.subtitle')}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-160">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-left font-semibold text-foreground">{t('status.service')}</th>
                <th className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-left font-semibold text-foreground">{t('status.status')}</th>
                <th className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-left font-semibold text-foreground">{t('status.uptime')}</th>
                <th className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-left font-semibold text-foreground">{t('status.lastIncident')}</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-foreground font-medium">
                    {item.service}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className={`resource-page-meta whitespace-nowrap px-3 py-1 rounded-full font-medium capitalize ${getStatusBadge(item.status)}`}>
                        {t(`status.${item.status}`)}
                      </span>
                    </div>
                  </td>
                  <td className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-foreground/80">
                    {item.uptime}
                  </td>
                  <td className="resource-page-meta whitespace-nowrap px-5 py-3.5 text-foreground/70">
                    {item.lastIncident}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-5 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="resource-page-meta text-foreground/80">
            <span className="font-semibold text-foreground">{t('status.statusNote')}</span> {t('status.dedicatedPage')}
          </p>
        </div>
      </div>
    </section>
  )
}