import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router'
import CountUp from 'react-countup'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Users,
  CreditCard,
  Settings,
  Plus,
  Search,
  Upload,
  Clock,
  Link as LinkIcon,
  Settings2,
  ExternalLink,
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Pencil,
  Eye,
  ChevronDown,
  MoreHorizontal,
  FileText,
  Bell,
  KeyRound,
  Shield,
  AlertTriangle,
} from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import { useSecurity } from '@/components/SecurityProvider'
import { auditLogger } from '@/lib/audit'
import { validatePortalSlug, validateCompanyName, encodeHtml } from '@/lib/validation'

/* ─── easing ─── */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ─── sidebar nav items (shared with Dashboard) ─── */
const sidebarItems = [
  { icon: LayoutDashboard, label: 'Overview', active: false, href: '/dashboard' },
  { icon: ArrowLeftRight, label: 'Conversions', active: false, href: '#' },
  { icon: Users, label: 'Client Portals', active: true, href: '/portal' },
  { icon: CreditCard, label: 'Billing & Credits', active: false, href: '#' },
  { icon: KeyRound, label: 'API Keys', active: false, href: '#' },
  { icon: Settings, label: 'Settings', active: false, href: '#' },
]

/* ─── portal data ─── */
const portalsData = [
  {
    name: 'Acme Corporation',
    slug: 'acme-corp',
    uploads: 43,
    teamSize: 5,
    initials: 'AC',
    activeAgo: '2 hours ago',
    recentFiles: ['Chase_Mar.pdf', 'BofA_Q1.pdf', 'WellsFargo_Feb.pdf'],
    status: 'active' as const,
    created: 'Mar 15, 2025',
  },
  {
    name: 'Smith Family Trust',
    slug: 'smith-trust',
    uploads: 28,
    teamSize: 2,
    initials: 'ST',
    activeAgo: '1 day ago',
    recentFiles: ['Chase_Personal_Mar.pdf'],
    status: 'active' as const,
    created: 'Feb 28, 2025',
  },
  {
    name: 'Johnson & Associates CPA',
    slug: 'johnson-cpa',
    uploads: 67,
    teamSize: 8,
    initials: 'JC',
    activeAgo: '30 min ago',
    recentFiles: ['HSBC_Intl_Q1.pdf', 'Citi_Business_Feb.pdf', 'Chase_Mar.pdf'],
    status: 'active' as const,
    created: 'Jan 10, 2025',
  },
  {
    name: 'Meridian Properties LLC',
    slug: 'meridian-llc',
    uploads: 18,
    teamSize: 3,
    initials: 'MP',
    activeAgo: '5 hours ago',
    recentFiles: ['WellsFargo_Business.pdf'],
    status: 'active' as const,
    created: 'Apr 2, 2025',
  },
]

/* ─── recent uploads data ─── */
const recentUploads = [
  { file: 'Chase_March2025.pdf', size: '2.4 MB', client: 'Acme Corp', portal: 'acme-corp', pages: 4, status: 'Pending', uploaded: '10 min ago', initials: 'AC' },
  { file: 'BofA_Q1_Complete.pdf', size: '5.1 MB', client: 'Meridian Fin', portal: 'meridian-llc', pages: 8, status: 'Processed', uploaded: '1 hr ago', initials: 'MF' },
  { file: 'WellsFargo_Business.pdf', size: '3.8 MB', client: 'Johnson CPA', portal: 'johnson-cpa', pages: 6, status: 'Converting', uploaded: '30 min ago', initials: 'JC' },
  { file: 'HSBC_International.pdf', size: '1.2 MB', client: 'Smith Trust', portal: 'smith-trust', pages: 2, status: 'Processed', uploaded: '3 hrs ago', initials: 'ST' },
  { file: 'Citi_Personal_Mar.pdf', size: '4.5 MB', client: 'Acme Corp', portal: 'acme-corp', pages: 7, status: 'Pending', uploaded: '2 hrs ago', initials: 'AC' },
  { file: 'Chase_Business_Q1.pdf', size: '6.2 MB', client: 'Johnson CPA', portal: 'johnson-cpa', pages: 12, status: 'Processed', uploaded: '5 hrs ago', initials: 'JC' },
]

/* ─── team members data ─── */
const teamMembersData = [
  { name: 'Michael Torres', email: 'michael@firm.com', role: 'Admin', portals: 'All (12)', active: 'Now', color: '#4B82FF' },
  { name: 'Sarah Chen', email: 'sarah@firm.com', role: 'Editor', portals: '6 portals', active: '2h ago', color: '#00D68F' },
  { name: 'James Park', email: 'james@firm.com', role: 'Editor', portals: '4 portals', active: '1d ago', color: '#FFB020' },
  { name: 'Patricia Williams', email: 'patricia@firm.com', role: 'Viewer', portals: '3 portals', active: '3h ago', color: '#FF4D6A' },
]

/* ─── status badge for uploads ─── */
function UploadStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; border: string; spin?: boolean }> = {
    Pending: { bg: 'rgba(255,176,32,0.12)', text: '#FFB020', border: 'rgba(255,176,32,0.2)' },
    Converting: { bg: 'rgba(75,130,255,0.12)', text: '#4B82FF', border: 'rgba(75,130,255,0.2)', spin: true },
    Processed: { bg: 'rgba(0,214,143,0.12)', text: '#00D68F', border: 'rgba(0,214,143,0.2)' },
    Failed: { bg: 'rgba(255,77,106,0.12)', text: '#FF4D6A', border: 'rgba(255,77,106,0.2)' },
  }
  const c = configs[status] || configs.Processed
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {status === 'Converting' && <Loader2 size={12} className="animate-spin" />}
      {status === 'Processed' && <CheckCircle2 size={12} />}
      {status}
    </span>
  )
}

/* ─── portal card ─── */
function PortalCard({ portal, index }: { portal: typeof portalsData[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 + index * 0.08, ease: easeOutExpo }}
      className="rounded-[14px] border border-[#162544] overflow-hidden transition-all duration-350 hover:border-[rgba(75,130,255,0.2)] hover:-translate-y-[3px] cursor-pointer"
      style={{
        background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)',
      }}
    >
      {/* Top section */}
      <div className="px-5 py-4 border-b border-[rgba(22,37,68,0.5)]">
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-display font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #00D68F 100%)' }}
          >
            {portal.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-medium text-[#E8EEF7] truncate">{portal.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: portal.status === 'active' ? '#00D68F' : '#4A6180' }}
                />
              </div>
            </div>
            <p className="text-[11px] text-[#4A6180] truncate">statementwise.ai/p/{portal.slug}</p>
          </div>
        </div>
      </div>

      {/* Middle section */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-5 text-sm text-[#8BA3C7]">
          <div className="flex items-center gap-1.5">
            <Upload size={14} />
            <span>{portal.uploads} uploads</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={14} />
            <span>{portal.teamSize} team</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{portal.activeAgo}</span>
          </div>
        </div>

        {/* Recent files */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {portal.recentFiles.map((f, i) => (
            <span key={i} className="text-[11px] text-[#8BA3C7] bg-[#162544] px-2 py-1 rounded-md truncate max-w-[120px]">
              {f}
            </span>
          ))}
        </div>

        {/* Team avatars */}
        <div className="flex items-center mt-3">
          {Array.from({ length: Math.min(portal.teamSize, 4) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: 0.3 + i * 0.05, type: 'spring', stiffness: 300 }}
              className="w-6 h-6 rounded-full border-2 border-[#0B1628] flex items-center justify-center text-[10px] font-semibold text-white"
              style={{
                marginLeft: i === 0 ? 0 : -8,
                background: ['#4B82FF', '#00D68F', '#FFB020', '#FF4D6A'][i % 4],
              }}
            >
              {String.fromCharCode(65 + i)}
            </motion.div>
          ))}
          {portal.teamSize > 4 && (
            <span className="text-[11px] text-[#4A6180] ml-1">+{portal.teamSize - 4}</span>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="px-5 py-3 border-t border-[rgba(22,37,68,0.5)] bg-[rgba(22,37,68,0.3)] flex items-center justify-between">
        <span className="text-[11px] text-[#4A6180]">Created {portal.created}</span>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-[#4A6180] hover:text-[#E8EEF7] transition-colors rounded-md hover:bg-[rgba(22,37,68,0.4)]">
            <LinkIcon size={16} />
          </button>
          <button className="p-1.5 text-[#4A6180] hover:text-[#E8EEF7] transition-colors rounded-md hover:bg-[rgba(22,37,68,0.4)]">
            <Settings2 size={16} />
          </button>
          <button className="p-1.5 text-[#4A6180] hover:text-[#E8EEF7] transition-colors rounded-md hover:bg-[rgba(22,37,68,0.4)]">
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ─── create portal modal ─── */
function CreatePortalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [clientName, setClientName] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  const [folderName, setFolderName] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [requirePassword, setRequirePassword] = useState(true)
  const [allowDownloads, setAllowDownloads] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  // Security: Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Security: Validate client name
  const validateClientName = useCallback((name: string): boolean => {
    const result = validateCompanyName(name)
    if (!result.valid) {
      setValidationErrors((prev) => ({ ...prev, clientName: result.error || 'Invalid name' }))
      return false
    }
    setValidationErrors((prev) => {
      const { clientName: _, ...rest } = prev
      return rest
    })
    return true
  }, [])

  // Security: Validate URL slug
  const validateSlug = useCallback((slug: string): boolean => {
    const result = validatePortalSlug(slug)
    if (!result.valid) {
      setValidationErrors((prev) => ({ ...prev, urlSlug: result.error || 'Invalid slug' }))
      return false
    }
    setValidationErrors((prev) => {
      const { urlSlug: _, ...rest } = prev
      return rest
    })
    return true
  }, [])

  // Security: Sanitized input handlers
  const handleClientNameChange = (value: string) => {
    // Remove control characters and limit length
    const sanitized = value.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 255)
    setClientName(sanitized)
    if (validationErrors.clientName) {
      validateClientName(sanitized)
    }
  }

  const handleSlugChange = (value: string) => {
    // Only allow safe characters for URL slugs
    const sanitized = value.toLowerCase().replace(/[^a-z0-9\-_]/g, '').slice(0, 64)
    setUrlSlug(sanitized)
    if (validationErrors.urlSlug) {
      validateSlug(sanitized)
    }
  }

  const addEmail = useCallback(() => {
    // Security: Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)
    if (!emailInput || !emailRegex) {
      setEmailInput('')
      auditLogger.logFailure('LOGIN_FAILURE', {
        resource: 'portal',
        action: 'invalid_email_input',
        details: { reason: 'format_validation_failed' },
      })
      return
    }
    if (emailInput.length > 254) {
      setValidationErrors((prev) => ({ ...prev, email: 'Email exceeds maximum length' }))
      return
    }
    if (emails.includes(emailInput)) {
      return
    }
    // Sanitize email
    const sanitizedEmail = emailInput.trim().toLowerCase()
    setEmails((prev) => [...prev, sanitizedEmail])
    setEmailInput('')
    setValidationErrors((prev) => {
      const { email: _, ...rest } = prev
      return rest
    })
  }, [emailInput, emails])

  const removeEmail = useCallback((email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addEmail()
      }
    },
    [addEmail]
  )

  // Security: Validate entire form before submission
  const handleCreate = () => {
    const nameValid = validateClientName(clientName)
    const slugValid = validateSlug(urlSlug)

    if (!nameValid || !slugValid) {
      auditLogger.logFailure('PORTAL_CREATED', {
        resource: 'portal',
        action: 'validation_failed',
        details: {
          nameValid,
          slugValid,
          hasClientName: !!clientName,
          hasSlug: !!urlSlug,
        },
      })
      return
    }

    // Security: Log portal creation
    auditLogger.logSuccess('PORTAL_CREATED', {
      resource: 'portal',
      action: 'create',
      details: {
        slug: encodeHtml(urlSlug),
        hasPassword: requirePassword,
        allowDownloads,
        teamSize: emails.length,
      },
    })

    // Close modal on success
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl border border-[#162544] p-6 lg:p-8"
              style={{ background: '#0B1628' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium text-[#E8EEF7]">Create Client Portal</h2>
                <button
                  onClick={onClose}
                  className="text-[#4A6180] hover:text-[#E8EEF7] transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="mt-6 space-y-5">
                {/* Client Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <label className="block text-sm font-medium text-[#8BA3C7] mb-1.5">Client or company name</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corporation"
                    value={clientName}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    onBlur={() => clientName && validateClientName(clientName)}
                    maxLength={255}
                    className={`w-full bg-[#050B14] border rounded-lg px-4 py-2.5 text-sm text-[#E8EEF7] placeholder:text-[#4A6180] outline-none focus:border-[#4B82FF] focus:shadow-[0_0_0_3px_rgba(75,130,255,0.15)] transition-all ${
                      validationErrors.clientName ? 'border-[#FF4D6A]' : 'border-[#162544]'
                    }`}
                  />
                  {validationErrors.clientName && (
                    <p className="mt-1 text-xs text-[#FF4D6A] flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {validationErrors.clientName}
                    </p>
                  )}
                </motion.div>

                {/* Portal URL */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-[#8BA3C7] mb-1.5">Portal URL</label>
                  <div className="flex">
                    <span className="flex-shrink-0 bg-[#162544] border border-[#162544] border-r-0 rounded-l-lg px-3 py-2.5 text-[11px] text-[#4A6180] flex items-center">
                      statementwiseai.com/p/
                    </span>
                    <input
                      type="text"
                      placeholder="acme-corp"
                      value={urlSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      onBlur={() => urlSlug && validateSlug(urlSlug)}
                      maxLength={64}
                      className={`flex-1 bg-[#050B14] border rounded-r-lg px-4 py-2.5 text-sm text-[#E8EEF7] placeholder:text-[#4A6180] outline-none focus:border-[#4B82FF] focus:shadow-[0_0_0_3px_rgba(75,130,255,0.15)] transition-all ${
                        validationErrors.urlSlug ? 'border-[#FF4D6A]' : 'border-[#162544]'
                      }`}
                    />
                  </div>
                  {validationErrors.urlSlug && (
                    <p className="mt-1 text-xs text-[#FF4D6A] flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {validationErrors.urlSlug}
                    </p>
                  )}
                </motion.div>

                {/* Folder Name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <label className="block text-sm font-medium text-[#8BA3C7] mb-1.5">Default folder name</label>
                  <input
                    type="text"
                    placeholder="e.g., Bank Statements 2025"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="w-full bg-[#050B14] border border-[#162544] rounded-lg px-4 py-2.5 text-sm text-[#E8EEF7] placeholder:text-[#4A6180] outline-none focus:border-[#4B82FF] focus:shadow-[0_0_0_3px_rgba(75,130,255,0.15)] transition-all"
                  />
                </motion.div>

                {/* Team Members */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <label className="block text-sm font-medium text-[#8BA3C7] mb-1.5">Invite team members</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter email and press Enter"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-[#050B14] border border-[#162544] rounded-lg px-4 py-2.5 text-sm text-[#E8EEF7] placeholder:text-[#4A6180] outline-none focus:border-[#4B82FF] focus:shadow-[0_0_0_3px_rgba(75,130,255,0.15)] transition-all"
                    />
                    <button
                      onClick={addEmail}
                      className="px-4 py-2.5 bg-[#162544] text-[#E8EEF7] rounded-lg text-sm font-medium hover:bg-[#1E3260] transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <AnimatePresence>
                      {emails.map((email) => (
                        <motion.span
                          key={email}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          className="inline-flex items-center gap-1.5 bg-[#162544] text-[#E8EEF7] text-sm px-2 py-1 rounded-md"
                        >
                          {email}
                          <button
                            onClick={() => removeEmail(email)}
                            className="text-[#4A6180] hover:text-[#FF4D6A] transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Access Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <label className="block text-sm font-medium text-[#8BA3C7] mb-2">Access Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          requirePassword ? 'bg-[#4B82FF] border-[#4B82FF]' : 'border-[#162544] bg-[#050B14]'
                        }`}
                        onClick={() => setRequirePassword(!requirePassword)}
                      >
                        {requirePassword && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-[#8BA3C7] group-hover:text-[#E8EEF7] transition-colors">
                        Require password for uploads
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          allowDownloads ? 'bg-[#4B82FF] border-[#4B82FF]' : 'border-[#162544] bg-[#050B14]'
                        }`}
                        onClick={() => setAllowDownloads(!allowDownloads)}
                      >
                        {allowDownloads && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-[#8BA3C7] group-hover:text-[#E8EEF7] transition-colors">
                        Allow file downloads
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          emailNotifications ? 'bg-[#4B82FF] border-[#4B82FF]' : 'border-[#162544] bg-[#050B14]'
                        }`}
                        onClick={() => setEmailNotifications(!emailNotifications)}
                      >
                        {emailNotifications && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-[#8BA3C7] group-hover:text-[#E8EEF7] transition-colors">
                        Send email notifications on upload
                      </span>
                    </label>
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="flex items-center gap-3 pt-4"
                >
                  <button
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!clientName || !urlSlug || Object.keys(validationErrors).length > 0}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-115 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
                  >
                    Create Portal
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ─── access control section ─── */
function AccessControlPanel() {
  const [expanded, setExpanded] = useState(true)

  const roles = [
    { icon: ShieldCheck, color: '#4B82FF', title: 'Admin', desc: 'Full access to all portals, settings, and billing', count: '3 members' },
    { icon: Pencil, color: '#FFB020', title: 'Editor', desc: 'Can process conversions and manage uploads', count: '5 members' },
    { icon: Eye, color: '#00D68F', title: 'Viewer', desc: 'Read-only access to completed conversions', count: '8 members' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: easeOutExpo }}
      className="rounded-xl border border-[#162544] p-5 lg:p-6 transition-all duration-350 hover:border-[#1E3260]"
      style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between cursor-pointer"
      >
        <div className="text-left">
          <h2 className="font-display text-lg font-medium text-[#E8EEF7]">Access Control &amp; Permissions</h2>
          <p className="text-sm text-[#8BA3C7] mt-0.5">Manage who can access what across all portals</p>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={20} className="text-[#4A6180]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="overflow-hidden"
          >
            {/* Role cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {roles.map((role, i) => {
                const Icon = role.icon
                return (
                  <motion.div
                    key={role.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 + i * 0.08, ease: easeOutExpo }}
                    className="bg-[#162544] border border-[#162544] rounded-xl p-4"
                  >
                    <Icon size={20} style={{ color: role.color }} />
                    <h3 className="font-display text-xs font-semibold text-[#E8EEF7] mt-2">{role.title}</h3>
                    <p className="text-sm text-[#8BA3C7] mt-1">{role.desc}</p>
                    <span className="text-[11px] text-[#4A6180] mt-2 inline-block">{role.count}</span>
                  </motion.div>
                )
              })}
            </div>

            {/* Team members table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#162544]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Name</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Role</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden sm:table-cell">Portals</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {teamMembersData.map((member, i) => (
                    <motion.tr
                      key={member.email}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.05, ease: easeOutExpo }}
                      className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
                            style={{ background: member.color }}
                          >
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <span className="text-sm text-[#E8EEF7] font-medium">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8BA3C7] hidden md:table-cell">{member.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          style={{
                            background: member.role === 'Admin' ? 'rgba(75,130,255,0.12)' : member.role === 'Editor' ? 'rgba(255,176,32,0.12)' : 'rgba(0,214,143,0.12)',
                            color: member.role === 'Admin' ? '#4B82FF' : member.role === 'Editor' ? '#FFB020' : '#00D68F',
                            borderColor: member.role === 'Admin' ? 'rgba(75,130,255,0.2)' : member.role === 'Editor' ? 'rgba(255,176,32,0.2)' : 'rgba(0,214,143,0.2)',
                          }}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8BA3C7] hidden sm:table-cell">{member.portals}</td>
                      <td className="px-4 py-3 text-[11px] text-[#4A6180] hidden lg:table-cell">{member.active}</td>
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

            {/* Invite button */}
            <button className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#162544] text-sm font-medium text-[#E8EEF7] hover:bg-[#162544] hover:border-[#1E3260] transition-all duration-200">
              <Plus size={16} />
              Invite Team Member
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── main portal component ─── */
export default function Portal() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Security: RBAC — only firm and admin roles allowed
  const { isAuthenticated, isAuthorized, loading, user } = useAuthGuard({
    requiredRoles: ['firm', 'admin'],
    redirectTo: '/dashboard',
  })

  // Security: Access security context for logout
  const { sessionExpiringSoon, resetSessionTimer } = useSecurity()

  // Security: Log portal access
  useEffect(() => {
    if (isAuthenticated && isAuthorized) {
      auditLogger.logSuccess('PORTAL_ACCESS', {
        resource: 'portal',
        action: 'view',
        details: { role: user?.role },
      })
    }
  }, [isAuthenticated, isAuthorized, user])

  // Security: Track activity for session timeout
  const handleActivity = useCallback(() => {
    resetSessionTimer()
  }, [resetSessionTimer])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))
    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
    }
  }, [handleActivity])

  const handleResize = useCallback(() => {
    setSidebarCollapsed(window.innerWidth < 1024 && window.innerWidth >= 640)
  }, [])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  const sidebarWidth = sidebarCollapsed ? 64 : 200

  const filteredPortals = portalsData.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          <h1 className="font-display text-[28px] sm:text-[32px] font-medium text-[#E8EEF7] tracking-tight">Client Portals</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4D6A] rounded-full" />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 hover:brightness-115 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
            >
              <Plus size={16} />
              New Portal
            </button>
          </div>
        </motion.div>

        {/* ─── Page Content ─── */}
        <div className="px-6 lg:px-10 pb-10 space-y-8">
          {/* Section 1: Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Active Portals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0, ease: easeOutExpo }}
              className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-medium text-[#4A6180] tracking-[0.04em] uppercase">Active Portals</span>
                <Users size={20} className="text-[#4B82FF]" />
              </div>
              <div className="text-[32px] font-medium text-[#E8EEF7] font-display tracking-tight leading-tight">
                <CountUp end={4} duration={1} />
              </div>
              <div className="text-[11px] text-[#FFB020] mt-1">of 10 included in Pro plan</div>
            </motion.div>

            {/* Total Uploads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
              className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-medium text-[#4A6180] tracking-[0.04em] uppercase">Total Uploads</span>
                <Upload size={20} className="text-[#00D68F]" />
              </div>
              <div className="text-[32px] font-medium text-[#E8EEF7] font-display tracking-tight leading-tight">
                <CountUp end={156} duration={1} separator="," />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1 text-[11px] text-[#00D68F] font-medium">
                  +23%
                </div>
                <span className="text-[11px] text-[#4A6180]">This month</span>
              </div>
            </motion.div>

            {/* Clients */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOutExpo }}
              className="rounded-xl border border-[#162544] p-5 transition-all duration-350 hover:border-[#1E3260] hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <span className="text-[11px] font-medium text-[#4A6180] tracking-[0.04em] uppercase">Clients</span>
                <ShieldCheck size={20} className="text-[#FFB020]" />
              </div>
              <div className="text-[32px] font-medium text-[#E8EEF7] font-display tracking-tight leading-tight">
                <CountUp end={12} duration={1} />
              </div>
              <div className="text-[11px] text-[#4A6180] mt-1">Across all portals</div>
            </motion.div>
          </div>

          {/* Section 2: Portal Grid */}
          <div>
            {/* Header bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
            >
              <h2 className="font-display text-xl font-medium text-[#E8EEF7]">Your Client Portals</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6180]" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-[240px] bg-[#162544] border border-[#162544] rounded-lg pl-9 pr-4 py-2 text-sm text-[#E8EEF7] placeholder:text-[#4A6180] outline-none focus:border-[#4B82FF] transition-all"
                  />
                </div>
              </div>
            </motion.div>

            {/* Portal cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredPortals.map((portal, i) => (
                <PortalCard key={portal.slug} portal={portal} index={i} />
              ))}
              {filteredPortals.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#4A6180] text-sm">
                  No portals found matching &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Recent Uploads Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: easeOutExpo }}
            className="rounded-xl border border-[#162544] overflow-hidden transition-all duration-350 hover:border-[#1E3260]"
            style={{ background: 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(22,37,68,0.5)]">
              <h2 className="font-display text-lg font-medium text-[#E8EEF7]">Recent Client Uploads</h2>
              <select className="bg-[#162544] border border-[#162544] text-[#8BA3C7] text-sm rounded-lg px-3 py-1.5 outline-none focus:border-[#4B82FF] transition-colors cursor-pointer text-[11px]">
                <option>All Portals</option>
                <option>Acme Corp</option>
                <option>Smith Trust</option>
                <option>Johnson CPA</option>
                <option>Meridian LLC</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#162544]">
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">File</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden md:table-cell">Client</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden lg:table-cell">Portal</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Pages</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#4A6180] uppercase tracking-wider hidden sm:table-cell">Uploaded</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {recentUploads.map((row, i) => (
                    <motion.tr
                      key={`${row.file}-${i}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.05, ease: easeOutExpo }}
                      className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-[#4B82FF] flex-shrink-0" />
                          <div>
                            <div className="text-sm text-[#E8EEF7] truncate max-w-[180px]">{row.file}</div>
                            <div className="text-[11px] text-[#4A6180]">{row.size}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                            style={{ background: '#4B82FF' }}
                          >
                            {row.initials}
                          </div>
                          <span className="text-sm text-[#8BA3C7]">{row.client}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8BA3C7] hidden lg:table-cell">{row.portal}</td>
                      <td className="px-4 py-3 text-sm text-[#8BA3C7] text-right">{row.pages}</td>
                      <td className="px-4 py-3"><UploadStatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-[11px] text-[#4A6180] hidden sm:table-cell">{row.uploaded}</td>
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

          {/* Section 4: Access Control */}
          <AccessControlPanel />
        </div>
      </main>

      {/* Create Portal Modal */}
      <CreatePortalModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
