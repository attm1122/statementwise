import { Link } from 'react-router'
import { Twitter, Linkedin, Github } from 'lucide-react'

const productLinks = [
  { label: 'Converter', href: '/convert' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Portals', href: '/portal' },
  { label: 'API Access', href: '/docs' },
]

const resourceLinks = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Help Center', href: '/docs' },
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
]

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-[#050B14] relative">
      {/* Top gradient accent bar */}
      <div className="h-[1px] w-full" style={{ background: 'linear-gradient(90deg, #4B82FF, #00D68F)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div>
            <Link to="/" className="font-display font-semibold text-lg text-[#E8EEF7]">
              Statementwise.ai
            </Link>
            <p className="mt-3 text-sm text-[#8BA3C7] leading-relaxed max-w-[240px]">
              AI-native bank statement conversion for professionals.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A6180] hover:text-[#4B82FF] hover:scale-110 transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A6180] hover:text-[#4B82FF] hover:scale-110 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4A6180] hover:text-[#4B82FF] hover:scale-110 transition-all duration-200"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h3 className="font-display text-xs font-semibold text-[#E8EEF7] uppercase tracking-[0.06em] mb-5">
              Product
            </h3>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#8BA3C7] hover:text-[#78A4FF] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-display text-xs font-semibold text-[#E8EEF7] uppercase tracking-[0.06em] mb-5">
              Resources
            </h3>
            <ul className="flex flex-col gap-3">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#8BA3C7] hover:text-[#78A4FF] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="font-display text-xs font-semibold text-[#E8EEF7] uppercase tracking-[0.06em] mb-5">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-[#8BA3C7] hover:text-[#78A4FF] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-[#162544] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4A6180]">
            &copy; 2025 Statementwise.ai. All rights reserved.
          </p>
          <p className="text-xs text-[#4A6180]">
            Made with precision for accounting professionals.
          </p>
        </div>
      </div>
    </footer>
  )
}
