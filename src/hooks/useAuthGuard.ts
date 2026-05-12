/**
 * useAuthGuard Hook
 *
 * Route guard hook for authentication and RBAC checks.
 * - Checks authentication status
 * - Validates role-based access
 * - Redirects unauthenticated/unauthorized users
 * - Handles session timeout
 *
 * OWASP: A01:2021 — Broken Access Control
 * CWE-306: Missing Authentication for Critical Function
 * CWE-862: Missing Authorization
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthState, useSessionTimeout } from './useSecureStorage';
import { auditLogger } from '@/lib/audit';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'firm' | 'client' | 'individual' | 'viewer';

export interface AuthGuardOptions {
  requiredRoles?: UserRole[];
  redirectTo?: string;
  requireAuth?: boolean;
  onAccessDenied?: () => void;
}

export interface AuthGuardResult {
  isAuthenticated: boolean;
  isAuthorized: boolean;
  userRole: UserRole | null;
  loading: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    name: string;
  } | null;
}

// ---------------------------------------------------------------------------
// Role Hierarchy
// ---------------------------------------------------------------------------

const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  firm: 3,
  client: 2,
  individual: 1,
  viewer: 0,
};

/**
 * Checks if a role has access to a resource requiring minimum role.
 */
export function hasMinimumRole(
  userRole: UserRole | null,
  minimumRole: UserRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Checks if a role is in the allowed roles list.
 */
export function hasRequiredRole(
  userRole: UserRole | null,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

// ---------------------------------------------------------------------------
// Protected Routes Configuration
// ---------------------------------------------------------------------------

interface RouteConfig {
  path: string;
  requireAuth: boolean;
  requiredRoles: UserRole[];
}

export const PROTECTED_ROUTES: RouteConfig[] = [
  { path: '/dashboard', requireAuth: true, requiredRoles: ['individual', 'firm', 'admin'] },
  { path: '/portal', requireAuth: true, requiredRoles: ['firm', 'admin'] },
  { path: '/convert', requireAuth: true, requiredRoles: ['individual', 'firm', 'client', 'admin'] },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuthGuard(options: AuthGuardOptions = {}): AuthGuardResult {
  const {
    requiredRoles = [],
    redirectTo = '/',
    requireAuth = true,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(!requireAuth);
  const checkedRef = useRef(false);

  const {
    isAuthenticated,
    user,
    loading: authLoading,
  } = useAuthState();

  // Check session timeout (30 minutes default)
  const sessionExpired = useSessionTimeout(30 * 60 * 1000);

  // Determine user role
  const userRole = (user?.role?.toLowerCase() as UserRole) || null;

  // Perform auth check
  useEffect(() => {
    if (authLoading || checkedRef.current) return;
    checkedRef.current = true;

    // If no auth required, allow
    if (!requireAuth) {
      setIsAuthorized(true);
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      auditLogger.logBlocked('ACCESS_DENIED', {
        resource: location.pathname,
        action: 'route_access',
        details: { reason: 'not_authenticated' },
      });
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check role-based access
    if (requiredRoles.length > 0 && !hasRequiredRole(userRole, requiredRoles)) {
      setIsAuthorized(false);
      auditLogger.logBlocked('RBAC_VIOLATION', {
        resource: location.pathname,
        action: 'role_check',
        details: {
          requiredRoles,
          userRole,
          reason: 'insufficient_privileges',
        },
      });
      navigate(redirectTo, { replace: true });
      return;
    }

    // All checks passed
    setIsAuthorized(true);
    auditLogger.logSuccess('DATA_ACCESS', {
      resource: location.pathname,
      action: 'route_access_granted',
    });
  }, [
    isAuthenticated,
    user,
    userRole,
    authLoading,
    requireAuth,
    requiredRoles,
    navigate,
    redirectTo,
    location.pathname,
  ]);

  // Reset checked flag when route changes
  useEffect(() => {
    checkedRef.current = false;
  }, [location.pathname]);

  // Handle session timeout
  useEffect(() => {
    if (sessionExpired && isAuthenticated) {
      auditLogger.logEvent('SESSION_EXPIRED', 'success', {
        resource: 'session',
        action: 'timeout',
      });
      // Navigate to home (logout will be handled by auth context)
      navigate(redirectTo, { replace: true });
    }
  }, [sessionExpired, isAuthenticated, navigate, redirectTo]);

  return {
    isAuthenticated,
    isAuthorized: isAuthenticated && isAuthorized,
    userRole,
    loading: authLoading,
    user,
  };
}

// ---------------------------------------------------------------------------
// Simplified Auth Check (no redirect)
// ---------------------------------------------------------------------------

/**
 * Hook that checks auth state without redirecting.
 * Useful for conditional UI rendering.
 */
export function useAuthCheck(): {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: AuthGuardResult['user'];
  loading: boolean;
} {
  const { isAuthenticated, user, loading } = useAuthState();
  const userRole = (user?.role?.toLowerCase() as UserRole) || null;

  return { isAuthenticated, userRole, user, loading };
}

// ---------------------------------------------------------------------------
// Route Guard Component
// ---------------------------------------------------------------------------

/**
 * Props for RouteGuard component.
 */
interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Component wrapper for route-level auth guards.
 * Usage: <RouteGuard requiredRoles={['firm', 'admin']}><Portal /></RouteGuard>
 */
export function RouteGuard({
  children,
  requiredRoles = [],
  redirectTo = '/',
  fallback,
}: RouteGuardProps): React.ReactNode {
  const { isAuthenticated, isAuthorized, loading } = useAuthGuard({
    requiredRoles,
    redirectTo,
    requireAuth: true,
  });

  if (loading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4B82FF] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#8BA3C7]">Verifying access...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return children;
}

// ---------------------------------------------------------------------------
// Conditional Render Hook
// ---------------------------------------------------------------------------

/**
 * Hook for conditionally rendering based on auth state.
 */
export function useConditionalRender(
  condition: 'authenticated' | 'unauthenticated' | 'admin' | 'firm'
): boolean {
  const { isAuthenticated, userRole } = useAuthCheck();

  switch (condition) {
    case 'authenticated':
      return isAuthenticated;
    case 'unauthenticated':
      return !isAuthenticated;
    case 'admin':
      return isAuthenticated && userRole === 'admin';
    case 'firm':
      return isAuthenticated && (userRole === 'firm' || userRole === 'admin');
    default:
      return false;
  }
}
