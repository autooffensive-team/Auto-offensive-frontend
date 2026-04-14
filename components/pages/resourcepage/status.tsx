'use client'

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const bodyCopy = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.75]";

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
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black dark:to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Platform Operational Status
          </h2>
          <p className={`text-foreground/60 ${bodyCopy}`}>
            Real-time status of all Clinical Precision services and infrastructure
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Uptime</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Last Incident</th>
              </tr>
            </thead>
            <tbody>
              {statusData.map((item, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="px-6 py-4 text-foreground font-medium">
                    {item.service}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(item.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-foreground/80">
                    {item.uptime}
                  </td>
                  <td className="px-6 py-4 text-foreground/70">
                    {item.lastIncident}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <p className={`text-foreground/80 ${bodyCopy}`}>
            <span className="font-semibold text-foreground">Status Page:</span> For detailed status information and incident history, visit our{' '}
            <a href="#" className="text-primary hover:underline font-semibold">
              dedicated status page
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
