import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Highlight, themes } from 'prism-react-renderer'
import {
  Copy,
  Check,
  Menu,
  X,
  Key,
  Send,
  FileCheck,
  ChevronRight,
  AlertTriangle,
  Search,
} from 'lucide-react'

/* ══════════════════════════ TYPES ══════════════════════════ */
interface NavItem {
  label: string
  href: string
  method?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

/* ══════════════════════════ NAV DATA ══════════════════════════ */
const navSections: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Overview', href: '#overview' },
      { label: 'Authentication', href: '#authentication' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'Upload Statement', href: '#upload', method: 'POST' },
      { label: 'Get Extraction Status', href: '#status', method: 'GET' },
      { label: 'Retrieve Results', href: '#results', method: 'GET' },
      { label: 'Export Formats', href: '#export', method: 'POST' },
    ],
  },
  {
    title: 'Client Portals',
    items: [
      { label: 'Create Portal', href: '#create-portal', method: 'POST' },
      { label: 'List Portals', href: '#list-portals', method: 'GET' },
      { label: 'Upload to Portal', href: '#upload-portal', method: 'POST' },
    ],
  },
  {
    title: 'Webhooks',
    items: [
      { label: 'Configuration', href: '#webhooks-config' },
      { label: 'Events', href: '#webhooks-events' },
    ],
  },
]

/* ══════════════════════════ CODE BLOCK COMPONENT ══════════════════════════ */
function CodeBlock({
  code,
  language = 'bash',
  title,
}: {
  code: string
  language?: string
  title?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="rounded-xl border border-[#162544] overflow-hidden group"
      style={{ background: '#0A111E' }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(22,37,68,0.5)]" style={{ background: 'rgba(22,37,68,0.5)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#4A6180]">
            {language}
          </span>
          {title && (
            <>
              <ChevronRight size={12} className="text-[#4A6180]" />
              <span className="text-[11px] text-[#8BA3C7]">{title}</span>
            </>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-[#4A6180] hover:text-[#E8EEF7] transition-colors duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-[#00D68F]" />
              <span className="text-[#00D68F]">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <div className="overflow-x-auto px-5 py-4">
        <Highlight theme={themes.vsDark} code={code.trim()} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className="font-mono-code text-[13px] leading-relaxed"
              style={{ ...style, background: 'transparent', margin: 0, padding: 0 }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </motion.div>
  )
}

/* ══════════════════════════ METHOD BADGE ══════════════════════════ */
function MethodBadge({ method }: { method: string }) {
  const colorMap: Record<string, string> = {
    GET: '#4B82FF',
    POST: '#00D68F',
    PUT: '#FFB020',
    DELETE: '#FF4D6A',
    PATCH: '#B0CCFF',
  }
  const color = colorMap[method] || '#8BA3C7'
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold mr-2"
      style={{ background: `${color}20`, color }}
    >
      {method}
    </span>
  )
}

/* ══════════════════════════ ENDPOINT CARD ══════════════════════════ */
function EndpointCard({
  method,
  path,
  description,
}: {
  method: string
  path: string
  description: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-[#162544] px-5 py-4"
      style={{ background: '#162544' }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <MethodBadge method={method} />
        <code className="font-mono-code text-sm text-[#E8EEF7]">{path}</code>
      </div>
      <p className="mt-2 text-sm text-[#8BA3C7]">{description}</p>
    </motion.div>
  )
}

/* ══════════════════════════ PARAM TABLE ══════════════════════════ */
function ParamTable({
  rows,
}: {
  rows: { name: string; type: string; required?: boolean; description: string }[]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#162544]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#162544]">
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
              Name
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
              Type
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
              Required
            </th>
            <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors duration-150"
            >
              <td className="px-4 py-2.5 font-mono-code text-xs text-[#B0CCFF]">{row.name}</td>
              <td className="px-4 py-2.5 text-[#8BA3C7]">{row.type}</td>
              <td className="px-4 py-2.5">
                {row.required !== undefined && (
                  <span
                    className={`text-xs font-medium ${
                      row.required ? 'text-[#00D68F]' : 'text-[#4A6180]'
                    }`}
                  >
                    {row.required ? 'Yes' : 'No'}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-[#8BA3C7]">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════ SIDEBAR ══════════════════════════ */
function Sidebar({
  activeSection,
  onNavigate,
}: {
  activeSection: string
  onNavigate: (href: string) => void
}) {
  const [search, setSearch] = useState('')

  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-lg font-semibold text-[#E8EEF7]">API Docs</h2>
          <span
            className="text-[11px] text-[#4A6180] px-2 py-0.5 rounded-full"
            style={{ background: '#162544' }}
          >
            v2.1
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6180]" />
          <input
            type="text"
            placeholder="Search endpoints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs text-[#E8EEF7] placeholder-[#4A6180] rounded-lg border border-[#162544] focus:border-[#4B82FF] focus:outline-none transition-colors"
            style={{ background: '#162544' }}
          />
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {filteredSections.map((section) => (
          <div key={section.title} className="mb-4">
            <h3 className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
              {section.title}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = activeSection === item.href
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => onNavigate(item.href)}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center cursor-pointer ${
                        isActive
                          ? 'text-[#4B82FF] font-medium'
                          : 'text-[#8BA3C7] hover:text-[#E8EEF7] hover:bg-[rgba(22,37,68,0.4)]'
                      }`}
                      style={
                        isActive
                          ? {
                              background: 'var(--cobalt-glow)',
                              borderLeft: '2px solid #4B82FF',
                              marginLeft: '-2px',
                            }
                          : {}
                      }
                    >
                      {item.method && (
                        <MethodBadge method={item.method} />
                      )}
                      <span className={item.method ? 'font-mono-code text-xs' : ''}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom help section */}
      <div className="px-6 py-4 border-t border-[#162544]">
        <p className="text-sm text-[#8BA3C7]">Need help?</p>
        <a
          href="mailto:support@statementwise.ai"
          className="text-xs text-[#4B82FF] hover:text-[#78A4FF] transition-colors"
        >
          support@statementwise.ai
        </a>
      </div>
    </div>
  )
}

/* ══════════════════════════ MAIN DOCS COMPONENT ══════════════════════════ */
export default function Docs() {
  const [activeSection, setActiveSection] = useState('#overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  /* scroll spy */
  useEffect(() => {
    const sectionIds = navSections.flatMap((s) => s.items.map((i) => i.href))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
          setActiveSection(`#${top.target.id}`)
        }
      },
      { rootMargin: '-80px 0px -60% 0px' }
    )

    sectionIds.forEach((id) => {
      const el = document.querySelector(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  const handleNavigate = useCallback(
    (href: string) => {
      setActiveSection(href)
      setMobileSidebarOpen(false)
      const el = document.querySelector(href)
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    },
    []
  )

  /* ═══════════ content section wrapper ═══════════ */
  const Section = useCallback(
    ({
      id,
      title,
      description,
      children,
    }: {
      id: string
      title: string
      description?: string
      children: React.ReactNode
    }) => (
      <section id={id} className="mb-16 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#E8EEF7] mb-2">
            {title}
          </h2>
          {description && <p className="text-base text-[#8BA3C7] mb-6">{description}</p>}
          {children}
        </motion.div>
      </section>
    ),
    []
  )

  /* ═══════════ endpoint sub-section ═══════════ */
  const Endpoint = useCallback(
    ({
      id,
      method,
      path,
      description,
      children,
    }: {
      id: string
      method: string
      path: string
      description: string
      children: React.ReactNode
    }) => (
      <div id={id} className="mb-12 scroll-mt-24">
        <EndpointCard method={method} path={path} description={description} />
        <div className="mt-4 space-y-4">{children}</div>
      </div>
    ),
    []
  )

  return (
    <div className="min-h-[100dvh] bg-[#050B14]">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-[72px] left-0 right-0 z-40 h-12 flex items-center px-4 border-b border-[#162544]"
        style={{ background: 'rgba(5, 11, 20, 0.95)', backdropFilter: 'blur(16px)' }}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-sm text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors cursor-pointer"
        >
          <Menu size={18} />
          <span>Menu</span>
        </button>
        <span className="ml-auto text-xs text-[#4A6180] truncate max-w-[200px]">
          {navSections
            .flatMap((s) => s.items)
            .find((i) => i.href === activeSection)?.label || 'Overview'}
        </span>
      </div>

      <div className="flex pt-[72px]">
        {/* Desktop Sidebar */}
        <aside
          className="hidden lg:block fixed top-[72px] left-0 bottom-0 w-[280px] border-r border-[#162544] overflow-hidden"
          style={{ background: '#0B1628' }}
        >
          <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
        </aside>

        {/* Mobile Sidebar Drawer */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="fixed top-0 left-0 bottom-0 z-50 w-[280px] lg:hidden overflow-hidden"
                style={{ background: '#0B1628' }}
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#162544]">
                  <h2 className="font-display text-lg font-semibold text-[#E8EEF7]">API Docs</h2>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="text-[#E8EEF7] p-1 cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="h-[calc(100%-73px)]">
                  <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 lg:ml-[280px] px-6 sm:px-8 lg:px-12 py-8 lg:py-10 max-w-[900px]">
          {/* Extra top padding for mobile header */}
          <div className="h-8 lg:hidden" />

          {/* ──────── Overview ──────── */}
          <Section
            id="overview"
            title="API Overview"
            description="Integrate Statementwise into your applications with our REST API. Convert bank statements, manage exports, and handle client portals programmatically."
          >
            {/* Base URL */}
            <div
              className="rounded-lg border border-[#162544] px-5 py-4 mb-8"
              style={{ background: '#162544' }}
            >
              <h3 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2">
                Base URL
              </h3>
              <div className="flex items-center gap-3">
                <code
                  className="font-mono-code text-sm px-3 py-2 rounded-md border border-[#162544] flex-1"
                  style={{ background: '#050B14' }}
                >
                  https://api.statementwise.ai/v1
                </code>
                <CopyButton text="https://api.statementwise.ai/v1" />
              </div>
            </div>

            {/* Quick start cards */}
            <h3 className="font-display text-xl font-medium text-[#E8EEF7] mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: Key,
                  title: '1. Get API Key',
                  desc: 'Generate an API key from your dashboard settings.',
                  link: 'Get API Key →',
                },
                {
                  icon: Send,
                  title: '2. Make a Request',
                  desc: 'Send your first API request to convert a statement.',
                  link: 'See Authentication →',
                },
                {
                  icon: FileCheck,
                  title: '3. Handle the Response',
                  desc: 'Parse the JSON response and download your export.',
                  link: 'See Response Format →',
                },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.08,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="rounded-lg border border-[#162544] p-5 transition-all duration-200 hover:border-[rgba(75,130,255,0.3)]"
                  style={{ background: '#162544' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: 'var(--cobalt-glow)' }}
                  >
                    <card.icon size={20} className="text-[#4B82FF]" />
                  </div>
                  <h4 className="font-display text-base font-medium text-[#E8EEF7] mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#8BA3C7] mb-3">{card.desc}</p>
                  <span className="text-xs text-[#78A4FF] hover:text-[#B0CCFF] cursor-pointer transition-colors">
                    {card.link}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* SDKs */}
            <h3 className="font-display text-xl font-medium text-[#E8EEF7] mb-4">
              Official SDKs
            </h3>
            <div className="flex flex-wrap gap-3">
              {['Node.js', 'Python', 'PHP', 'Ruby', 'Go', 'cURL'].map((sdk) => (
                <span
                  key={sdk}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors cursor-pointer ${
                    sdk === 'cURL'
                      ? 'text-white border-[#4B82FF]'
                      : 'text-[#E8EEF7] border-[#162544] hover:border-[#4B82FF]'
                  }`}
                  style={sdk === 'cURL' ? { background: '#4B82FF' } : { background: '#162544' }}
                >
                  {sdk}
                </span>
              ))}
            </div>
          </Section>

          {/* ──────── Authentication ──────── */}
          <Section
            id="authentication"
            title="Authentication"
            description="All API requests require authentication using an API key. Include your key in the Authorization header."
          >
            <h3 className="font-display text-base font-medium text-[#E8EEF7] mb-2 mt-6">
              API Key
            </h3>
            <p className="text-sm text-[#8BA3C7] mb-4">
              Generate an API key from your Dashboard &rarr; Settings &rarr; API Keys. Each key is
              scoped to your account and tracks usage.
            </p>

            <CodeBlock
              language="bash"
              code={`curl https://api.statementwise.ai/v1/convert \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -H "Content-Type: application/json"`}
            />

            {/* Security warning */}
            <div
              className="mt-4 rounded-lg border px-4 py-3 flex items-start gap-3"
              style={{
                background: 'rgba(255,176,32,0.12)',
                borderColor: 'rgba(255,176,32,0.2)',
              }}
            >
              <AlertTriangle size={18} className="text-[#FFB020] mt-0.5 flex-shrink-0" />
              <p className="text-sm text-[#FFB020]">
                Keep your API key secure. Never expose it in client-side code. If compromised,
                revoke it immediately from your dashboard.
              </p>
            </div>

            {/* Rate limits */}
            <h3 className="font-display text-base font-medium text-[#E8EEF7] mb-3 mt-8">
              Rate Limits
            </h3>
            <div className="overflow-x-auto rounded-lg border border-[#162544] mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#162544]">
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
                      Plan
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
                      Requests/Min
                    </th>
                    <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
                      Burst
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { plan: 'Free', req: '100', burst: '10/min' },
                    { plan: 'Pro', req: '1,000', burst: '100/min' },
                    { plan: 'Business', req: '10,000', burst: '500/min' },
                  ].map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors"
                    >
                      <td className="px-4 py-2.5 text-[#E8EEF7]">{r.plan}</td>
                      <td className="px-4 py-2.5 text-[#8BA3C7]">{r.req}</td>
                      <td className="px-4 py-2.5 text-[#8BA3C7]">{r.burst}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-[#8BA3C7] mb-3">
              Rate limit headers are included in every response:
            </p>
            <CodeBlock
              language="http"
              code={`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1704153600`}
            />
          </Section>

          {/* ──────── Upload Statement ──────── */}
          <Endpoint
            id="upload"
            method="POST"
            path="/convert"
            description="Upload a bank statement PDF for AI extraction."
          >
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2">
              Request
            </h4>
            <p className="text-xs text-[#8BA3C7] mb-3">
              Content-Type:{' '}
              <code className="font-mono-code text-xs px-1.5 py-0.5 rounded bg-[#162544]">
                multipart/form-data
              </code>
            </p>
            <ParamTable
              rows={[
                {
                  name: 'file',
                  type: 'File',
                  required: true,
                  description: 'PDF bank statement (max 50MB)',
                },
                {
                  name: 'callback_url',
                  type: 'string',
                  required: false,
                  description: 'Webhook URL for status updates',
                },
                {
                  name: 'metadata',
                  type: 'object',
                  required: false,
                  description: 'Custom key-value pairs',
                },
              ]}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Example Request
            </h4>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://api.statementwise.ai/v1/convert \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -F "file=@/path/to/statement.pdf" \\
  -F "metadata={\\"client_id\\": \\"acme_123\\"}"`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Response (201 Created)
            </h4>
            <CodeBlock
              language="json"
              code={`{
  "id": "conv_abc123",
  "status": "processing",
  "file_name": "Chase_Statement_Mar2025.pdf",
  "file_size": 2457600,
  "pages": 3,
  "credits_used": 3,
  "created_at": "2025-03-15T14:30:00Z",
  "callback_url": null,
  "metadata": {
    "client_id": "acme_123"
  }
}`}
            />
          </Endpoint>

          {/* ──────── Get Status ──────── */}
          <Endpoint
            id="status"
            method="GET"
            path="/convert/{id}"
            description="Get the extraction status of a conversion job."
          >
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-4">
              Path Parameters
            </h4>
            <ParamTable
              rows={[
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Conversion ID (e.g., conv_abc123)',
                },
              ]}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Example Request
            </h4>
            <CodeBlock
              language="bash"
              code={`curl https://api.statementwise.ai/v1/convert/conv_abc123 \\
  -H "Authorization: Bearer sw_your_api_key"`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Response (200 OK)
            </h4>
            <CodeBlock
              language="json"
              code={`{
  "id": "conv_abc123",
  "status": "completed",
  "progress": 100,
  "pages": 3,
  "transactions": 47,
  "file_name": "Chase_Statement_Mar2025.pdf",
  "credits_used": 3,
  "created_at": "2025-03-15T14:30:00Z",
  "completed_at": "2025-03-15T14:30:08Z"
}`}
            />
          </Endpoint>

          {/* ──────── Retrieve Results ──────── */}
          <Endpoint
            id="results"
            method="GET"
            path="/convert/{id}/results"
            description="Retrieve the extracted transactions from a completed conversion."
          >
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-4">
              Path Parameters
            </h4>
            <ParamTable
              rows={[
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Conversion ID (e.g., conv_abc123)',
                },
              ]}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Example Request
            </h4>
            <CodeBlock
              language="bash"
              code={`curl https://api.statementwise.ai/v1/convert/conv_abc123/results \\
  -H "Authorization: Bearer sw_your_api_key"`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Response (200 OK)
            </h4>
            <CodeBlock
              language="json"
              code={`{
  "conversion_id": "conv_abc123",
  "transactions": [
    {
      "id": "txn_001",
      "date": "2025-03-01",
      "description": "PAYROLL DEPOSIT - ACME CORP",
      "type": "deposit",
      "amount": 4250.00,
      "balance": 16700.00,
      "confidence": 0.998
    },
    {
      "id": "txn_002",
      "date": "2025-03-02",
      "description": "AMAZON.COM*Z23X9KL",
      "type": "withdrawal",
      "amount": -127.43,
      "balance": 16572.57,
      "confidence": 0.995
    }
  ],
  "reconciliation": {
    "opening_balance": 12450.00,
    "total_deposits": 18750.00,
    "total_withdrawals": 14500.00,
    "closing_balance": 16700.00,
    "is_reconciled": true,
    "discrepancy": 0.00
  }
}`}
            />
          </Endpoint>

          {/* ──────── Export Formats ──────── */}
          <Endpoint
            id="export"
            method="POST"
            path="/convert/{id}/export"
            description="Export a completed conversion to your preferred accounting format."
          >
            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-4">
              Path Parameters
            </h4>
            <ParamTable
              rows={[
                {
                  name: 'id',
                  type: 'string',
                  required: true,
                  description: 'Conversion ID (e.g., conv_abc123)',
                },
              ]}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Request Body
            </h4>
            <ParamTable
              rows={[
                {
                  name: 'format',
                  type: 'string',
                  required: true,
                  description: 'One of: csv, xlsx, qbo, ofx, json',
                },
                {
                  name: 'options.include_balance',
                  type: 'boolean',
                  required: false,
                  description: 'Include running balance (default: true)',
                },
                {
                  name: 'options.date_format',
                  type: 'string',
                  required: false,
                  description: 'Date format: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD',
                },
              ]}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Example Request
            </h4>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://api.statementwise.ai/v1/convert/conv_abc123/export \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "format": "qbo",
    "options": {
      "include_balance": true,
      "date_format": "MM/DD/YYYY"
    }
  }'`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Response (202 Accepted)
            </h4>
            <CodeBlock
              language="json"
              code={`{
  "id": "exp_xyz789",
  "conversion_id": "conv_abc123",
  "status": "processing",
  "format": "qbo",
  "download_url": null,
  "created_at": "2025-03-15T14:31:00Z"
}`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Supported Formats
            </h4>
            <div className="flex flex-wrap gap-2">
              {['csv', 'xlsx', 'qbo', 'ofx', 'json'].map((fmt) => (
                <span
                  key={fmt}
                  className="px-3 py-1.5 rounded-md text-xs font-mono-code text-[#B0CCFF] border border-[#162544]"
                  style={{ background: '#162544' }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </Endpoint>

          {/* ──────── Client Portals ──────── */}
          <Section
            id="create-portal"
            title="Client Portals"
            description="Create and manage secure client upload portals programmatically."
          >
            {/* Create Portal */}
            <div id="create-portal-sub" className="mb-12 scroll-mt-24">
              <EndpointCard
                method="POST"
                path="/portals"
                description="Create a new client portal."
              />
              <div className="mt-4 space-y-4">
                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2">
                  Request Body
                </h4>
                <ParamTable
                  rows={[
                    {
                      name: 'name',
                      type: 'string',
                      required: true,
                      description: 'Portal name (e.g., "Acme Corporation")',
                    },
                    {
                      name: 'slug',
                      type: 'string',
                      required: true,
                      description: 'URL-safe identifier (e.g., "acme-corp")',
                    },
                    {
                      name: 'folder_name',
                      type: 'string',
                      required: false,
                      description: 'Default folder for uploads',
                    },
                    {
                      name: 'settings.require_password',
                      type: 'boolean',
                      required: false,
                      description: 'Require password for access',
                    },
                    {
                      name: 'settings.allow_downloads',
                      type: 'boolean',
                      required: false,
                      description: 'Allow clients to download files',
                    },
                  ]}
                />

                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
                  Example Request
                </h4>
                <CodeBlock
                  language="bash"
                  code={`curl -X POST https://api.statementwise.ai/v1/portals \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "folder_name": "Bank Statements 2025",
    "settings": {
      "require_password": true,
      "allow_downloads": true,
      "email_notifications": false
    }
  }'`}
                />

                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
                  Response (201 Created)
                </h4>
                <CodeBlock
                  language="json"
                  code={`{
  "id": "portal_abc123",
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "url": "https://statementwise.ai/p/acme-corp",
  "upload_url": "https://statementwise.ai/p/acme-corp/upload",
  "settings": {
    "require_password": true,
    "allow_downloads": true,
    "email_notifications": false
  },
  "created_at": "2025-03-15T14:30:00Z"
}`}
                />
              </div>
            </div>

            {/* List Portals */}
            <div id="list-portals" className="mb-12 scroll-mt-24">
              <EndpointCard
                method="GET"
                path="/portals"
                description="List all client portals for your account."
              />
              <div className="mt-4">
                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
                  Response (200 OK)
                </h4>
                <CodeBlock
                  language="json"
                  code={`{
  "portals": [
    {
      "id": "portal_abc123",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "url": "https://statementwise.ai/p/acme-corp",
      "created_at": "2025-03-15T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 20,
    "offset": 0
  }
}`}
                />
              </div>
            </div>

            {/* Upload to Portal */}
            <div id="upload-portal" className="mb-12 scroll-mt-24">
              <EndpointCard
                method="POST"
                path="/portals/{id}/uploads"
                description="Upload a statement to a client portal."
              />
              <div className="mt-4 space-y-4">
                <ParamTable
                  rows={[
                    {
                      name: 'id',
                      type: 'string',
                      required: true,
                      description: 'Portal ID',
                    },
                    {
                      name: 'file',
                      type: 'File',
                      required: true,
                      description: 'PDF bank statement',
                    },
                  ]}
                />

                <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
                  Example Request
                </h4>
                <CodeBlock
                  language="bash"
                  code={`curl -X POST https://api.statementwise.ai/v1/portals/portal_abc123/uploads \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -F "file=@/path/to/statement.pdf"`}
                />
              </div>
            </div>
          </Section>

          {/* ──────── Webhooks ──────── */}
          <Section
            id="webhooks-config"
            title="Webhooks"
            description="Receive real-time notifications when conversions complete."
          >
            <h3 className="font-display text-base font-medium text-[#E8EEF7] mb-3">
              Configuration
            </h3>
            <p className="text-sm text-[#8BA3C7] mb-4">
              Register webhook URLs to receive event notifications. Each webhook endpoint receives
              a signed payload that you can verify.
            </p>

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-6">
              Register Webhook
            </h4>
            <CodeBlock
              language="bash"
              code={`curl -X POST https://api.statementwise.ai/v1/webhooks \\
  -H "Authorization: Bearer sw_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks/statementwise",
    "events": ["conversion.completed", "conversion.failed"],
    "secret": "whsec_your_webhook_secret"
  }'`}
            />

            <h4 className="font-display text-xs font-semibold uppercase tracking-[0.06em] text-[#E8EEF7] mb-2 mt-8">
              Webhook Payload
            </h4>
            <CodeBlock
              language="json"
              title="conversion.completed"
              code={`{
  "event": "conversion.completed",
  "timestamp": "2025-03-15T14:30:08Z",
  "data": {
    "conversion_id": "conv_abc123",
    "status": "completed",
    "transactions_count": 47,
    "pages_processed": 3,
    "reconciliation": {
      "is_reconciled": true,
      "discrepancy": 0.00
    }
  }
}`}
            />

            {/* Events list */}
            <h3
              id="webhooks-events"
              className="font-display text-base font-medium text-[#E8EEF7] mb-3 mt-10 scroll-mt-24"
            >
              Events
            </h3>
            <div className="space-y-2">
              {[
                {
                  event: 'conversion.started',
                  desc: 'A new conversion job has started processing.',
                },
                {
                  event: 'conversion.completed',
                  desc: 'A conversion has finished successfully.',
                },
                {
                  event: 'conversion.failed',
                  desc: 'A conversion could not be completed.',
                },
                {
                  event: 'export.completed',
                  desc: 'An export file is ready for download.',
                },
                {
                  event: 'portal.upload.received',
                  desc: 'A new file was uploaded to a client portal.',
                },
              ].map((ev, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-[#162544] px-4 py-3"
                  style={{ background: '#162544' }}
                >
                  <code className="font-mono-code text-xs text-[#00D68F] flex-shrink-0 mt-0.5">
                    {ev.event}
                  </code>
                  <span className="text-sm text-[#8BA3C7]">{ev.desc}</span>
                </div>
              ))}
            </div>

            {/* Signature verification */}
            <h3 className="font-display text-base font-medium text-[#E8EEF7] mb-3 mt-8">
              Signature Verification
            </h3>
            <p className="text-sm text-[#8BA3C7] mb-4">
              Verify webhook signatures using your webhook secret:
            </p>
            <CodeBlock
              language="javascript"
              title="verify-signature.js"
              code={`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}
            />
          </Section>

          {/* Bottom spacer */}
          <div className="h-20" />
        </main>
      </div>
    </div>
  )
}

/* ══════════════════════════ COPY BUTTON HELPER ══════════════════════════ */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="text-[#4A6180] hover:text-[#E8EEF7] transition-colors duration-200 cursor-pointer p-1"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check size={16} className="text-[#00D68F]" /> : <Copy size={16} />}
    </button>
  )
}
