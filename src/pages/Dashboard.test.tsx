import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { HashRouter } from 'react-router'
import Dashboard from './Dashboard'

vi.mock('react-countup', () => ({
  default: function MockCountUp({ end, suffix, prefix }: { end: number; suffix?: string; prefix?: string }) {
    return <span data-testid="countup">{prefix}{end.toLocaleString()}{suffix}</span>
  },
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container" style={{ width: '100%', height: '100%' }}>{children}</div>
  ),
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Legend: () => <div data-testid="legend" />,
}))

function Wrapper() {
  return (
    <HashRouter>
      <Dashboard />
    </HashRouter>
  )
}

describe('Dashboard Page', () => {
  it('renders Dashboard heading', () => {
    render(<Wrapper />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders all 4 stat cards', () => {
    render(<Wrapper />)
    expect(screen.getByText('Total Conversions')).toBeInTheDocument()
    expect(screen.getByText('Pages Processed')).toBeInTheDocument()
    expect(screen.getByText('Credits Remaining')).toBeInTheDocument()
    expect(screen.getByText('Success Rate')).toBeInTheDocument()
  })

  it('renders usage chart section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Usage Over Time')).toBeInTheDocument()
    expect(screen.getByText('Pages')).toBeInTheDocument()
    expect(screen.getByText('Conversions')).toBeInTheDocument()
  })

  it('renders recent conversions table', () => {
    render(<Wrapper />)
    expect(screen.getByText('Recent Conversions')).toBeInTheDocument()
    expect(screen.getByText('View All')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<Wrapper />)
    const headers = ['File', 'Bank', 'Pages', 'Transactions', 'Status', 'Date']
    headers.forEach((header) => {
      const elements = screen.getAllByText(header)
      expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('renders recent conversion rows', () => {
    render(<Wrapper />)
    expect(screen.getByText('Chase_Statement_Mar2025.pdf')).toBeInTheDocument()
    expect(screen.getByText('BofA_Q1_2025.pdf')).toBeInTheDocument()
    expect(screen.getByText('WellsFargo_Business_Feb.pdf')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    render(<Wrapper />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.getByText('Flagged')).toBeInTheDocument()
  })

  it('renders quick actions section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('Convert New Statement')).toBeInTheDocument()
    expect(screen.getByText('Create Client Portal')).toBeInTheDocument()
    expect(screen.getByText('Generate API Key')).toBeInTheDocument()
    expect(screen.getByText('View Documentation')).toBeInTheDocument()
  })

  it('renders credit breakdown section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Credit Usage')).toBeInTheDocument()
  })

  it('renders credit breakdown legend', () => {
    render(<Wrapper />)
    expect(screen.getByText('Used: 1,260')).toBeInTheDocument()
    expect(screen.getByText('Remaining: 1,240')).toBeInTheDocument()
  })

  it('renders activity feed section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('renders activity feed items', () => {
    render(<Wrapper />)
    expect(screen.getByText(/Chase_Statement_Mar2025.pdf converted/)).toBeInTheDocument()
    expect(screen.getByText('Exported to QBO format')).toBeInTheDocument()
    expect(screen.getByText('Client portal created')).toBeInTheDocument()
    expect(screen.getByText('Credits topped up')).toBeInTheDocument()
  })

  it('renders sidebar navigation items', () => {
    render(<Wrapper />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Conversions')).toBeInTheDocument()
    expect(screen.getByText('Client Portals')).toBeInTheDocument()
    expect(screen.getByText('Billing & Credits')).toBeInTheDocument()
    expect(screen.getByText('API Keys')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders credit display in sidebar', () => {
    render(<Wrapper />)
    expect(screen.getByText('Credits')).toBeInTheDocument()
    expect(screen.getByText('1,240')).toBeInTheDocument()
    expect(screen.getByText(/Top Up/)).toBeInTheDocument()
  })

  it('renders user profile in sidebar', () => {
    render(<Wrapper />)
    expect(screen.getByText('Michael Torres')).toBeInTheDocument()
    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
  })

  it('renders new conversion button', () => {
    render(<Wrapper />)
    expect(screen.getByText('New Conversion')).toBeInTheDocument()
  })

  it('renders time period selector', () => {
    render(<Wrapper />)
    expect(screen.getByText('Last 30 Days')).toBeInTheDocument()
  })

  it('renders notification bell with indicator', () => {
    render(<Wrapper />)
    const bellBtn = document.querySelector('button')
    expect(bellBtn).toBeInTheDocument()
  })

  it('renders "Top Up Credits" button', () => {
    render(<Wrapper />)
    expect(screen.getByText('Top Up Credits')).toBeInTheDocument()
  })

  it('renders activity timestamps', () => {
    render(<Wrapper />)
    expect(screen.getByText('2 min ago')).toBeInTheDocument()
    expect(screen.getByText('1 min ago')).toBeInTheDocument()
    expect(screen.getByText('3 hrs ago')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
  })
})
