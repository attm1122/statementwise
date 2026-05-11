import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HashRouter } from 'react-router'
import { type ReactElement, type ReactNode } from 'react'

interface RenderOptions {
  route?: string
  initialEntries?: string[]
}

function Providers({ children }: { children: ReactNode }) {
  return (
    <HashRouter>
      {children}
    </HashRouter>
  )
}

export function render(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  const user = userEvent.setup()

  const result = rtlRender(ui, {
    wrapper: Providers,
    ...options,
  })

  return {
    user,
    ...result,
  }
}

export function renderWithRouter(
  ui: ReactElement,
  { route = '/' }: RenderOptions = {}
) {
  window.location.hash = route.startsWith('/') ? route : `/${route}`
  const user = userEvent.setup()

  const result = rtlRender(
    <HashRouter>{ui}</HashRouter>
  )

  return {
    user,
    ...result,
  }
}

export function renderWithUser(ui: ReactElement) {
  const user = userEvent.setup()
  const result = rtlRender(ui, { wrapper: Providers })
  return { user, ...result }
}

export * from '@testing-library/react'
export { userEvent }
