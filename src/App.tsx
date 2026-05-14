import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
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
import {
  bindGoogleAdsConsentListener,
  trackGoogleAdsConversion,
  trackGoogleAdsPageView,
} from './lib/googleAds'

function GoogleAdsBridge() {
  const location = useLocation()

  useEffect(() => bindGoogleAdsConsentListener(), [])

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    trackGoogleAdsPageView(path)

    if (location.search.includes('checkout=success')) {
      const key = `sw_ads_purchase_${location.pathname}${location.search}`
      if (!sessionStorage.getItem(key)) {
        trackGoogleAdsConversion('purchase')
        sessionStorage.setItem(key, 'true')
      }
    }
  }, [location.pathname, location.search])

  return null
}

export default function App() {
  return (
    <SecurityProvider>
      <Layout>
        <GoogleAdsBridge />
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
