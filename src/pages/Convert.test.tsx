import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router'
import Convert from './Convert'

function Wrapper() {
  return (
    <HashRouter>
      <Convert />
    </HashRouter>
  )
}

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
  Toaster: () => null,
}))

describe('Convert Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload zone with title and description', () => {
    render(<Wrapper />)
    expect(screen.getByText('Convert Bank Statement')).toBeInTheDocument()
    expect(screen.getByText(/Drag and drop your PDF/)).toBeInTheDocument()
  })

  it('renders upload zone with file input instructions', () => {
    render(<Wrapper />)
    expect(screen.getByText(/Drop your bank statement PDF/)).toBeInTheDocument()
    expect(screen.getByText(/click to browse/)).toBeInTheDocument()
    expect(screen.getByText(/Supports PDF, up to 50MB/)).toBeInTheDocument()
  })

  it('renders bank format pills', () => {
    render(<Wrapper />)
    const banks = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'HSBC', 'Barclays']
    banks.forEach((bank) => {
      expect(screen.getByText(bank)).toBeInTheDocument()
    })
  })

  it('triggers file drop state change', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    const dropZone = screen.getByText(/Drop your bank statement PDF/).closest('div')
    expect(dropZone).toBeInTheDocument()

    // Simulate drag over
    if (dropZone) {
      await user.hover(dropZone)
    }
  })

  it('renders step indicator with 4 phases', () => {
    render(<Wrapper />)
    const steps = ['Upload', 'Extract', 'Review', 'Export']
    steps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument()
    })
  })

  it('renders upload illustration with alt text', () => {
    render(<Wrapper />)
    const img = screen.getByAltText('PDF to data conversion')
    expect(img).toBeInTheDocument()
  })

  it('shows the Convert Now button after file selection', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    // Find the hidden file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveClass('hidden')

    // Simulate file upload
    const file = new File(['test content'], 'Chase_Bank_Statement_April2025.pdf', {
      type: 'application/pdf',
    })
    await user.upload(fileInput, file)

    // Check file info is displayed
    await waitFor(() => {
      expect(screen.getByText('Chase_Bank_Statement_April2025.pdf')).toBeInTheDocument()
    })

    // Convert Now button should appear
    await waitFor(() => {
      expect(screen.getByText('Convert Now')).toBeInTheDocument()
    })
  })

  it('allows removing a selected file', async () => {
    const user = userEvent.setup()
    render(<Wrapper />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText('Remove')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Remove'))
  })

  it('displays bank support text', () => {
    render(<Wrapper />)
    expect(screen.getByText('Works with every bank format')).toBeInTheDocument()
    expect(screen.getByText('+1000s more')).toBeInTheDocument()
  })
})
