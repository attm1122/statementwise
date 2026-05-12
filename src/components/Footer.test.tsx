import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HashRouter } from 'react-router'
import Footer from './Footer'

function Wrapper({ children }: { children: ReactNode }) {
  return <HashRouter>{children}</HashRouter>
}

describe('Footer', () => {
  it('renders all footer columns', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
  })

  it('renders brand name and description', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText('Statementwise.ai')).toBeInTheDocument()
    expect(screen.getByText('AI-native bank statement conversion for professionals.')).toBeInTheDocument()
  })

  it('renders all product links with correct hrefs', () => {
    render(<Footer />, { wrapper: Wrapper })
    const productLinks = ['Converter', 'Dashboard', 'Portals', 'API Access']
    productLinks.forEach((label) => {
      const link = screen.getByText(label)
      expect(link).toBeInTheDocument()
    })
    expect(screen.getByText('Converter').closest('a')).toHaveAttribute('href', '#/convert')
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '#/dashboard')
    expect(screen.getByText('Portals').closest('a')).toHaveAttribute('href', '#/portal')
    expect(screen.getByText('API Access').closest('a')).toHaveAttribute('href', '#/docs')
  })

  it('renders all resource links', () => {
    render(<Footer />, { wrapper: Wrapper })
    const resourceLinks = ['Documentation', 'Help Center', 'Blog', 'Changelog']
    resourceLinks.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders all company links', () => {
    render(<Footer />, { wrapper: Wrapper })
    const companyLinks = ['About', 'Pricing', 'Careers', 'Contact']
    companyLinks.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('renders social icons with aria-labels', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
  })

  it('renders social links with correct external hrefs', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByLabelText('Twitter').closest('a')).toHaveAttribute('href', 'https://twitter.com')
    expect(screen.getByLabelText('LinkedIn').closest('a')).toHaveAttribute('href', 'https://linkedin.com')
    expect(screen.getByLabelText('GitHub').closest('a')).toHaveAttribute('href', 'https://github.com')
  })

  it('renders copyright notice', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText(/2025 Statementwise.ai. All rights reserved./)).toBeInTheDocument()
  })

  it('renders bottom tagline', () => {
    render(<Footer />, { wrapper: Wrapper })
    expect(screen.getByText('Made with precision for accounting professionals.')).toBeInTheDocument()
  })

  it('social links have target and rel attributes', () => {
    render(<Footer />, { wrapper: Wrapper })
    const twitter = screen.getByLabelText('Twitter').closest('a')
    expect(twitter).toHaveAttribute('target', '_blank')
    expect(twitter).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
