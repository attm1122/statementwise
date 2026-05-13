import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView } from 'framer-motion'
import {
  Brain, FileOutput, Scale, ShieldCheck, Infinity,
  Upload, Sparkles, Download, Play, Check,
  Star,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  EASING TOKENS                                                       */
/* ------------------------------------------------------------------ */
const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number]

/* ------------------------------------------------------------------ */
/*  REUSABLE ANIMATION VARIANTS                                         */
/* ------------------------------------------------------------------ */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
}

/* ------------------------------------------------------------------ */
/*  PARTICLE BACKGROUND (Canvas)                                        */
/* ------------------------------------------------------------------ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let w = window.innerWidth
    let h = window.innerHeight

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    const PARTICLE_COUNT = 250
    const CONNECTION_DIST = 120
    const MOUSE_DIST = 150

    const palette = ['#050B14', '#0B1628', '#1E3260', '#4B82FF', '#00D68F']
    const paletteRGB = [
      [5, 11, 20], [11, 22, 40], [30, 50, 96], [75, 130, 255], [0, 214, 143],
    ]

    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      colorIdx: Math.floor(Math.random() * palette.length),
      baseX: Math.random() * w,
      baseY: Math.random() * h,
    }))

    const mouse = { x: -9999, y: -9999 }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', onMouseMove)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i]

        // Gentle drift
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Mouse repulsion
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < MOUSE_DIST) {
          const force = (MOUSE_DIST - dist) / MOUSE_DIST
          p.x += (dx / dist) * force * 2
          p.y += (dy / dist) * force * 2
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = palette[p.colorIdx]
        ctx.fill()
      }

      // Connection lines
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            const c = paletteRGB[particles[i].colorIdx]
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  HERO SECTION                                                        */
/* ------------------------------------------------------------------ */
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#050B14]"
    >
      {/* Particle field */}
      <ParticleField />

      {/* Aurora overlay */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(75,130,255,0.15), transparent)',
          opacity: 0.4,
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
          className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-6"
        >
          AI-Native Bank Statement Conversion
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.35 }}
          className="font-display font-medium text-4xl sm:text-5xl lg:text-[72px] lg:leading-[1.05] tracking-[-0.03em] text-[#E8EEF7] max-w-[800px] mx-auto"
        >
          Convert Any Bank Statement in{' '}
          <span className="text-[#00D68F]">Seconds</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.55 }}
          className="mt-6 text-lg text-[#8BA3C7] max-w-[560px] mx-auto leading-relaxed"
        >
          Template-free AI extraction with 99%+ accuracy. Drag, drop, done — works
          with every bank format on Earth.
        </motion.p>

        {/* CTA Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.7 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/signup?next=/convert"
            className="btn-primary text-center"
          >
            Start Converting Free
          </Link>
          <Link
            to="/convert"
            className="btn-secondary flex items-center gap-2"
          >
            <Play size={16} />
            Watch Demo
          </Link>
        </motion.div>

        {/* Trust microcopy */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.85 }}
          className="mt-4 text-xs text-[#4A6180]"
        >
          No credit card required &middot; Free 50 pages/month
        </motion.p>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, ease: easeOutExpo, delay: 0.9 }}
          className="mt-12 max-w-4xl mx-auto"
        >
          <div className="border border-[#162544] rounded-xl overflow-hidden shadow-hero-card rotate-[1deg] hover:rotate-0 transition-transform duration-500">
            <img
              src="/hero-dashboard-preview.png"
              alt="Statementwise Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  TRUST BAR                                                           */
/* ------------------------------------------------------------------ */
const firms = ['GRANT THORNTON', 'DELOITTE', 'BDO', 'RSM', 'WITHUM', 'MOSS ADAMS']

function TrustBar() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section
      ref={ref}
      className="relative bg-[#0B1628] border-y border-[rgba(22,37,68,0.5)] py-6 overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: easeOutExpo }}
      >
        <p className="text-xs text-[#4A6180] text-center mb-4 tracking-wide">
          Trusted by accounting professionals at
        </p>

        <div className="relative max-w-7xl mx-auto overflow-hidden">
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
            {firms.map((firm) => (
              <span
                key={firm}
                className="text-sm sm:text-base font-semibold text-[#4A6180] hover:text-[#8BA3C7] hover:opacity-100 opacity-50 transition-all duration-300 tracking-wider whitespace-nowrap"
              >
                {firm}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FEATURES GRID                                                       */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: Brain,
    title: 'Template-Free AI Extraction',
    description:
      'Our AI understands any bank statement format automatically — no templates, no configuration, no training. Drop a PDF from any bank in the world and watch transactions appear in seconds.',
    image: '/feature-ai-extraction.png',
  },
  {
    icon: FileOutput,
    title: 'Export to Any Format',
    description:
      'QBO, OFX, CSV, Excel, JSON — export your extracted transactions to the format your accounting software demands. One click, perfect formatting every time.',
    image: '/feature-multi-format.png',
  },
  {
    icon: Scale,
    title: 'Automatic Balance Reconciliation',
    description:
      'Opening balance + deposits - withdrawals = closing balance. We validate every conversion automatically and flag discrepancies before they become problems.',
    image: '/feature-reconciliation.png',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Client Portals',
    description:
      'Create dedicated upload portals for each client. Role-based access, secure file handling, and organized folder structures — built for accounting firms managing multiple clients.',
    image: '/feature-client-portal.png',
  },
  {
    icon: Infinity,
    title: 'Credits That Last Forever',
    description:
      'Your credits never expire. Buy once, use anytime. No monthly minimums, no hidden fees, no surprise charges. Fair billing is not a feature — it is a promise.',
    image: '/feature-never-expire.png',
  },
]

function FeaturesGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="features"
      className="relative py-32 bg-[#050B14] overflow-hidden"
    >
      {/* Aurora combo overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 20% 50%, rgba(75,130,255,0.1), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0,214,143,0.08), transparent)',
          opacity: 0.2,
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-4">
            Powerful Features
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em] text-[#E8EEF7]">
            Everything You Need, Nothing You Don&apos;t
          </h2>
          <p className="mt-4 text-lg text-[#8BA3C7] max-w-[520px] mx-auto">
            Five killer capabilities that make bank statement conversion effortless.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className={`group relative p-8 rounded-2xl border border-[#162544] transition-all duration-350 ease-out-expo hover:-translate-y-1 hover:border-[rgba(75,130,255,0.3)] hover:shadow-feature-glow ${
                  i === 4 ? 'md:col-span-2 xl:col-span-1' : ''
                }`}
                style={{
                  background:
                    'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)',
                }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-[rgba(75,130,255,0.15)] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#4B82FF]" />
                </div>

                {/* Title */}
                <h3 className="font-display text-xl font-medium text-[#E8EEF7] mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#8BA3C7] leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Image */}
                <div className="rounded-lg overflow-hidden mt-4 group-hover:scale-[1.02] transition-transform duration-400">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full aspect-[3/2] object-cover"
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  HOW IT WORKS                                                        */
/* ------------------------------------------------------------------ */
const steps = [
  {
    num: '01',
    title: 'Upload Your Statement',
    description:
      'Drag and drop any PDF bank statement. No templates, no configuration — our AI reads it instantly.',
    icon: Upload,
  },
  {
    num: '02',
    title: 'AI Extracts Everything',
    description:
      'Watch as our AI identifies dates, descriptions, amounts, and balances with 99%+ accuracy. Reconciliation happens automatically.',
    icon: Sparkles,
  },
  {
    num: '03',
    title: 'Export & Done',
    description:
      'Download in QBO, OFX, CSV, Excel, or JSON. Your clean data is ready for QuickBooks, Xero, or any accounting system.',
    icon: Download,
  },
]

function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative py-32 bg-[#0B1628]">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-4">
            How It Works
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em] text-[#E8EEF7]">
            From PDF to Clean Data in Three Steps
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[16%] right-[16%] h-0.5">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: 'linear', delay: 0.3 }}
              className="h-full origin-left"
              style={{ background: 'linear-gradient(90deg, #4B82FF, #00D68F)' }}
            />
          </div>

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.2 + i * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Number */}
                <div className="relative z-10 mb-6">
                  <span className="font-display font-light text-[56px] leading-none text-[#4B82FF]">
                    {step.num}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-[rgba(75,130,255,0.15)] flex items-center justify-center mb-5">
                  <Icon size={32} className="text-[#4B82FF]" />
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-medium text-[#E8EEF7] mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#8BA3C7] leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  PRICING PREVIEW                                                     */
/* ------------------------------------------------------------------ */
const pricingTiers = [
  {
    name: 'Free',
    badge: 'STARTER',
    badgeColor: 'text-[#4A6180]',
    badgeBg: 'bg-transparent',
    price: '$0',
    period: '/month',
    description: 'Perfect for trying out Statementwise',
    features: [
      '50 pages/month',
      'PDF upload',
      'CSV & JSON export',
      'Basic reconciliation',
      'Email support',
    ],
    cta: 'Get Started Free',
    ctaStyle: 'secondary' as const,
    featured: false,
  },
  {
    name: 'Pro',
    badge: 'MOST POPULAR',
    badgeColor: 'text-[#00D68F]',
    badgeBg: 'bg-[rgba(0,214,143,0.12)]',
    price: '$29',
    period: '/month',
    description: 'For professionals who need more power',
    features: [
      '500 pages/month',
      'All export formats (QBO, OFX, CSV, Excel, JSON)',
      'Advanced reconciliation with discrepancy flags',
      'Client portals (up to 10 clients)',
      'Priority support',
      'API access',
    ],
    cta: 'Start Pro Trial',
    ctaStyle: 'primary' as const,
    featured: true,
  },
  {
    name: 'Business',
    badge: 'SCALE',
    badgeColor: 'text-[#78A4FF]',
    badgeBg: 'bg-transparent',
    price: '$99',
    period: '/month',
    description: 'For firms managing multiple clients',
    features: [
      '2,500 pages/month',
      'All export formats',
      'Full reconciliation suite',
      'Unlimited client portals',
      'Role-based access control',
      'White-label options',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    ctaStyle: 'secondary' as const,
    featured: false,
  },
]

function PricingPreview() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <section className="relative py-32 bg-[#050B14] overflow-hidden">
      {/* Aurora bottom overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 120%, rgba(0,214,143,0.08), transparent)',
          opacity: 0.3,
        }}
      />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-4">
            Simple Pricing
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em] text-[#E8EEF7]">
            Pay for What You Use. Nothing More.
          </h2>
          <p className="mt-4 text-lg text-[#8BA3C7]">
            Start free. Scale as you grow. Your credits never expire.
          </p>
        </motion.div>

        {/* Monthly/Annual Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-12"
        >
          <span
            className={`text-sm font-medium ${!isAnnual ? 'text-[#E8EEF7]' : 'text-[#8BA3C7]'}`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-12 h-6 rounded-full bg-[#162544] transition-colors duration-300"
            style={{ backgroundColor: isAnnual ? '#4B82FF' : '#162544' }}
          >
            <motion.div
              animate={{ x: isAnnual ? 24 : 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="absolute top-[2px] left-0 w-5 h-5 rounded-full bg-white shadow"
            />
          </button>
          <span
            className={`text-sm font-medium ${isAnnual ? 'text-[#E8EEF7]' : 'text-[#8BA3C7]'}`}
          >
            Annual
          </span>
          {isAnnual && (
            <span className="text-xs text-[#00D68F] font-medium ml-1">Save 37%</span>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              className={`relative rounded-xl p-8 transition-all duration-350 ease-out-expo hover:-translate-y-1 ${
                tier.featured
                  ? 'border border-[rgba(75,130,255,0.3)] shadow-pro-glow scale-[1.02] md:scale-[1.02] z-10'
                  : 'border border-[#162544] hover:border-[#1E3260]'
              }`}
              style={{
                background: tier.featured
                  ? 'linear-gradient(180deg, rgba(11,22,40,0.95) 0%, rgba(5,11,20,0.98) 100%)'
                  : 'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)',
              }}
            >
              {/* Badge */}
              <span
                className={`inline-block text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full mb-4 ${tier.badgeColor} ${tier.badgeBg}`}
              >
                {tier.badge}
              </span>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display font-medium text-4xl text-[#E8EEF7]">
                  {isAnnual
                    ? tier.price.replace('$', '$')
                    : tier.price === '$0'
                    ? '$0'
                    : `$${Math.round(parseInt(tier.price.slice(1)) * 1.37)}`}
                </span>
                <span className="text-sm text-[#8BA3C7]">{tier.period}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#8BA3C7] mb-6">{tier.description}</p>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-[#E8EEF7]">
                    <Check size={16} className="text-[#00D68F] mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/signup?next=/convert"
                className={`block w-full text-center py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                  tier.ctaStyle === 'primary'
                    ? 'text-white'
                    : 'bg-transparent border border-[#162544] text-[#E8EEF7] hover:bg-[#162544]'
                }`}
                style={
                  tier.ctaStyle === 'primary'
                    ? { background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }
                    : undefined
                }
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-xs text-[#4A6180] text-center mt-8"
        >
          All plans include never-expiring credits. Need more? Top up anytime.
        </motion.p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  TESTIMONIALS                                                        */
/* ------------------------------------------------------------------ */
const testimonials = [
  {
    quote:
      "Statementwise cut our bank statement processing time by 90%. What used to take hours now takes seconds. The AI accuracy is remarkable — we've processed statements from over 40 different banks without a single template.",
    author: 'Michael Torres',
    role: 'Senior Accountant, Grant Thornton',
    avatar: '/avatar-1.png',
  },
  {
    quote:
      "The balance reconciliation feature alone saved us from countless errors. When a statement doesn't reconcile, we know immediately. No more manual checking, no more missed discrepancies.",
    author: 'Sarah Chen',
    role: 'Bookkeeping Manager, CloudCount',
    avatar: '/avatar-2.png',
  },
  {
    quote:
      "We manage 80+ clients and the client portals have been transformative. Each client gets their own secure link, uploads are organized automatically, and our team has role-based access. It's exactly what a modern accounting firm needs.",
    author: 'Patricia Williams',
    role: 'CFO, Meridian Financial Group',
    avatar: '/avatar-3.png',
  },
  {
    quote:
      "I was skeptical about the 'any format' claim but it genuinely works. From community credit unions to international banks — the AI just figures it out. And credits that never expire? Finally, a company that respects its customers.",
    author: 'James Park',
    role: 'Freelance CPA',
    avatar: '/avatar-4.png',
  },
]

function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative py-32 bg-[#0B1628]">
      <div ref={ref} className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="text-center mb-12"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#78A4FF] mb-4">
            What Professionals Say
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[44px] tracking-[-0.02em] text-[#E8EEF7]">
            Trusted by Thousands of Accountants
          </h2>
        </motion.div>

        {/* Testimonial Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              variants={staggerItem}
              className="group p-8 rounded-xl border border-[#162544] transition-all duration-350 ease-out-expo hover:-translate-y-1 hover:border-[#1E3260]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(11,22,40,0.9) 0%, rgba(5,11,20,0.95) 100%)',
              }}
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="text-[#FFB020] fill-[#FFB020]"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-base text-[#E8EEF7] leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-[#E8EEF7]">{t.author}</p>
                  <p className="text-sm text-[#8BA3C7]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  FINAL CTA                                                           */
/* ------------------------------------------------------------------ */
function FinalCTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative py-32 bg-[#050B14] overflow-hidden">
      {/* Aurora combo overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 20% 50%, rgba(75,130,255,0.1), transparent), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(0,214,143,0.08), transparent)',
          opacity: 0.3,
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: easeOutExpo }}
        className="relative z-10 max-w-[800px] mx-auto px-6 text-center"
      >
        <h2 className="font-display font-medium text-3xl sm:text-4xl lg:text-[56px] lg:leading-[1.08] tracking-[-0.025em] text-[#E8EEF7]">
          Ready to Convert Your First Statement?
        </h2>
        <p className="mt-5 text-lg text-[#8BA3C7] max-w-[560px] mx-auto">
          Join thousands of accounting professionals who&apos;ve eliminated manual data
          entry. Start free, no credit card required.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: easeOutExpo, delay: 0.15 }}
          className="mt-9 flex flex-col items-center gap-4"
        >
          <Link
            to="/signup?next=/convert"
            className="btn-primary text-base px-8 py-4 animate-pulse-glow rounded-lg"
          >
            Start Converting Free
          </Link>
          <Link
            to="/pricing"
            className="text-sm text-[#78A4FF] hover:underline transition-all duration-200"
          >
            View Pricing &rarr;
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  HOME PAGE                                                           */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <TrustBar />
      <FeaturesGrid />
      <HowItWorks />
      <PricingPreview />
      <Testimonials />
      <FinalCTA />
    </div>
  )
}
