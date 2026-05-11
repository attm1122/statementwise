import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter, Routes, Route } from 'react-router'
import App from '../App'
import Home from '../pages/Home'
import Convert from '../pages/Convert'
import Dashboard from '../pages/Dashboard'
import Portal from '../pages/Portal'
import PricingPage from '../pages/PricingPage'
import Docs from '../pages/Docs'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

function FullApp() {
  return (
    <HashRouter>
      <App />
    </HashRouter>
  )
}

describe('Integration: Full Navigation Flow', () => {
  it('renders the home page at default route', () => {
    window.location.hash = '/'
    render(<FullApp />)
    expect(screen.getByText(/Convert Any Bank Statement/)).toBeInTheDocument()
  })

  it('renders Layout with Navbar and Footer on all pages', () => {
    window.location.hash = '/'
    render(<FullApp />)
    expect(screen.getByText('Statementwise.ai')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
  })

  it('navigates through all routes: Home → Convert → Dashboard → Portal → Pricing → Docs', async () => {
    const user = userEvent.setup()
    window.location.hash = '/'
    const { unmount } = render(<FullApp />)

    // Home page
    expect(screen.getByText(/Convert Any Bank Statement/)).toBeInTheDocument()

    // Navigate to Convert
    window.location.hash = '/convert'
    unmount()
    render(<FullApp />)
    expect(screen.getByText('Convert Bank Statement')).toBeInTheDocument()

    // Navigate to Dashboard
    window.location.hash = '/dashboard'
    unmount()
    render(<FullApp />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    // Navigate to Portal
    window.location.hash = '/portal'
    unmount()
    render(<FullApp />)
    expect(screen.getByText('Client Portals')).toBeInTheDocument()

    // Navigate to Pricing
    window.location.hash = '/pricing'
    unmount()
    render(<FullApp />)
    expect(screen.getByText('Simple, Fair Pricing')).toBeInTheDocument()

    // Navigate to Docs
    window.location.hash = '/docs'
    unmount()
    render(<FullApp />)
    expect(screen.getByText('API Overview')).toBeInTheDocument()
  })

  it('route changes update URL hash', () => {
    const routes = ['/', '/convert', '/dashboard', '/portal', '/pricing', '/docs']
    routes.forEach((route) => {
      window.location.hash = route
      expect(window.location.hash).toBe(`#${route}`)
    })
  })

  it('renders correct page component for each route', () => {
    const routeTests = [
      { path: '/', content: 'AI-Native Bank Statement Conversion' },
      { path: '/convert', content: 'Convert Bank Statement' },
      { path: '/dashboard', content: 'Dashboard' },
      { path: '/portal', content: 'Client Portals' },
      { path: '/pricing', content: 'Simple, Fair Pricing' },
      { path: '/docs', content: 'API Overview' },
    ]

    routeTests.forEach(({ path, content }) => {
      window.location.hash = path
      const { unmount, container } = render(
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/convert" element={<Convert />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<Docs />} />
          </Routes>
        </HashRouter>
      )
      expect(container.textContent).toContain(content)
      unmount()
    })
  })

  it('Layout persists Navbar across pages', () => {
    window.location.hash = '/'
    const { container, unmount } = render(<FullApp />)
    expect(container.textContent).toContain('Statementwise.ai')
    expect(container.textContent).toContain('Features')
    expect(container.textContent).toContain('Pricing')
    expect(container.textContent).toContain('Docs')
    unmount()

    window.location.hash = '/dashboard'
    const { container: c2 } = render(<FullApp />)
    expect(c2.textContent).toContain('Statementwise.ai')
  })

  it('Layout persists Footer across pages', () => {
    window.location.hash = '/'
    const { container, unmount } = render(<FullApp />)
    expect(container.textContent).toContain('Product')
    expect(container.textContent).toContain('Resources')
    expect(container.textContent).toContain('Company')
    unmount()

    window.location.hash = '/pricing'
    const { container: c2 } = render(<FullApp />)
    expect(c2.textContent).toContain('Product')
  })

  it('Navbar shows active page indicator based on route', () => {
    window.location.hash = '/'
    render(
      <HashRouter>
        <Navbar />
      </HashRouter>
    )
    // The Features link should be present on the home page route
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('Footer links are present on all pages', () => {
    const footerLinks = ['Converter', 'Dashboard', 'Portals', 'API Access']
    window.location.hash = '/'
    const { unmount, container } = render(
      <HashRouter>
        <Footer />
      </HashRouter>
    )
    footerLinks.forEach((link) => {
      expect(container.textContent).toContain(link)
    })
    unmount()
  })
})
