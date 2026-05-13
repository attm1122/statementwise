import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router'
import { Menu, X, User, Shield, Lock, LogOut, ChevronDown, Cookie } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { openConsentBanner } from './GDPRConsent'
import { useSecurity } from './SecurityProvider'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/docs' },
  { label: 'Dashboard', href: '/dashboard' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated, user, logout } = useSecurity()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) => {
    if (href.startsWith('/#')) {
      return location.pathname === '/' && location.hash === href.slice(1)
    }
    return location.pathname === href
  }

  const userMenuItems = [
    { label: 'Profile', href: '/dashboard', icon: <User size={16} /> },
    { label: 'Privacy Settings', href: '/privacy', icon: <Shield size={16} /> },
    { label: 'Security', href: '/privacy?section=security', icon: <Lock size={16} /> },
    {
      label: 'Cookie Preferences',
      href: '#',
      icon: <Cookie size={16} />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        openConsentBanner()
        setUserMenuOpen(false)
      },
    },
    {
      label: 'Logout',
      href: '#',
      icon: <LogOut size={16} />,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault()
        logout()
        setUserMenuOpen(false)
      },
      danger: true,
    },
  ]

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(5, 11, 20, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(22, 37, 68, 0.5)' : '1px solid transparent',
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-display font-semibold text-lg text-[#E8EEF7] tracking-tight hover:text-[#78A4FF] transition-colors duration-250"
          >
            Statementwise.ai
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`relative font-body text-sm font-medium transition-colors duration-250 ${
                  isActive(link.href)
                    ? 'text-[#E8EEF7]'
                    : 'text-[#8BA3C7] hover:text-[#E8EEF7]'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#4B82FF] rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated && (
              <Link
                to="/signin"
                className="font-body text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {/* User Menu */}
            {isAuthenticated && (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#162544] hover:border-[#1E3260] hover:bg-[#162544]/30 transition-all duration-200"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <div className="w-7 h-7 rounded-full bg-[rgba(75,130,255,0.2)] flex items-center justify-center">
                  <User size={14} className="text-[#4B82FF]" />
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#8BA3C7] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#0B1628] border border-[#162544] shadow-xl shadow-black/30 py-2 z-50"
                    role="menu"
                  >
                    {/* Menu header */}
                    <div className="px-3 py-2 border-b border-[#162544] mb-1">
                      <p className="text-sm font-medium text-[#E8EEF7]">{user?.name || 'Account'}</p>
                      <p className="text-[11px] text-[#4A6180]">{user?.email}</p>
                    </div>
                    {userMenuItems.map((item, idx) => (
                      <div key={item.label}>
                        {idx === userMenuItems.length - 1 && (
                          <div className="border-t border-[#162544] my-1" />
                        )}
                        {'onClick' in item && item.onClick ? (
                          <button
                            onClick={item.onClick}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors duration-150 ${
                              item.danger
                                ? 'text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.08)]'
                                : 'text-[#8BA3C7] hover:text-[#E8EEF7] hover:bg-[#162544]/40'
                            }`}
                            role="menuitem"
                          >
                            <span className={item.danger ? 'text-[#FF4D6A]' : 'text-[#4A6180]'}>
                              {item.icon}
                            </span>
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            to={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 font-body text-sm transition-colors duration-150 ${
                              item.danger
                                ? 'text-[#FF4D6A] hover:bg-[rgba(255,77,106,0.08)]'
                                : 'text-[#8BA3C7] hover:text-[#E8EEF7] hover:bg-[#162544]/40'
                            }`}
                            role="menuitem"
                          >
                            <span className={item.danger ? 'text-[#FF4D6A]' : 'text-[#4A6180]'}>
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}

            <Link
              to={isAuthenticated ? '/convert' : '/signup?next=/convert'}
              className="font-body text-sm font-semibold text-white px-5 py-2 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
            >
              Start Free
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-[#E8EEF7] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[320px] bg-[#0B1628] flex flex-col p-8"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-[#E8EEF7] p-2"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="font-display text-2xl font-medium text-[#E8EEF7] hover:text-[#78A4FF] transition-colors duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile user menu links */}
              <div className="mt-8 pt-6 border-t border-[#162544]">
                <p className="text-xs font-medium text-[#4A6180] uppercase tracking-wider mb-4">
                  Account
                </p>
                <div className="flex flex-col gap-4">
                  <Link
                    to="/privacy"
                    className="font-body text-base font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors flex items-center gap-3"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Shield size={18} />
                    Privacy Settings
                  </Link>
                  <button
                    onClick={() => {
                      openConsentBanner()
                      setMobileOpen(false)
                    }}
                    className="font-body text-base font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors flex items-center gap-3 text-left"
                  >
                    <Cookie size={18} />
                    Cookie Preferences
                  </button>
                </div>
              </div>

              <div className="mt-auto flex flex-col gap-4">
                {!isAuthenticated && (
                  <Link
                    to="/signin"
                    className="font-body text-base font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors text-center py-3"
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  to={isAuthenticated ? '/convert' : '/signup?next=/convert'}
                  className="font-body text-base font-semibold text-white px-5 py-3 rounded-full text-center transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
                >
                  Start Free
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
