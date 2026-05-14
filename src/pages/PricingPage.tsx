import { Fragment, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  Minus,
  Infinity,
  ChevronDown,
  CreditCard,
  Clock,
  Scale,
  RefreshCw,
} from 'lucide-react'
import { billingApi, getAuthToken } from '@/lib/api'
import { trackGoogleAdsConversion } from '@/lib/googleAds'

/* ──────────────────────── animation variants ──────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
}

const cardStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
}

/* ──────────────────────── pricing data ──────────────────────── */
type Billing = 'monthly' | 'annual'

interface Tier {
  id: string
  badge: string
  badgeColor: string
  badgeBg: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  pages: string
  rollover: string
  features: { text: string; included: boolean }[]
  cta: string
  ctaStyle: 'primary' | 'secondary'
  featured?: boolean
}

const tiers: Tier[] = [
  {
    id: 'free',
    badge: 'STARTER',
    badgeColor: '#4A6180',
    badgeBg: 'rgba(22,37,68,0.5)',
    name: 'Free',
    description: 'Perfect for trying Statementwise or occasional use',
    monthlyPrice: 0,
    annualPrice: 0,
    pages: '500 pages/month',
    rollover: '',
    features: [
      { text: 'CSV & Excel export', included: true },
      { text: 'Basic AI extraction', included: true },
      { text: '1 client portal', included: true },
      { text: 'Email support', included: true },
      { text: 'QBO/OFX export', included: false },
      { text: 'Balance reconciliation', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Get Started Free',
    ctaStyle: 'secondary',
  },
  {
    id: 'pro',
    badge: 'MOST POPULAR',
    badgeColor: '#00D68F',
    badgeBg: 'rgba(0,214,143,0.12)',
    name: 'Pro',
    description: 'For professionals who convert statements regularly',
    monthlyPrice: 19,
    annualPrice: 15,
    pages: '2,000 pages/month',
    rollover: 'Credits roll over up to 6,000',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'QBO, OFX, CSV, Excel, JSON export', included: true },
      { text: 'Balance reconciliation', included: true },
      { text: '5 client portals', included: true },
      { text: 'API access (1,000 calls/month)', included: true },
      { text: 'Email support (< 4 hour response)', included: true },
      { text: 'Scanned PDF support', included: true },
    ],
    cta: 'Start Pro Trial',
    ctaStyle: 'primary',
    featured: true,
  },
  {
    id: 'business',
    badge: 'SCALE',
    badgeColor: '#78A4FF',
    badgeBg: 'rgba(75,130,255,0.12)',
    name: 'Business',
    description: 'For accounting firms with multiple clients',
    monthlyPrice: 49,
    annualPrice: 39,
    pages: '10,000 pages/month',
    rollover: 'Credits roll over up to 30,000',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited client portals', included: true },
      { text: 'Transaction categorization', included: true },
      { text: 'Phone support', included: true },
      { text: 'Fraud detection', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SOC 2 certified', included: true },
    ],
    cta: 'Start Business',
    ctaStyle: 'primary',
  },
]

/* ──────────────────────── comparison table data ──────────────────────── */
const comparisonCategories = [
  {
    name: 'AI Extraction',
    rows: [
      { feature: 'AI Extraction Accuracy', free: 'Standard', pro: '99.5%+', business: '99.9%+' },
      { feature: 'Pages/Month', free: '500', pro: '2,000', business: '10,000' },
      { feature: 'Credit Rollover', free: '—', pro: 'Up to 6,000', business: 'Up to 30,000' },
      { feature: 'Scanned PDFs', free: '—', pro: 'Check', business: 'Check' },
    ],
  },
  {
    name: 'Export',
    rows: [
      { feature: 'CSV Export', free: 'Check', pro: 'Check', business: 'Check' },
      { feature: 'Excel Export', free: 'Check', pro: 'Check', business: 'Check' },
      { feature: 'QBO Export', free: '—', pro: 'Check', business: 'Check' },
      { feature: 'OFX Export', free: '—', pro: 'Check', business: 'Check' },
      { feature: 'JSON Export', free: '—', pro: 'Check', business: 'Check' },
    ],
  },
  {
    name: 'Features',
    rows: [
      { feature: 'Balance Reconciliation', free: '—', pro: 'Check', business: 'Check' },
      { feature: 'Client Portals', free: '1', pro: '5', business: 'Unlimited' },
      { feature: 'API Access', free: '—', pro: 'Check', business: 'Check' },
      { feature: 'Transaction Categorization', free: '—', pro: '—', business: 'Check' },
      { feature: 'Fraud Detection', free: '—', pro: '—', business: 'Check' },
      { feature: 'Custom Integrations', free: '—', pro: '—', business: 'Check' },
      { feature: 'SOC 2', free: '—', pro: '—', business: 'Check' },
    ],
  },
  {
    name: 'Support',
    rows: [
      { feature: 'Support Level', free: 'Email', pro: 'Email (<4h)', business: 'Phone + Email' },
    ],
  },
]

/* ──────────────────────── FAQ data ──────────────────────── */
const faqs = [
  {
    q: 'What happens to unused credits?',
    a: 'They roll over automatically, up to 3x your monthly limit. Never expire.',
  },
  {
    q: 'Can I change plans?',
    a: 'Yes, upgrade or downgrade anytime. Credits adjust proportionally.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Our Free tier is unlimited time — 500 pages/month forever.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes, failed conversions are automatically refunded. No questions asked.',
  },
  {
    q: 'What export formats are supported?',
    a: 'CSV, Excel (XLSX), QBO, OFX, JSON. MT940/CAMT.053 coming soon.',
  },
  {
    q: 'Is my data secure?',
    a: 'SOC 2 Type II certified, end-to-end encryption, zero-data-retention option available.',
  },
]

/* ──────────────────────── helpers ──────────────────────── */
function CellValue({ value }: { value: string }) {
  if (value === 'Check')
    return <Check size={18} className="text-[#00D68F] mx-auto" />
  if (value === '—')
    return <Minus size={18} className="text-[#4A6180] mx-auto" />
  return <span className="text-sm text-[#8BA3C7]">{value}</span>
}

/* ──────────────────────── FAQ accordion item ──────────────────────── */
function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="border border-[#162544] rounded-[10px] overflow-hidden"
      style={{ background: '#162544' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-medium text-[#E8EEF7] pr-4">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#4A6180] flex-shrink-0"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
              opacity: { duration: 0.25, delay: 0.05 },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              <div className="border-t border-[rgba(22,37,68,0.5)] pt-3">
                <p className="text-sm text-[#8BA3C7] leading-relaxed">{answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ──────────────────────── main component ──────────────────────── */
export default function PricingPage() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const toggleFaq = (i: number) => setOpenFaq((prev) => (prev === i ? null : i))

  const handleTierCta = async (tier: Tier) => {
    setCheckoutError(null)

    if (tier.id === 'free') {
      window.location.assign('/signup?next=/convert')
      return
    }

    if (tier.id !== 'pro' && tier.id !== 'business') return

    const token = getAuthToken()
    if (!token) {
      window.location.assign(`/signup?next=${encodeURIComponent('/pricing')}`)
      return
    }

    try {
      setCheckoutLoading(tier.id)
      trackGoogleAdsConversion('begin_checkout')
      const session = await billingApi.createCheckoutSession(tier.id, billing, token)
      window.location.assign(session.checkout_url)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Unable to start checkout')
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#050B14]">
      {/* ───── Hero Section ───── */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 aurora-combo-bg" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-4"
          >
            Transparent Pricing
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              delay: 0.1,
            }}
            className="font-display text-4xl sm:text-5xl lg:text-[56px] font-medium text-[#E8EEF7] tracking-tight leading-tight"
          >
            Simple, Fair Pricing
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 text-lg text-[#8BA3C7] max-w-xl mx-auto"
          >
            Credits that never expire. No hidden fees. No surprises.
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-0 relative"
          >
            <div
              className="flex items-center rounded-lg p-1"
              style={{ background: '#162544', border: '1px solid #162544' }}
            >
              <button
                onClick={() => setBilling('monthly')}
                className={`relative z-10 px-5 py-2 text-sm font-medium rounded-md transition-colors duration-300 cursor-pointer ${
                  billing === 'monthly' ? 'text-[#E8EEF7]' : 'text-[#4A6180] hover:text-[#8BA3C7]'
                }`}
              >
                {billing === 'monthly' && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-[#0B1628] rounded-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                Monthly
              </button>
              <button
                onClick={() => setBilling('annual')}
                className={`relative z-10 px-5 py-2 text-sm font-medium rounded-md transition-colors duration-300 cursor-pointer ${
                  billing === 'annual' ? 'text-[#E8EEF7]' : 'text-[#4A6180] hover:text-[#8BA3C7]'
                }`}
              >
                {billing === 'annual' && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 bg-[#0B1628] rounded-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                Annual
              </button>
            </div>
            {billing === 'annual' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-3 text-[11px] font-semibold text-[#00D68F] bg-[rgba(0,214,143,0.12)] px-2 py-0.5 rounded-full"
              >
                Save 37%
              </motion.span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ───── Pricing Cards ───── */}
      <section className="relative pb-20 px-6">
        <div className="max-w-[1100px] mx-auto">
          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                variants={cardItem}
                className={`relative rounded-xl p-6 flex flex-col transition-all duration-350 ease-out-expo ${
                  tier.featured
                    ? 'md:scale-[1.02] border border-[rgba(75,130,255,0.3)]'
                    : 'border border-[#162544]'
                }`}
                style={{
                  background: 'var(--card-surface)',
                  boxShadow: tier.featured
                    ? '0 0 60px rgba(75,130,255,0.06)'
                    : 'none',
                }}
              >
                {/* Featured top accent bar */}
                {tier.featured && (
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
                    style={{ background: 'var(--accent-bar)' }}
                  />
                )}

                {/* Badge */}
                <span
                  className="self-start text-[11px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full mb-4"
                  style={{ color: tier.badgeColor, background: tier.badgeBg }}
                >
                  {tier.badge}
                </span>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${tier.id}-${billing}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                      className="font-display text-[44px] font-medium text-[#E8EEF7] tracking-tight"
                    >
                      ${billing === 'monthly' ? tier.monthlyPrice : tier.annualPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-sm text-[#8BA3C7]">/month</span>
                </div>

                {/* Annual strikethrough */}
                {billing === 'annual' && tier.annualPrice > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-xs text-[#4A6180]"
                  >
                    <span className="line-through">
                      ${tier.monthlyPrice * 12}
                    </span>{' '}
                    <span className="text-[#00D68F]">${tier.annualPrice * 12}/year</span>
                  </motion.p>
                )}

                {/* Description */}
                <p className="mt-2 text-sm text-[#8BA3C7]">{tier.description}</p>

                {/* Pages */}
                <div className="mt-4 py-3 border-t border-b border-[rgba(22,37,68,0.5)]">
                  <p className="text-sm font-medium text-[#E8EEF7]">{tier.pages}</p>
                  {tier.rollover && (
                    <p className="text-xs text-[#4A6180] mt-0.5">{tier.rollover}</p>
                  )}
                </div>

                {/* Feature list */}
                <ul className="mt-4 flex flex-col gap-2.5 flex-grow">
                  {tier.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5">
                      {f.included ? (
                        <Check size={14} className="text-[#00D68F] mt-0.5 flex-shrink-0" />
                      ) : (
                        <Minus size={14} className="text-[#4A6180] mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`text-sm ${f.included ? 'text-[#8BA3C7]' : 'text-[#4A6180]'}`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => void handleTierCta(tier)}
                  disabled={checkoutLoading === tier.id}
                  className={`mt-6 w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    tier.ctaStyle === 'primary'
                      ? 'text-white'
                      : 'text-[#E8EEF7] border border-[#162544] hover:bg-[#162544] hover:border-[#1E3260]'
                  }`}
                  style={
                    tier.ctaStyle === 'primary'
                      ? { background: 'var(--blue-gradient)' }
                      : { background: 'transparent' }
                  }
                >
                  {checkoutLoading === tier.id ? 'Opening checkout...' : tier.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
          {checkoutError && (
            <p className="mt-5 text-center text-sm text-[#FF8A8A]" role="alert">
              {checkoutError}
            </p>
          )}
        </div>
      </section>

      {/* ───── Comparison Table ───── */}
      <section className="relative pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="max-w-[1100px] mx-auto rounded-xl border border-[#162544] overflow-hidden"
          style={{ background: 'var(--card-surface)' }}
        >
          {/* Table header */}
          <div className="px-6 py-5 border-b border-[rgba(22,37,68,0.5)]">
            <h2 className="font-display text-2xl font-medium text-[#E8EEF7]">
              Complete Feature Comparison
            </h2>
            <p className="mt-1 text-sm text-[#8BA3C7]">
              Every feature, every tier. No surprises.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-[#162544]">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
                    Feature
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#4A6180]">
                    Free
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#00D68F]">
                    Pro
                  </th>
                  <th className="text-center px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF]">
                    Business
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((cat, ci) => (
                  <Fragment key={cat.name}>
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#E8EEF7]"
                        style={{ background: 'rgba(22,37,68,0.5)' }}
                      >
                        {cat.name}
                      </td>
                    </tr>
                    {cat.rows.map((row, ri) => (
                      <tr
                        key={`row-${ci}-${ri}`}
                        className="border-b border-[rgba(22,37,68,0.5)] hover:bg-[rgba(22,37,68,0.4)] transition-colors duration-150"
                      >
                        <td className="px-6 py-3 text-sm text-[#E8EEF7]">{row.feature}</td>
                        <td className="px-4 py-3 text-center">
                          <CellValue value={row.free} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <CellValue value={row.pro} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <CellValue value={row.business} />
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* ───── Credit System Explanation ───── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#0B1628' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-3">
              Credit System
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#E8EEF7]">
              Credits That Last Forever
            </h2>
            <p className="mt-3 text-lg text-[#8BA3C7] max-w-lg mx-auto">
              No more wasted subscriptions. Your credits never expire.
            </p>
          </div>

          {/* 4-step grid */}
          <motion.div
            variants={cardStagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              {
                icon: CreditCard,
                title: 'Buy Credits',
                desc: 'Purchase credit packs that fit your needs. Starting at $10 for 100 pages.',
              },
              {
                icon: Clock,
                title: 'Use Anytime',
                desc: 'Your credits never expire. Use them today, next month, or next year. No pressure.',
              },
              {
                icon: Scale,
                title: 'Fair Billing',
                desc: 'Only charged for successfully extracted pages. Failed conversions are free.',
              },
              {
                icon: RefreshCw,
                title: 'Top Up Anytime',
                desc: "Running low? Buy more credits instantly. Your plan's monthly credits reset each billing cycle.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--cobalt-glow)' }}
                >
                  <step.icon size={28} className="text-[#4B82FF]" />
                </div>
                <h3 className="font-display text-xl font-medium text-[#E8EEF7] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#8BA3C7] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Never expire card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-16 max-w-xl mx-auto rounded-xl border border-[rgba(75,130,255,0.3)] p-8 text-center"
            style={{
              background: 'rgba(11,22,40,0.9)',
              boxShadow: '0 0 60px rgba(75,130,255,0.08)',
            }}
          >
            <Infinity size={40} className="text-[#4B82FF] mx-auto mb-4" />
            <h3 className="font-display text-xl font-medium text-[#E8EEF7] mb-2">
              Your credits NEVER expire
            </h3>
            <p className="text-sm text-[#8BA3C7] mb-4">
              Other tools expire your unused credits monthly. We don&apos;t.
            </p>
            <div
              className="rounded-lg p-4 text-left"
              style={{ background: '#0B1628', border: '1px solid #162544' }}
            >
              <p className="text-sm text-[#8BA3C7]">
                <span className="text-[#E8EEF7] font-medium">Example:</span> Subscribe to Pro
                for 2,000 pages/month. Only use 1,500? 500 roll over. Next month you have
                2,500.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── FAQ Accordion ───── */}
      <section className="relative py-20 px-6">
        <div className="max-w-[720px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="font-display text-2xl sm:text-3xl font-medium text-[#E8EEF7] text-center mb-8"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFaq === i}
                onToggle={() => toggleFaq(i)}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ───── Final CTA ───── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 aurora-bottom-bg" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
          className="relative max-w-xl mx-auto px-6 text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#E8EEF7]">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-lg text-[#8BA3C7]">
            Our team is here to help. Start a free trial or reach out for a personalized demo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="px-7 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{ background: 'var(--blue-gradient)' }}
            >
              Start Free Trial
            </button>
            <button className="px-7 py-3 rounded-lg text-sm font-medium text-[#E8EEF7] border border-[#162544] transition-all duration-200 hover:bg-[#162544] hover:border-[#1E3260] cursor-pointer">
              Contact Sales
            </button>
          </div>
          <p className="mt-4 text-xs text-[#4A6180]">
            No credit card required &middot; 14-day free trial
          </p>
        </motion.div>
      </section>
    </div>
  )
}
