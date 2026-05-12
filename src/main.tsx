import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import './index.css'
import App from './App.tsx'

/**
 * Application Entry Point
 *
 * Security Hardening:
 * - Uses HashRouter for client-side routing (no SSR exposure)
 * - CSP headers configured in index.html
 * - No inline scripts or eval usage
 *
 * OWASP: A05:2021 — Security Misconfiguration
 */

// Security: Remove any global variables that could leak info
delete (window as Record<string, unknown>).__REACT_DEVTOOLS_GLOBAL_HOOK__;

// Security: Disable React DevTools in production
if (process.env.NODE_ENV === 'production') {
  // @ts-expect-error DevTools config
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
}

// Security: Prevent prototype pollution
Object.freeze(Object.prototype);

// Verify DOM element exists before rendering
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found — application cannot start');
}

createRoot(rootElement).render(
  <HashRouter>
    <App />
  </HashRouter>,
)
