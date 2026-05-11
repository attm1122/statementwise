import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PricingPage from './PricingPage'

describe('PricingPage', () => {
  it('renders hero section with headline', () => {
    render(<PricingPage />)
    expect(screen.getByText('Simple, Fair Pricing')).toBeInTheDocument()
  })

  it('renders transparent pricing label', () => {
    render(<PricingPage />)
    expect(screen.getByText('Transparent Pricing')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    render(<PricingPage />)
    expect(screen.getByText(/Credits that never expire/)).toBeInTheDocument()
  })

  it('renders billing toggle buttons', () => {
    render(<PricingPage />)
    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Annual')).toBeInTheDocument()
  })

  it('renders 3 pricing tiers', () => {
    render(<PricingPage />)
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('renders tier badges', () => {
    render(<PricingPage />)
    expect(screen.getByText('STARTER')).toBeInTheDocument()
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument()
    expect(screen.getByText('SCALE')).toBeInTheDocument()
  })

  it('renders tier prices', () => {
    render(<PricingPage />)
    expect(screen.getByText('$0')).toBeInTheDocument()
    // Pro and Business prices should be visible with monthly default
    expect(screen.getAllByText('$19').length).toBeGreaterThan(0)
    expect(screen.getAllByText('$49').length).toBeGreaterThan(0)
  })

  it('renders tier page limits', () => {
    render(<PricingPage />)
    expect(screen.getByText('500 pages/month')).toBeInTheDocument()
    expect(screen.getByText('2,000 pages/month')).toBeInTheDocument()
    expect(screen.getByText('10,000 pages/month')).toBeInTheDocument()
  })

  it('renders CTA buttons for each tier', () => {
    render(<PricingPage />)
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Start Pro Trial')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('toggles between monthly and annual billing', async () => {
    const user = userEvent.setup()
    render(<PricingPage />)

    const annualBtn = screen.getByText('Annual')
    await user.click(annualBtn)

    await waitFor(() => {
      expect(screen.getByText('Save 37%')).toBeInTheDocument()
    })
  })

  it('renders feature comparison table', () => {
    render(<PricingPage />)
    expect(screen.getByText('Complete Feature Comparison')).toBeInTheDocument()
    expect(screen.getByText('Every feature, every tier. No surprises.')).toBeInTheDocument()
  })

  it('renders comparison table headers', () => {
    render(<PricingPage />)
    expect(screen.getByText('Feature')).toBeInTheDocument()
    const freeHeaders = screen.getAllByText('Free')
    expect(freeHeaders.length).toBeGreaterThan(0)
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('renders comparison category headers', () => {
    render(<PricingPage />)
    expect(screen.getByText('AI Extraction')).toBeInTheDocument()
    expect(screen.getByText('Export')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Support')).toBeInTheDocument()
  })

  it('renders comparison feature rows', () => {
    render(<PricingPage />)
    expect(screen.getByText('AI Extraction Accuracy')).toBeInTheDocument()
    expect(screen.getByText('Pages/Month')).toBeInTheDocument()
    expect(screen.getByText('Credit Rollover')).toBeInTheDocument()
    expect(screen.getByText('CSV Export')).toBeInTheDocument()
    expect(screen.getByText('QBO Export')).toBeInTheDocument()
    expect(screen.getByText('Balance Reconciliation')).toBeInTheDocument()
    expect(screen.getByText('Client Portals')).toBeInTheDocument()
    expect(screen.getByText('API Access')).toBeInTheDocument()
  })

  it('renders credit system explanation section', () => {
    render(<PricingPage />)
    expect(screen.getByText('Credit System')).toBeInTheDocument()
    expect(screen.getByText('Credits That Last Forever')).toBeInTheDocument()
  })

  it('renders 4 credit system steps', () => {
    render(<PricingPage />)
    expect(screen.getByText('Buy Credits')).toBeInTheDocument()
    expect(screen.getByText('Use Anytime')).toBeInTheDocument()
    expect(screen.getByText('Fair Billing')).toBeInTheDocument()
    expect(screen.getByText('Top Up Anytime')).toBeInTheDocument()
  })

  it('renders never-expire card', () => {
    render(<PricingPage />)
    expect(screen.getByText(/Your credits NEVER expire/)).toBeInTheDocument()
  })

  it('renders FAQ section with heading', () => {
    render(<PricingPage />)
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<PricingPage />)
    expect(screen.getByText('What happens to unused credits?')).toBeInTheDocument()
    expect(screen.getByText('Can I change plans?')).toBeInTheDocument()
    expect(screen.getByText('Is there a free trial?')).toBeInTheDocument()
    expect(screen.getByText('Do you offer refunds?')).toBeInTheDocument()
    expect(screen.getByText('What export formats are supported?')).toBeInTheDocument()
    expect(screen.getByText('Is my data secure?')).toBeInTheDocument()
  })

  it('expands FAQ accordion on click', async () => {
    const user = userEvent.setup()
    render(<PricingPage />)

    const faqQuestion = screen.getByText('What happens to unused credits?')
    await user.click(faqQuestion)

    await waitFor(() => {
      expect(screen.getByText(/They roll over automatically/)).toBeInTheDocument()
    })
  })

  it('renders final CTA section', () => {
    render(<PricingPage />)
    expect(screen.getByText('Still Have Questions?')).toBeInTheDocument()
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('renders footer note in CTA', () => {
    render(<PricingPage />)
    expect(screen.getByText(/No credit card required/)).toBeInTheDocument()
    expect(screen.getByText(/14-day free trial/)).toBeInTheDocument()
  })
})
