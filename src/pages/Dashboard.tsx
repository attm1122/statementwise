import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router'
import CountUp from 'react-countup'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  CreditCard,
  Settings,
  Bell,
  Plus,
  FileText,
  MoreHorizontal,
  FileUp,
  ShieldCheck,
  KeyRound,
  BookOpen,
  ChevronRight,
  FileCheck,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

/* ─── easing ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ─── sidebar nav items ─── */
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', active: true, href: '/dashboard' },
  { icon: ArrowLeftRight, label: 'Conversions', active: false, href: '#' },
  { icon: Users, label: 'Client Portals', active: false, href: '/portal' },
  { icon: CreditCard, label: 'Billing & Credits', active: false, href: '#' },
  { icon: KeyRound, label: 'API Keys', active: false, href: '#' },
  { icon: Settings, label: 'Settings', active: false, href: '#' },
]

/* ─── sparkline data ─── */
const sparklineData1 = [45, 52, 48, 61, 72, 68, 79, 85, 92, 88, 95, 102]
const sparklineData2 = [120, 135, 128, 156, 172, 168, 190, 210, 225, 218, 240, 265]

/* ─── usage chart data ─── */
const usageChartData = [
  { date: 'Jan 1', pages: 45, conversions: 8 },
  { date: 'Jan 5', pages: 78, conversions: 12 },
  { date: 'Jan 10', pages: 62, conversions: 10 },
  { date: 'Jan 15', pages: 120, conversions: 15 },
  { date: 'Jan 20', pages: 95, conversions: 11 },
  { date: 'Jan 25', pages: 145, conversions: 18 },
  { date: 'Jan 30', pages: 180, conversions: 20 },
  { date: 'Feb 5', pages: 88, conversions: 9 },
  { date: 'Feb 10', pages: 110, conversions: 14 },
  { date: 'Feb 15', pages: 134, conversions: 16 },
  { date: 'Feb 20', pages: 168, conversions: 19 },
  { date: 'Feb 25', pages: 195, conversions: 22 },
  { date: 'Mar 1', pages: 72, conversions: 8 },
  { date: 'Mar 5', pages: 105, conversions: 13 },
  { date: 'Mar 10', pages: 128, conversions: 15 },
  { date: 'Mar 15', pages: 156, conversions: 17 },
  { date: 'Mar 20', pages: 189, conversions: 21 },
  { date: 'Mar 25', pages: 210, conversions: 23 },
  { date: 'Apr 1', pages: 85, conversions: 10 },
  { date: 'Apr 5', pages: 118, conversions: 14 },
  { date: 'Apr 10', pages: 142, conversions: 16 },
  { date: 'Apr 15', pages: 175, conversions: 20 },
  { date: 'Apr 20', pages: 198, conversions: 22 },
  { date: 'Apr 25', pages: 225, conversions: 25 },
  { date: 'May 1', pages: 68, conversions: 9 },
  { date: 'May 5', pages: 92, conversions: 12 },
  { date: 'May 10', pages: 115, conversions: 15 },
  { date: 'May 15', pages: 148, conversions: 18 },
  { date: 'May 20', pages: 172, conversions: 20 },
  { date: 'May 25', pages: 205, conversions: 24 },
]

/* ─── credit donut data ─── */
const creditData = [
  { name: 'Used', value: 1260, color: '#4B82FF' },
  { name: 'Remaining', value: 1240, color: '#00D68F' },
]

/* ─── recent conversions data ─── */
const recentConversions = [
  { file: 'Chase_Statement_Mar2025.pdf', size: '2.4 MB', bank: 'Chase', pages: 4, transactions: 47, status: 'Completed', date: '2 min ago' },
  { file: 'BofA_Q1_2025.pdf', size: '5.1 MB', bank: 'Bank of America', pages: 8, transactions: 112, status: 'Completed', date: '1 hr ago' },
  { file: 'WellsFargo_Business_Feb.pdf', size: '3.8 MB', bank: 'Wells Fargo', pages: 6, transactions: 89, status: 'Flagged', date: '3 hrs ago' },
  { file: 'HSBC_International_0325.pdf', size: '1.2 MB', bank: 'HSBC', pages: 2, transactions: 23, status: 'Completed', date: 'Yesterday' },
  { file: 'Citi_Personal_Jan2025.pdf', size: '4.5 MB', bank: 'Citibank', pages: 7, transactions: 156, status: 'Completed', date: 'Yesterday' },
]

/* ─── activity feed data ─── */
const activityFeed = [
  { icon: FileCheck, iconBg: 'rgba(0,214,143,0.15)', iconColor: '#00D68F', text: 'Chase_Statement_Mar2025.pdf converted', detail: '47 transactions extracted \u00b7 99.8% accuracy', time: '2 min ago' },
  { icon: Download, iconBg: 'rgba(75,130,255,0.15)', iconColor: '#4B82FF', text: 'Exported to QBO format', detail: 'Chase_Statement_Mar2025.qbo \u00b7 12 KB', time: '1 min ago' },
  { icon: Users, iconBg: 'rgba(255,176,32,0.15)', iconColor: '#FFB020', text: 'Client portal created', detail: 'Portal: Acme Corp \u00b7 3 users invited', time: '3 hrs ago' },
  { icon: FileCheck, iconBg: 'rgba(0,214,143,0.15)', iconColor: '#00D68F', text: 'BofA_Q1_2025.pdf converted', detail: '112 transactions extracted', time: '1 hr ago' },
  { icon: CreditCard, iconBg: 'rgba(120,164,255,0.15)', iconColor: '#78A4FF', text: 'Credits topped up', detail: '+500 credits \u00b7 $15.00', time: 'Yesterday' },
]

/* ─── quick actions data ─── */
const quickActions = [
  { icon: FileUp, iconColor: '#4B82FF', bg: 'rgba(75,130,255,0.15)', label: 'Convert New Statement', sub: 'Upload a PDF to extract', href: '/convert' },
  { icon: ShieldCheck, iconColor: '#00D68F', bg: 'rgba(0,214,143,0.15)', label: 'Create Client Portal', sub: 'Set up a client workspace', href: '/portal' },
  { icon: KeyRound, iconColor: '#FFB020', bg: 'rgba(255,176,32,0.15)', label: 'Generate API Key', sub: 'Create a new API credential', href: '#' },
  { icon: BookOpen, iconColor: '#78A4FF', bg: 'rgba(120,164,255,0.15)', label: 'View Documentation', sub: 'Learn how to use the API', href: '/docs' },
]

/* ─── sparkline component ─── */
function MiniSparkline({ data, color, width = 80, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={width} cy={parseFloat(points.split(' ').pop()?.split(',')[1] || '0')} r={3} fill={color} />
    </svg>
  )
}

/* ─── custom recharts tooltip ─── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#162544] border border-[#162544] rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[11px] font-medium text-[#8BA3C7] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-[#E8EEF7]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === 'pages' ? 'Pages' : 'Conversions'}: {entry.value}
        </div>
      ))}
    </div>
  )
}

/* ─── stat card ─── */
function StatCard({ label, value, suffix, prefix, sparklineData, sparklineColor, changeText, changePositive, subtext, icon, delay }: {
  label: string
  value: number
  suffix?: string
  prefix?: string
  sparklineData?: number[]
  sparklineColor?: string
  changeText?: string
  changePositive?: boolean
  subtext?: string
  icon?: React.ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: easeOutExpo }}
      className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260] hover:-translate-y-0.5"
      style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-[11px] font-medium text-[#4A6180] tracking-[0.04em] uppercase">{label}</span>
        {icon}
      </div>
      <div className="text-[32px] font-medium text-[#E8EEF7] font-display tracking-tight leading-tight">
        <CountUp end={value} duration={1.5} separator="," prefix={prefix} suffix={suffix} />
      </div>
      <div className="flex items-center justify-between mt-2">
        {changeText && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${changePositive ? 'text-[#00D68F]' : 'text-[#FF4D6A]'}`}>
            <TrendingUp size={12} />
            {changeText}
          </div>
        )}
        {subtext && <span className="text-[11px] text-[#4A6180]">{subtext}</span>}
        {sparklineData && sparklineColor && (
          <MiniSparkline data={sparklineData} color={sparklineColor} />
        )}
      </div>
    </motion.div>
  )
}

/* ─── status badge ─── */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    Completed: { bg: 'rgba(0,214,143,0.12)', text: '#00D68F', border: 'rgba(0,214,143,0.2)' },
    Flagged: { bg: 'rgba(255,176,32,0.12)', text: '#FFB020', border: 'rgba(255,176,32,0.2)' },
    Processing: { bg: 'rgba(75,130,255,0.12)', text: '#4B82FF', border: 'rgba(75,130,255,0.2)' },
    'In Review': { bg: 'rgba(255,176,32,0.12)', text: '#FFB020', border: 'rgba(255,176,32,0.2)' },
  }
  const c = config[status] || config.Completed
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {status === 'Completed' && <CheckCircle2 size={12} />}
      {status === 'Flagged' && <Clock size={12} />}
      {status}
    </span>
  )
}

/* ─── main dashboard component ─── */
export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleResize = useCallback(() => {
    setSidebarCollapsed(window.innerWidth < 1024 && window.innerWidth >= 640)
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  const sidebarWidth = sidebarCollapsed ? 64 : 200

  return (
    <div className="min-h-[100dvh] bg-[#050B14] flex">
      {/* ─── Left Sidebar ─── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="fixed left-0 top-0 h-screen border-r border-[#162544] z-40 flex flex-col transition-all duration-300"
        style={{ width: sidebarWidth, background: '#0B1628' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center" style={{ height: 72 }}>
          <Link to="/" className="font-display font-semibold text-base text-[#E8EEF7] truncate">
            {!sidebarCollapsed && 'Statementwise.ai'}
            {sidebarCollapsed && 'SW'}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 mt-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.active
                    ? 'bg-[#162544] text-[#E8EEF7] border-l-2 border-[#4B82FF]'
                    : 'text-[#8BA3C7] hover:bg-[rgba(22,37,68,0.4)] hover:text-[#E8EEF7]'
                }`}
                style={item.active ? { marginLeft: -1 } : {}}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span className="font-body">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 mt-auto">
          <div className="bg-[#162544] border border-[#162544] rounded-lg p-4">
            <span className="text-[11px] text-[#4A6180] font-medium tracking-wide">Credits</span>
            <div className="text-xl font-medium text-[#E8EEF7] font-display mt-0.5">1,240</div>
            <button className="text-[11px] text-[#4B82FF] hover:text-[#78A4FF] mt-1 transition-colors">Top Up &rarr;</button>
          </div>
          <div className="flex items-center gap-3 mt-3 px-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4B82FF] to-[#00D68F] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-white">MT</span>
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="text-sm text-[#E8EEF7] truncate">Michael Torres</div>
                <div className="text-[11px] text-[#4A6180]">Pro Plan</div>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 transition-all duration-300" style={{ marginLeft: sidebarWidth }}>
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 lg:px-10 py-4"
          style={{ minHeight: 64 }}
        >
          <h1 className="font-display text-[28px] sm:text-[32px] font-medium text-[#E8EEF7] tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-3">
            <select className="bg-[#162544] border border-[#162544] text-[#8BA3C7] text-sm rounded-lg px-3 py-2 outline-none focus:border-[#4B82FF] transition-colors cursor-pointer">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
            <button className="relative p-2 text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D6A] rounded-full" />
            </button>
            <button
              onClick={() => navigate('/convert')}
              className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 hover:brightness-115 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
            >
              <Plus size={16} />
              New Conversion
            </button>
          </div>
        </motion.div>

        {/* ─── Page Content ─── */}
        <div className="px-6 lg:px-10 pb-10 space-y-8">
          {/* Section 1: Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              label="Total Conversions"
              value={247}
              delay={0}
              sparklineData={sparklineData1}
              sparklineColor="#4B82FF"
              changeText="+12%"
              changePositive
            />
            <StatCard
              label="Pages Processed"
              value={3842}
              delay={0.1}
              sparklineData={sparklineData2}
              sparklineColor="#00D68F"
              changeText="+28%"
              changePositive
            />
            <StatCard
              label="Credits Remaining"
              value={1240}
              delay={0.2}
              changeText="of 2,500/month"
              changePositive
            />
            <StatCard
              label="Success Rate"
              value={99.7}
              suffix="%"
              delay={0.3}
              sparklineColor="#00D68F"
              changeText="+0.2%"
              changePositive
            />
          </div>

          {/* Section 2: Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
            className="rounded-xl border border-[#162544] p-5 lg:p-6 transition-all duration-350 hover:border-[#1E3260]"
            style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-medium text-[#E8EEF7]">Usage Over Time</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4B82FF]" />
                  <span className="text-[11px] text-[#4A6180] font-medium">Pages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D68F]" />
                  <span className="text-[11px] text-[#4A6180] font-medium">Conversions</span>
                </div>
              </div>
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pagesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4B82FF" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#4B82FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D68F" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#00D68F" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(22,37,68,0.5)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#4A6180', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#4A6180', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="pages" stroke="#4B82FF" strokeWidth={2} fill="url(#pagesGrad)" />
                  <Area type="monotone" dataKey="conversions" stroke="#00D68F" strokeWidth={2} strokeDasharray="6 3" fill="url(#convGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Section 3 & 4: Two-column layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Recent Conversions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
              className="xl:col-span-2 rounded-xl border border-[#162544] overflow-hidden transition-all duration-350 hover:border-[#1E3260]"
              style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(22,37,68,0.5)]">
                <h2 className="font-display text-lg font-medium text-[#E8EEF7]">Recent Conversions</h2>
                <Link to="#" className="text-sm text-[#78A4FF] hover:text-[#B0CCFF] transition-colors">View All &rarr;</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#162544]">
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">File</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden md:table-cell">Bank</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Pages</th>
                      <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden sm:table-cell">Transactions</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden lg:table-cell">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentConversions.map((row, i) => (
                      <motion.tr
                        key={row.file}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.05, ease: easeOutExpo }}
                        className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-[#4B82FF] flex-shrink-0" />
                            <div>
                              <div className="text-sm text-[#E8EEF7] truncate max-w-[200px]">{row.file}</div>
                              <div className="text-[11px] text-[#4A6180]">{row.size}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#8BA3C7] hidden md:table-cell">{row.bank}</td>
                        <td className="px-4 py-3 text-sm text-[#8BA3C7] text-right">{row.pages}</td>
                        <td className="px-4 py-3 text-sm text-[#E8EEF7] text-right hidden sm:table-cell">{row.transactions}</td>
                        <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                        <td className="px-4 py-3 text-[11px] text-[#4A6180] hidden lg:table-cell">{row.date}</td>
                        <td className="px-4 py-3">
                          <button className="text-[#4A6180] hover:text-[#E8EEF7] transition-colors p-1">
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Right column: Quick Actions + Credit */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: easeOutExpo }}
                className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260]"
                style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
              >
                <h2 className="font-display text-lg font-medium text-[#E8EEF7] mb-4">Quick Actions</h2>
                <div className="space-y-1">
                  {quickActions.map((action, i) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.08, ease: easeOutExpo }}
                      >
                        <Link
                          to={action.href}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#162544] transition-colors group cursor-pointer"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: action.bg }}>
                            <Icon size={20} style={{ color: action.iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-[#E8EEF7] font-medium">{action.label}</div>
                            <div className="text-[11px] text-[#4A6180]">{action.sub}</div>
                          </div>
                          <ChevronRight size={16} className="text-[#4A6180] group-hover:text-[#E8EEF7] transition-colors flex-shrink-0" />
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Credit Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: easeOutExpo }}
                className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260]"
                style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
              >
                <h2 className="font-display text-lg font-medium text-[#E8EEF7] mb-3">Credit Usage</h2>
                <div className="flex items-center justify-center" style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={creditData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {creditData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <text x="50%" y="46%" textAnchor="middle" fill="#E8EEF7" fontSize={22} fontWeight={500} fontFamily="Space Grotesk, system-ui, sans-serif">
                        2,500
                      </text>
                      <text x="50%" y="60%" textAnchor="middle" fill="#4A6180" fontSize={11} fontFamily="Inter, system-ui, sans-serif">
                        monthly
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4B82FF]" />
                    <span className="text-sm text-[#8BA3C7]">Used: 1,260</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00D68F]" />
                    <span className="text-sm text-[#8BA3C7]">Remaining: 1,240</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-[#4A6180] mb-1.5">
                    <span>Pro Plan &mdash; 50% used</span>
                  </div>
                  <div className="h-1.5 bg-[#162544] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 0.8, delay: 0.6, ease: easeOutExpo }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
                    />
                  </div>
                </div>
                <button className="w-full mt-4 py-2.5 rounded-lg border border-[#162544] text-sm font-medium text-[#E8EEF7] hover:bg-[#162544] hover:border-[#1E3260] transition-all duration-200">
                  Top Up Credits
                </button>
              </motion.div>
            </div>
          </div>

          {/* Section 5: Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: easeOutExpo }}
            className="rounded-xl border border-[#162544] p-5 lg:p-6 transition-all duration-350 hover:border-[#1E3260]"
            style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-[#E8EEF7]">Recent Activity</h2>
              <Link to="#" className="text-sm text-[#78A4FF] hover:text-[#B0CCFF] transition-colors">View All &rarr;</Link>
            </div>
            <div>
              {activityFeed.map((activity, i) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.45 + i * 0.08, ease: easeOutExpo }}
                    className="flex items-start gap-4 py-4 border-b border-[rgba(22,37,68,0.5)] last:border-b-0"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: activity.iconBg }}
                    >
                      <Icon size={18} style={{ color: activity.iconColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#E8EEF7]">{activity.text}</p>
                      <p className="text-[11px] text-[#4A6180] mt-0.5">{activity.detail}</p>
                    </div>
                    <span className="text-[11px] text-[#4A6180] flex-shrink-0">{activity.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
