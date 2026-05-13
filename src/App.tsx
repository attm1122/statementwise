import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import RouteGuard from './components/RouteGuard'
import SecurityProvider from './components/SecurityProvider'
import Home from './pages/Home'
import Convert from './pages/Convert'
import Dashboard from './pages/Dashboard'
import Portal from './pages/Portal'
import PricingPage from './pages/PricingPage'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import Auth from './pages/Auth'
import GDPRConsent from './components/GDPRConsent'

export default function App() {
  return (
    <SecurityProvider>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/signin" element={<Auth mode="signin" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />

          {/* Protected Routes — Require Authentication */}
          <Route
            path="/convert"
            element={
              <RouteGuard
                requiredRoles={['individual', 'firm', 'client', 'admin']}
                redirectTo="/signin?next=/convert"
              >
                <Convert />
              </RouteGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RouteGuard
                requiredRoles={['individual', 'firm', 'admin']}
                redirectTo="/signin?next=/dashboard"
              >
                <Dashboard />
              </RouteGuard>
            }
          />
          <Route
            path="/portal"
            element={
              <RouteGuard
                requiredRoles={['firm', 'admin']}
                redirectTo="/signin?next=/portal"
              >
                <Portal />
              </RouteGuard>
            }
          />
        </Routes>
        <GDPRConsent />
      </Layout>
    </SecurityProvider>
  )
}
