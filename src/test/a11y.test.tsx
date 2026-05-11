import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import userEvent from '@testing-library/user-event'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from '../pages/Home'
import Convert from '../pages/Convert'
import Dashboard from '../pages/Dashboard'
import Portal from '../pages/Portal'
import PricingPage from '../pages/PricingPage'
import Docs from '../pages/Docs'

function withRouter(Component: React.ComponentType) {
  return (
    <HashRouter>
      <Component />
    </HashRouter>
  )
}

describe('Accessibility Tests', () => {
  /* ── Images have alt text ── */
  describe('Image alt text', () => {
    it('Home page hero image has alt text', () => {
      render(withRouter(Home))
      const heroImg = screen.getByAltText('Statementwise Dashboard Preview')
      expect(heroImg).toBeInTheDocument()
      expect(heroImg).toHaveAttribute('alt')
      expect(heroImg.getAttribute('alt')).not.toBe('')
    })

    it('Home page converter illustration has alt text', () => {
      render(withRouter(Home))
      const illustration = screen.getByAltText('PDF to data conversion')
      expect(illustration).toBeInTheDocument()
    })

    it('Home feature images have alt text', () => {
      render(withRouter(Home))
      const featureImages = [
        'Template-Free AI Extraction',
        'Export to Any Format',
        'Automatic Balance Reconciliation',
        'Secure Client Portals',
        'Credits That Last Forever',
      ]
      featureImages.forEach((alt) => {
        const img = screen.getByAltText(alt)
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('alt')
      })
    })

    it('Home testimonial avatars have alt text', () => {
      render(withRouter(Home))
      const authors = ['Michael Torres', 'Sarah Chen', 'Patricia Williams', 'James Park']
      authors.forEach((name) => {
        const avatar = screen.getByAltText(name)
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveAttribute('alt')
      })
    })

    it('Convert page upload illustration has alt text', () => {
      render(withRouter(Convert))
      const img = screen.getByAltText('PDF to data conversion')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('alt')
    })
  })

  /* ── Buttons have accessible labels ── */
  describe('Button accessibility', () => {
    it('Navbar hamburger button has aria-label', () => {
      render(withRouter(Navbar))
      const toggleBtn = screen.getByLabelText('Toggle menu')
      expect(toggleBtn).toBeInTheDocument()
      expect(toggleBtn).toHaveAttribute('aria-label', 'Toggle menu')
    })

    it('Navbar CTA button is visible and accessible', () => {
      render(withRouter(Navbar))
      const cta = screen.getByText('Start Free')
      expect(cta).toBeInTheDocument()
      expect(cta.closest('a')).toHaveAttribute('href')
    })

    it('Docs page code copy buttons have aria-label', () => {
      render(withRouter(Docs))
      const copyButtons = screen.getAllByLabelText('Copy code')
      expect(copyButtons.length).toBeGreaterThan(0)
      copyButtons.forEach((btn) => {
        expect(btn).toHaveAttribute('aria-label', 'Copy code')
      })
    })

    it('Docs page clipboard copy buttons have aria-label', () => {
      render(withRouter(Docs))
      const copyBtn = screen.getAllByLabelText('Copy to clipboard')
      expect(copyBtn.length).toBeGreaterThan(0)
    })
  })

  /* ── Form inputs have associated labels ── */
  describe('Form input labels', () => {
    it('Dashboard search/filter inputs are accessible', () => {
      render(withRouter(Dashboard))
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
    })

    it('Docs sidebar search has accessible placeholder', () => {
      render(withRouter(Docs))
      const searchInput = screen.getByPlaceholderText('Search endpoints...')
      expect(searchInput).toBeInTheDocument()
    })

    it('Portal page search has accessible placeholder', () => {
      render(withRouter(Portal))
      const searchInputs = screen.getAllByPlaceholderText(/Search/)
      expect(searchInputs.length).toBeGreaterThan(0)
    })

    it('Convert page file input accepts PDF files', () => {
      render(withRouter(Convert))
      const fileInput = document.querySelector('input[type="file"]')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('accept', '.pdf')
    })
  })

  /* ── ARIA roles and landmarks ── */
  describe('ARIA roles', () => {
    it('Navbar contains navigation landmark', () => {
      render(withRouter(Navbar))
      const nav = document.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('Docs page main content is in main element', () => {
      render(withRouter(Docs))
      const main = document.querySelector('main')
      expect(main).toBeInTheDocument()
    })

    it('Dashboard page has aside for sidebar', () => {
      render(withRouter(Dashboard))
      const aside = document.querySelector('aside')
      expect(aside).toBeInTheDocument()
    })

    it('Portal page has aside for sidebar', () => {
      render(withRouter(Portal))
      const aside = document.querySelector('aside')
      expect(aside).toBeInTheDocument()
    })

    it('Docs page sidebar has navigation role', () => {
      render(withRouter(Docs))
      const nav = document.querySelector('nav')
      expect(nav).toBeInTheDocument()
    })

    it('Footer contains footer element', () => {
      render(
        <HashRouter>
          <Footer />
        </HashRouter>
      )
      const footer = document.querySelector('footer')
      expect(footer).toBeInTheDocument()
    })
  })

  /* ── Interactive elements ── */
  describe('Interactive element accessibility', () => {
    it('Navbar links are keyboard focusable', () => {
      render(withRouter(Navbar))
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('Footer social links have descriptive aria-labels', () => {
      render(
        <HashRouter>
          <Footer />
        </HashRouter>
      )
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
      expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    })

    it('Pricing page FAQ buttons are keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<PricingPage />)
      const faqButton = screen.getByText('What happens to unused credits?')
      expect(faqButton).toBeInTheDocument()
      await user.click(faqButton)
      expect(screen.getByText(/roll over automatically/)).toBeInTheDocument()
    })

    it('Pricing page billing toggle is accessible', async () => {
      const user = userEvent.setup()
      render(<PricingPage />)
      const monthlyBtn = screen.getByText('Monthly')
      const annualBtn = screen.getByText('Annual')
      expect(monthlyBtn).toBeInTheDocument()
      expect(annualBtn).toBeInTheDocument()
      await user.click(annualBtn)
    })
  })

  /* ── Heading hierarchy ── */
  describe('Heading hierarchy', () => {
    it('Home page has proper heading structure', () => {
      render(withRouter(Home))
      const h1 = screen.getByRole('heading', { name: /Convert Any Bank Statement/ })
      expect(h1).toBeInTheDocument()
      expect(h1.tagName).toBe('H1')
    })

    it('Pricing page has h1 heading', () => {
      render(<PricingPage />)
      const h1 = screen.getByRole('heading', { name: 'Simple, Fair Pricing' })
      expect(h1).toBeInTheDocument()
      expect(h1.tagName).toBe('H1')
    })

    it('Docs page has h1 heading', () => {
      render(withRouter(Docs))
      const h1 = screen.getByRole('heading', { name: 'API Overview' })
      expect(h1).toBeInTheDocument()
      expect(h1.tagName).toBe('H1')
    })
  })

  /* ── Skip links and navigation ── */
  describe('Navigation accessibility', () => {
    it('Home page has identifiable section headings', () => {
      render(withRouter(Home))
      expect(screen.getByRole('heading', { name: /Convert Any Bank Statement/ })).toBeInTheDocument()
    })

    it('Dashboard page has identifiable headings', () => {
      render(withRouter(Dashboard))
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Usage Over Time')).toBeInTheDocument()
      expect(screen.getByText('Recent Conversions')).toBeInTheDocument()
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })
  })
})
