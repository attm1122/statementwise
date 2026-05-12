import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router'
import Docs from './Docs'

vi.mock('prism-react-renderer', () => ({
  Highlight: ({ children }: { children: (props: any) => ReactNode }) =>
    children({
      style: {},
      tokens: [
        [{ types: [], content: 'const', props: {} }],
        [{ types: [], content: 'hello', props: {} }],
      ],
      getLineProps: () => ({}),
      getTokenProps: () => ({}),
    }),
  themes: { vsDark: {} },
}))

function Wrapper() {
  return (
    <HashRouter>
      <Docs />
    </HashRouter>
  )
}

describe('Docs Page', () => {
  it('renders API Docs sidebar header', () => {
    render(<Wrapper />)
    expect(screen.getByText('API Docs')).toBeInTheDocument()
    expect(screen.getByText('v2.1')).toBeInTheDocument()
  })

  it('renders sidebar navigation sections', () => {
    render(<Wrapper />)
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
    expect(screen.getByText('API Reference')).toBeInTheDocument()
    expect(screen.getByText('Client Portals')).toBeInTheDocument()
    expect(screen.getByText('Webhooks')).toBeInTheDocument()
  })

  it('renders sidebar navigation items', () => {
    render(<Wrapper />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByText('Upload Statement')).toBeInTheDocument()
    expect(screen.getByText('Get Extraction Status')).toBeInTheDocument()
    expect(screen.getByText('Retrieve Results')).toBeInTheDocument()
    expect(screen.getByText('Export Formats')).toBeInTheDocument()
    expect(screen.getByText('Create Portal')).toBeInTheDocument()
    expect(screen.getByText('List Portals')).toBeInTheDocument()
    expect(screen.getByText('Upload to Portal')).toBeInTheDocument()
    expect(screen.getByText('Configuration')).toBeInTheDocument()
    expect(screen.getByText('Events')).toBeInTheDocument()
  })

  it('renders search input in sidebar', () => {
    render(<Wrapper />)
    expect(screen.getByPlaceholderText('Search endpoints...')).toBeInTheDocument()
  })

  it('renders main content title', () => {
    render(<Wrapper />)
    expect(screen.getByText('API Overview')).toBeInTheDocument()
  })

  it('renders overview description', () => {
    render(<Wrapper />)
    expect(screen.getByText(/Integrate Statementwise into your applications/)).toBeInTheDocument()
  })

  it('renders base URL section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Base URL')).toBeInTheDocument()
    expect(screen.getByText('https://api.statementwiseai.com/v1')).toBeInTheDocument()
  })

  it('renders Quick Start section with 3 cards', () => {
    render(<Wrapper />)
    expect(screen.getByText('Quick Start')).toBeInTheDocument()
    expect(screen.getByText('1. Get API Key')).toBeInTheDocument()
    expect(screen.getByText('2. Make a Request')).toBeInTheDocument()
    expect(screen.getByText('3. Handle the Response')).toBeInTheDocument()
  })

  it('renders SDK badges', () => {
    render(<Wrapper />)
    const sdks = ['Node.js', 'Python', 'PHP', 'Ruby', 'Go', 'cURL']
    sdks.forEach((sdk) => {
      expect(screen.getByText(sdk)).toBeInTheDocument()
    })
  })

  it('renders Authentication section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Authentication')).toBeInTheDocument()
    expect(screen.getByText('API Key')).toBeInTheDocument()
  })

  it('renders Rate Limits section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Rate Limits')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByText('Requests/Min')).toBeInTheDocument()
    expect(screen.getByText('Burst')).toBeInTheDocument()
  })

  it('renders rate limit plan rows', () => {
    render(<Wrapper />)
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0)
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('renders Upload Statement endpoint section', () => {
    render(<Wrapper />)
    expect(screen.getByText('/convert')).toBeInTheDocument()
  })

  it('renders Get Status endpoint section', () => {
    render(<Wrapper />)
    expect(screen.getByText('/convert/{id}')).toBeInTheDocument()
  })

  it('renders Retrieve Results endpoint section', () => {
    render(<Wrapper />)
    expect(screen.getByText('/convert/{id}/results')).toBeInTheDocument()
  })

  it('renders Export Formats endpoint section', () => {
    render(<Wrapper />)
    expect(screen.getByText('/convert/{id}/export')).toBeInTheDocument()
  })

  it('renders supported export format badges', () => {
    render(<Wrapper />)
    const formats = ['csv', 'xlsx', 'qbo', 'ofx', 'json']
    formats.forEach((fmt) => {
      expect(screen.getByText(fmt)).toBeInTheDocument()
    })
  })

  it('renders Client Portals section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Client Portals')).toBeInTheDocument()
  })

  it('renders Webhooks section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Webhooks')).toBeInTheDocument()
  })

  it('renders webhook events', () => {
    render(<Wrapper />)
    expect(screen.getByText('conversion.started')).toBeInTheDocument()
    expect(screen.getByText('conversion.completed')).toBeInTheDocument()
    expect(screen.getByText('conversion.failed')).toBeInTheDocument()
    expect(screen.getByText('export.completed')).toBeInTheDocument()
    expect(screen.getByText('portal.upload.received')).toBeInTheDocument()
  })

  it('renders Signature Verification section', () => {
    render(<Wrapper />)
    expect(screen.getByText('Signature Verification')).toBeInTheDocument()
  })

  it('renders security warning', () => {
    render(<Wrapper />)
    expect(screen.getByText(/Keep your API key secure/)).toBeInTheDocument()
  })

  it('renders ParamTable with required column', () => {
    render(<Wrapper />)
    expect(screen.getAllByText('Required').length).toBeGreaterThan(0)
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('renders sidebar footer with help email', () => {
    render(<Wrapper />)
    expect(screen.getByText('Need help?')).toBeInTheDocument()
    expect(screen.getByText('support@statementwise.ai')).toBeInTheDocument()
  })

  it('renders MethodBadge components for HTTP methods', () => {
    render(<Wrapper />)
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByText('GET')).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Wrapper />)
    const menuBtn = screen.getByText('Menu')
    expect(menuBtn).toBeInTheDocument()
  })

  it('renders copy button in code blocks', () => {
    render(<Wrapper />)
    const codeBlocks = screen.getAllByLabelText('Copy code')
    expect(codeBlocks.length).toBeGreaterThan(0)
  })

  it('renders copy buttons for base URL', () => {
    render(<Wrapper />)
    const copyButtons = screen.getAllByLabelText(/Copy/)
    expect(copyButtons.length).toBeGreaterThan(0)
  })
})
