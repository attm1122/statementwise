/**
 * RouteGuard Component
 *
 * Protects routes based on authentication status and user roles.
 * Unauthenticated users are redirected. Unauthorized roles see access denied.
 *
 * OWASP: A01:2021 — Broken Access Control
 */

import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { motion } from 'framer-motion'
import { ShieldAlert, Loader2 } from 'lucide-react'
import { useAuthGuard } from '@/hooks/useAuthGuard'

interface RouteGuardProps {
  children: ReactNode
  requiredRoles?: string[]
  redirectTo?: string
}

export default function RouteGuard({
  children,
  requiredRoles = ['individual', 'firm', 'client', 'admin'],
  redirectTo = '/',
}: RouteGuardProps) {
  const { isAuthenticated, isAuthorized, loading } = useAuthGuard({
    requiredRoles,
    redirectTo,
  })

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 size={32} className="text-[#4B82FF] animate-spin" />
        <p className="text-sm text-[#8BA3C7]">Verifying access...</p>
      </div>
    )
  }

  // Not authenticated — redirect to home
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // Authenticated but wrong role — show access denied
  if (!isAuthorized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4"
      >
        <ShieldAlert size={48} className="text-[#FFB020]" />
        <h2 className="text-xl font-semibold text-[#E8EEF7]">Access Denied</h2>
        <p className="text-sm text-[#8BA3C7] text-center max-w-md">
          You don't have permission to access this page.
          Contact your administrator if you believe this is an error.
        </p>
        <a
          href="/"
          className="mt-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
          style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
        >
          Go Home
        </a>
      </motion.div>
    )
  }

  // Authorized — render the protected content
  return <>{children}</>
}
