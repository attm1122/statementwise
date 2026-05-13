import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import Home from './Home'

function Wrapper() {
  return (
    <HashRouter>
      <Home />
    </HashRouter>
  )
}

describe('Home Page', () => {
  it('renders hero section with main headline', () => {
    render(<Wrapper />)
    expect(screen.getByText(/Convert Any Bank Statement/)).toBeInTheDocument()
    expect(screen.getByText(/Seconds/)).toBeInTheDocument()
  })

  it('renders eyebrow label', () => {
    render(<Wrapper />)
    expect(screen.getByText('AI-Native Bank Statement Conversion')).toBeInTheDocument()
  })

  it('renders subheadline', () => {
    const { container } = render(<Wrapper />)
    expect(container.textContent).toContain('Template-free AI extraction with 99%+ accuracy')
  })

  it('renders CTA buttons in hero', () => {
    render(<Wrapper />)
    expect(screen.getAllByText('Start Converting Free')[0]).toBeInTheDocument()
    expect(screen.getByText('Watch Demo')).toBeInTheDocument()
  })

  it('renders trust microcopy', () => {
    render(<Wrapper />)
    expect(screen.getByText(/No credit card required/)).toBeInTheDocument()
    expect(screen.getByText(/Free 50 pages/)).toBeInTheDocument()
  })

  it('renders trust bar with accounting firm names', () => {
    render(<Wrapper />)
    const firms = ['GRANT THORNTON', 'DELOITTE', 'BDO', 'RSM', 'WITHUM', 'MOSS ADAMS']
    firms.forEach((firm) => {
      expect(screen.getByText(firm)).toBeInTheDocument()
    })
  })

  it('renders Features section with header', () => {
    render(<Wrapper />)
    expect(screen.getByText('Powerful Features')).toBeInTheDocument()
    expect(screen.getByText("Everything You Need, Nothing You Don't")).toBeInTheDocument()
  })

  it('renders all 5 feature cards with titles', () => {
    render(<Wrapper />)
    const featureTitles = [
      'Template-Free AI Extraction',
      'Export to Any Format',
      'Automatic Balance Reconciliation',
      'Secure Client Portals',
      'Credits That Last Forever',
    ]
    featureTitles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('renders How It Works section with 3 steps', () => {
    render(<Wrapper />)
    expect(screen.getByText('How It Works')).toBeInTheDocument()
    expect(screen.getByText('From PDF to Clean Data in Three Steps')).toBeInTheDocument()
    expect(screen.getByText('Upload Your Statement')).toBeInTheDocument()
    expect(screen.getByText('AI Extracts Everything')).toBeInTheDocument()
    expect(screen.getByText('Export & Done')).toBeInTheDocument()
  })

  it('renders Pricing Preview section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Simple Pricing')).toBeInTheDocument()
    expect(screen.getByText('Pay for What You Use. Nothing More.')).toBeInTheDocument()
  })

  it('renders 3 pricing tiers', () => {
    const { container } = render(<Wrapper />)
    expect(container.textContent).toContain('Free')
    expect(container.textContent).toContain('Pro')
    expect(container.textContent).toContain('Scale')
  })

  it('renders monthly/annual toggle', () => {
    render(<Wrapper />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('renders testimonials section', () => {
    render(<Wrapper />)
    expect(screen.getByText('What Professionals Say')).toBeInTheDocument()
    expect(screen.getByText('Trusted by Thousands of Accountants')).toBeInTheDocument()
  })

  it('renders all 4 testimonials with authors', () => {
    render(<Wrapper />)
    const authors = [
      'Michael Torres',
      'Sarah Chen',
      'Patricia Williams',
      'James Park',
    ]
    authors.forEach((author) => {
      expect(screen.getByText(author)).toBeInTheDocument()
    })
  })

  it('renders Final CTA section', () => {
    const { container } = render(<Wrapper />)
    expect(screen.getByText('Ready to Convert Your First Statement?')).toBeInTheDocument()
    expect(container.textContent).toContain('View Pricing')
  })

  it('renders hero image with alt text', () => {
    render(<Wrapper />)
    const img = screen.getByAltText('Statementwise Dashboard Preview')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/hero-dashboard-preview.png')
  })

  it('renders navigation links that work', () => {
    render(<Wrapper />)
    const startLink = screen.getAllByText('Start Converting Free')[0]
    expect(startLink.closest('a')).toHaveAttribute('href', '#/signup?next=/convert')
  })
})
