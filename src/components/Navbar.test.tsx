import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter, Routes, Route } from 'react-router'
import Navbar from './Navbar'
import SecurityProvider from './SecurityProvider'

const navRoutes = [
  { path: '/', label: 'Features' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/docs', label: 'Docs' },
  { path: '/dashboard', label: 'Dashboard' },
]

function Wrapper({ initialRoute = '/' }: { initialRoute?: string }) {
  window.location.hash = initialRoute
  return (
    <HashRouter>
      <SecurityProvider>
        <Navbar />
      </SecurityProvider>
      <Routes>
        {navRoutes.map((r) => (
          <Route key={r.path} path={r.path} element={<div>{r.label} page</div>} />
        ))}
      </Routes>
    </HashRouter>
  )
}

describe('Navbar', () => {
  it('renders the logo with correct text', () => {
    render(<Wrapper />)
    expect(screen.getByText('Statementwise.ai')).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    render(<Wrapper />)
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders Sign In link', () => {
    render(<Wrapper />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('"Start Free" CTA button is visible and links to signup', () => {
    render(<Wrapper />)
    const startFreeBtn = screen.getByText('Start Free')
    expect(startFreeBtn).toBeInTheDocument()
    expect(startFreeBtn.closest('a')).toHaveAttribute('href', '#/signup?next=/convert')
  })

  it('toggles mobile menu on hamburger button click', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    const toggleBtn = screen.getByLabelText('Toggle menu')
    expect(toggleBtn).toBeInTheDocument()

    // Initially the mobile drawer links should not be in the document
    // (the desktop links are always there, the drawer is rendered conditionally)
    await user.click(toggleBtn)

    // After clicking, the close button should appear (inside the drawer)
    await waitFor(() => {
      expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
    })

    // Close the menu
    const closeBtn = screen.getByLabelText('Close menu')
    await user.click(closeBtn)
  })

  it('Sign In link has correct href', () => {
    render(<Wrapper />)
    const signInLink = screen.getByText('Sign In')
    expect(signInLink.closest('a')).toHaveAttribute('href', '#/signin')
  })

  it('nav links have correct hrefs', () => {
    render(<Wrapper />)
    expect(screen.getByText('Features').closest('a')).toHaveAttribute('href', '#/#features')
    expect(screen.getByText('Pricing').closest('a')).toHaveAttribute('href', '#/pricing')
    expect(screen.getByText('Docs').closest('a')).toHaveAttribute('href', '#/docs')
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '#/dashboard')
  })
})
