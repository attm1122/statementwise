import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Convert from './pages/Convert'
import Dashboard from './pages/Dashboard'
import Portal from './pages/Portal'
import PricingPage from './pages/PricingPage'
import Docs from './pages/Docs'
import Privacy from './pages/Privacy'
import GDPRConsent from './components/GDPRConsent'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/convert" element={<Convert />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
      <GDPRConsent />
    </Layout>
  )
}
