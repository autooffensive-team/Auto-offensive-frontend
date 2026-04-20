'use client';

import { JSX, useState } from 'react';

// ── Icons ──────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

const icons: Record<string, () => JSX.Element> = {
  subfinder: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M14.5 14.5L19 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  naabu: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3V1M11 21V19M3 11H1M21 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  dnsx: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 14 7 14 11C14 15 11 19 11 19" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 11H19" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  assetfinder: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L20 7.5V14.5L11 20L2 14.5V7.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  nmap: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 11L8 8L11 13L14 9L17 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  nuclei: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 6V11C3 15.42 6.58 19.58 11 20.5C15.42 19.58 19 15.42 19 11V6L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 11L10 13L14 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  wpscan: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11H15M11 7V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  sqli: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <ellipse cx="11" cy="7" rx="7" ry="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 7V11C4 12.66 7.13 14 11 14C14.87 14 18 12.66 18 11V7" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 11V15C4 16.66 7.13 18 11 18C14.87 18 18 16.66 18 15V11" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  strike3ifr: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M4 18L9 13M9 13L15 4L18 7L9 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 7L15 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  urlfuzzer: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 3C11 3 8 7 8 11C8 15 11 19 11 19M11 3C11 3 14 7 14 11C14 15 11 19 11 19M3 11H19" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  kitecrawler: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3L19 8V14L11 19L3 14V8L11 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 3V19M3 8L19 14M19 8L3 14" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  httprobe: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M9 13L13 9M6 10L5 11C3.34 12.66 3.34 15.34 5 17C6.66 18.66 9.34 18.66 11 17L12 16M10 6L11 5C12.66 3.34 15.34 3.34 17 5C18.66 6.66 18.66 9.34 17 11L16 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  katana: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 9L10 11L7 13M12 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  gobuster: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="11" cy="11" r="1.5" fill="currentColor"/>
    </svg>
  ),
}

const tools = [
  { id: 'subfinder',   name: 'Subfinder',     category: 'Recon',   description: 'Passive subdomain discovery tool that iterates valid subdomains using multiple APIs and sources.',                      tags: ['subdomain', 'passive', 'dns'] },
  { id: 'naabu',       name: 'Naabu',          category: 'Recon',   description: 'A fast port scanning tool focused on reliability and simplicity with nmap-like capabilities.',                          tags: ['port-scan', 'network'] },
  { id: 'dnsx',        name: 'Dnsx',           category: 'Recon',   description: 'Fast and multi-purpose DNS toolkit allowing multiple DNS queries with user-defined resolvers.',                         tags: ['dns', 'resolver'] },
  { id: 'assetfinder', name: 'AssetFinder',    category: 'Recon',   description: 'Find domains and subdomains related to a given domain using multiple open-source resources.',                          tags: ['subdomain', 'osint'] },
  { id: 'nmap',        name: 'Nmap',           category: 'Recon',   description: 'The industry-standard for network discovery and security auditing with NSE script support.',                           tags: ['network', 'port-scan'] },
  { id: 'nuclei',      name: 'Nuclei',         category: 'Vuln',    description: 'Fast and customizable vulnerability scanner based on simple YAML-based templates. Automate security checks at scale.', tags: ['scanner', 'templates', 'yaml'], badge: 'POPULAR' },
  { id: 'wpscan',      name: 'WPScan',         category: 'Vuln',    description: 'Black Box WordPress security scanner that detects known vulnerabilities in core, plugins and themes.',                  tags: ['wordpress', 'cms'] },
  { id: 'sqli',        name: 'SQLi Detector',  category: 'Vuln',    description: 'Detects and exploits SQL injection vulnerabilities through sophisticated payload testing and techniques.',              tags: ['sql', 'injection'] },
  { id: 'strike3ifr',  name: '3ifR Strike',    category: 'Vuln',    description: 'Advanced info-gathering analysis equipped with state-of-the-art Red Team bypass techniques.',                          tags: ['redteam', 'bypass'] },
  { id: 'urlfuzzer',   name: 'URL Fuzzer',     category: 'Fuzzing', description: 'Discover hidden files and directories in web servers using advanced wordlist-based fuzzing.',                          tags: ['fuzzing', 'directory'] },
  { id: 'kitecrawler', name: 'Kitecrawler',    category: 'Fuzzing', description: 'Collects URLs for discovery and analysis for both REST API and dynamic web-based apps.',                               tags: ['crawler', 'api'] },
  { id: 'httprobe',    name: 'Httprobe',       category: 'Fuzzing', description: 'Fast HTTP/HTTPS prober that takes a list of domains and probes for working http and https servers.',                   tags: ['http', 'probe'] },
  { id: 'katana',      name: 'Katana',         category: 'Fuzzing', description: 'Next-generation crawling and spidering framework designed to navigate complexity with JS parsing.',                    tags: ['crawler', 'js'] },
  { id: 'gobuster',    name: 'Gobuster',       category: 'Fuzzing', description: 'Fast tool to brute-force URIs including directories, files, and DNS subdomain enumeration.',                          tags: ['bruteforce', 'dns'] },
]

const categories = ['All', 'Recon', 'Vuln', 'Fuzzing']

const categoryColors: Record<string, string> = {
  Recon:   'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  Vuln:    'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
  Fuzzing: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
}

const categoryDot: Record<string, string> = {
  Recon:   'bg-blue-500',
  Vuln:    'bg-red-500',
  Fuzzing: 'bg-purple-500',
}

export default function ToolsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const bodyCopy = "text-[16px] md:text-[18px] lg:text-[20px] leading-[1.75]";

  const filtered = tools.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
    return matchCat && matchSearch
  })

  const Icon = ({ id }: { id: string }) => {
    const Comp = icons[id]
    return Comp ? <Comp /> : null
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B]" style={{ fontFamily: 'var(--font-google-sans), sans-serif' }}>
      <div className="bg-white dark:bg-[#111113] border-b border-black/9 dark:border-white/9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1 className="text-7xl font-bold text-[#1A1A1A] dark:text-[#EDEDED] mt-1 text-center">The Auto-Offensive ToolKit</h1>
              <p className={`mt-2 max-w-xl text-[#5C5C5C] dark:text-[#9A9A9A] ${bodyCopy}`}>
                Browse and launch industry-standard scanning engines from a single unified interface.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-3 flex items-center text-[#9A9A9A] pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search tools, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F5F0] dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-xl text-sm text-[#1A1A1A] dark:text-[#EDEDED] placeholder-[#9A9A9A] focus:border-[#00BCA1] focus:ring-1 focus:ring-[#00BCA1] transition"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    activeCategory === cat
                      ? 'bg-[#00BCA1] text-white border-[#00BCA1] shadow-sm'
                      : 'bg-white dark:bg-[#111113] text-[#5C5C5C] dark:text-[#9A9A9A] border-black/9 dark:border-white/9 hover:border-[#00BCA1] hover:text-[#00BCA1]'
                  }`}
                >
                  {cat}
                  {cat !== 'All' && (
                    <span className={`ml-1.5 text-xs ${activeCategory === cat ? 'opacity-70' : 'text-[#9A9A9A]'}`}>
                      ({tools.filter((t) => t.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-[#9A9A9A]">
            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="22" cy="22" r="14" stroke="#9A9A9A" strokeWidth="2"/>
              <path d="M32 32L44 44" stroke="#9A9A9A" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-lg font-medium text-[#1A1A1A] dark:text-[#EDEDED]">No tools found</p>
            <p className={`mt-1 ${bodyCopy}`}>Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((tool) => (
              <div
                key={tool.id}
                className="group bg-white dark:bg-[#111113] border border-black/9 dark:border-white/9 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:border-[#00BCA1]/40 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#F7F5F0] dark:bg-[#111113] border border-[#00BCA1]/20 flex items-center justify-center text-[#00BCA1] group-hover:scale-105 transition-transform">
                    <Icon id={tool.id} />
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.badge && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-[#00BCA1] text-white px-2.5 py-1 rounded-md">
                        {tool.badge}
                      </span>
                    )}
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1 ${categoryColors[tool.category]}`}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${categoryDot[tool.category]}`} />
                      {tool.category}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#1A1A1A] dark:text-[#EDEDED] mb-1.5">{tool.name}</h3>
                  <p className={`text-[#5C5C5C] dark:text-[#9A9A9A] ${bodyCopy}`}>{tool.description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="text-[11px] bg-[#F7F5F0] dark:bg-[#111113] border border-black/9 dark:border-white/9 text-[#5C5C5C] dark:text-[#9A9A9A] px-2 py-0.5 rounded-md font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-black/9 dark:border-white/9">
                  <a
                    href="#"
                    className="text-[#00BCA1] text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-3 transition-all"
                  >
                    Try for Free
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
