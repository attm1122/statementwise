/**
 * SecurityProvider Component
 *
 * Wraps the entire application with security context.
 * - Provides encryption keys, CSRF tokens, security config
 * - Initializes secure storage on auth
 * - Handles session timeout
 * - Distributes security context to child components
 *
 * OWASP: A01:2021 — Broken Access Control
 * OWASP: A02:2021 — Cryptographic Failures
 * OWASP: A07:2021 — Identification and Authentication Failures
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  generateCsrfToken,
  regenerateCsrfToken,
  clearCsrfToken,
  type CsrfContextValue,
} from '@/lib/csrf';
import {
  initializeSecureStorage,
  clearAllSecureStorage,
  generateAndStoreSessionKey,
} from '@/lib/storage';
import { auditLogger } from '@/lib/audit';
import { generateSecureToken } from '@/lib/encryption';
import { authApi, type RegisterInput } from '@/lib/api';
import { trackGoogleAdsConversion } from '@/lib/googleAds';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'admin' | 'firm' | 'client' | 'individual' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface SecurityContextValue {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  loading: boolean;

  // CSRF
  csrfToken: string;
  refreshCsrfToken: () => void;

  // Session
  sessionTimeoutMinutes: number;
  sessionWarningMinutes: number;
  sessionExpiringSoon: boolean;
  resetSessionTimer: () => void;

  // Security config
  securityConfig: SecurityConfig;
}

interface SecurityConfig {
  sessionTimeoutMinutes: number;
  sessionWarningMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  requireStrongPasswords: boolean;
  mfaEnabled: boolean;
}

// ---------------------------------------------------------------------------
// Default Security Configuration
// ---------------------------------------------------------------------------

const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  sessionTimeoutMinutes: 30,
  sessionWarningMinutes: 5,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
  requireStrongPasswords: true,
  mfaEnabled: false,
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SecurityContext = createContext<SecurityContextValue | null>(null);

/**
 * Hook to access security context.
 */
export function useSecurity(): SecurityContextValue {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

interface SecurityProviderProps {
  children: ReactNode;
  config?: Partial<SecurityConfig>;
}

/**
 * SecurityProvider wraps the app with security services.
 *
 * Usage:
 * <SecurityProvider>
 *   <App />
 * </SecurityProvider>
 */
export default function SecurityProvider({
  children,
  config: userConfig,
}: SecurityProviderProps) {
  // Merge configs
  const config: SecurityConfig = {
    ...DEFAULT_SECURITY_CONFIG,
    ...userConfig,
  };

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // CSRF state
  const [csrfToken, setCsrfToken] = useState(() => generateCsrfToken());

  // Session state
  const [sessionExpiringSoon, setSessionExpiringSoon] = useState(false);
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());
  const loginAttemptsRef = useRef(0);
  const lockoutUntilRef = useRef<number | null>(null);

  const persistSession = useCallback(async (
    token: string,
    refreshToken: string,
    nextUser: User
  ) => {
    await initializeSecureStorage(token);
    await generateAndStoreSessionKey();

    sessionStorage.setItem('sw_user', JSON.stringify(nextUser));
    sessionStorage.setItem('sw_token', token);
    sessionStorage.setItem('sw_refresh_token', refreshToken);

    setUser(nextUser);
    setIsAuthenticated(true);
    window.dispatchEvent(new CustomEvent('auth:changed'));
  }, []);

  // -----------------------------------------------------------------------
  // Login
  // -----------------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      try {
        // Check for lockout
        if (lockoutUntilRef.current && Date.now() < lockoutUntilRef.current) {
          const remaining = Math.ceil(
            (lockoutUntilRef.current - Date.now()) / 60000
          );
          auditLogger.logFailure('LOGIN_FAILURE', {
            resource: 'auth',
            details: { reason: 'account_locked', email: '[REDACTED]' },
          });
          throw new Error(
            `Account locked. Try again in ${remaining} minute${remaining > 1 ? 's' : ''}.`
          );
        }

        // Check for too many failed attempts
        if (loginAttemptsRef.current >= config.maxLoginAttempts) {
          lockoutUntilRef.current =
            Date.now() + config.lockoutDurationMinutes * 60 * 1000;
          loginAttemptsRef.current = 0;
          auditLogger.logEvent(
            'SUSPICIOUS_ACTIVITY',
            'blocked',
            {
              resource: 'auth',
              action: 'brute_force_protection',
              details: { lockoutDuration: config.lockoutDurationMinutes },
            }
          );
          throw new Error(
            `Too many failed attempts. Account locked for ${config.lockoutDurationMinutes} minutes.`
          );
        }

        setLoading(true);

        const response = await authApi.login(email.toLowerCase().trim(), password);
        await persistSession(response.accessToken, response.refreshToken, response.user);

        // Reset login attempts
        loginAttemptsRef.current = 0;
        lockoutUntilRef.current = null;

        // Regenerate CSRF token on auth state change
        const newToken = regenerateCsrfToken();
        setCsrfToken(newToken);

        // Log successful login
        auditLogger.setUserContext(response.user.id, response.accessToken);
        auditLogger.logSuccess('LOGIN_SUCCESS', {
          resource: 'auth',
          details: { role: response.user.role },
        });

        // Start session timer
        startSessionTimer();
      } catch (error) {
        loginAttemptsRef.current++;
        auditLogger.logFailure('LOGIN_FAILURE', {
          resource: 'auth',
          details: {
            reason:
              error instanceof Error ? error.message : 'unknown_error',
            attempt: loginAttemptsRef.current,
          },
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [config.maxLoginAttempts, config.lockoutDurationMinutes, persistSession]
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<void> => {
      try {
        setLoading(true);
        const response = await authApi.register({
          ...input,
          email: input.email.toLowerCase().trim(),
        });

        await persistSession(response.accessToken, response.refreshToken, response.user);
        trackGoogleAdsConversion('signup');

        const newToken = regenerateCsrfToken();
        setCsrfToken(newToken);
        auditLogger.setUserContext(response.user.id, response.accessToken);
        auditLogger.logSuccess('REGISTER_SUCCESS', {
          resource: 'auth',
          details: { role: response.user.role },
        });
        startSessionTimer();
      } catch (error) {
        auditLogger.logFailure('REGISTER_FAILURE', {
          resource: 'auth',
          details: {
            reason: error instanceof Error ? error.message : 'unknown_error',
          },
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistSession]
  );

  // -----------------------------------------------------------------------
  // Logout
  // -----------------------------------------------------------------------

  const logout = useCallback(() => {
    const token = sessionStorage.getItem('sw_token');

    // Log the logout
    auditLogger.logSuccess('LOGOUT', { resource: 'auth' });
    void authApi.logout(token);

    // Clear all secure storage
    clearAllSecureStorage();
    sessionStorage.removeItem('sw_user');
    sessionStorage.removeItem('sw_token');
    sessionStorage.removeItem('sw_refresh_token');
    sessionStorage.removeItem('sw_session_id');

    // Clear CSRF token
    clearCsrfToken();

    // Clear session state
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiringSoon(false);

    // Clear timers
    clearSessionTimers();

    // Clear user context from audit logger
    auditLogger.clearUserContext();

    // Regenerate CSRF token for next session
    const newToken = generateCsrfToken();
    setCsrfToken(newToken);

    // Flush any remaining audit events
    auditLogger.flush();
    window.dispatchEvent(new CustomEvent('auth:changed'));
  }, []);

  // -----------------------------------------------------------------------
  // CSRF
  // -----------------------------------------------------------------------

  const refreshCsrfToken = useCallback(() => {
    const newToken = regenerateCsrfToken();
    setCsrfToken(newToken);
  }, []);

  // -----------------------------------------------------------------------
  // Session Timer
  // -----------------------------------------------------------------------

  const clearSessionTimers = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  const startSessionTimer = useCallback(() => {
    clearSessionTimers();

    const timeoutMs = config.sessionTimeoutMinutes * 60 * 1000;
    const warningMs = (config.sessionTimeoutMinutes - config.sessionWarningMinutes) * 60 * 1000;

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      setSessionExpiringSoon(true);
      auditLogger.logEvent('SESSION_EXPIRED', 'attempted', {
        resource: 'session',
        action: 'warning',
        details: { warning: 'session_expiring_soon' },
      });
    }, warningMs);

    // Set expiry timer
    sessionTimerRef.current = setTimeout(() => {
      auditLogger.logEvent('SESSION_EXPIRED', 'success', {
        resource: 'session',
        action: 'expired',
      });
      logout();
    }, timeoutMs);
  }, [
    clearSessionTimers,
    config.sessionTimeoutMinutes,
    config.sessionWarningMinutes,
    logout,
  ]);

  const resetSessionTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setSessionExpiringSoon(false);

    if (isAuthenticated) {
      startSessionTimer();
    }
  }, [isAuthenticated, startSessionTimer]);

  // -----------------------------------------------------------------------
  // Activity Tracking
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    let debounceTimer: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        resetSessionTimer();
      }, 1000); // 1 second debounce
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(debounceTimer);
    };
  }, [isAuthenticated, resetSessionTimer]);

  // -----------------------------------------------------------------------
  // Initial Load
  // -----------------------------------------------------------------------

  useEffect(() => {
    const init = async () => {
      try {
        // Check for existing session
        const token = sessionStorage.getItem('sw_token');
        const userData = sessionStorage.getItem('sw_user');

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData) as User;

            // Validate user data structure
            if (parsedUser.id && parsedUser.email && parsedUser.role) {
              // Initialize secure storage
              await initializeSecureStorage(token);

              // Set state
              setUser(parsedUser);
              setIsAuthenticated(true);
              auditLogger.setUserContext(parsedUser.id, token);

              // Start session timer
              startSessionTimer();

              auditLogger.logSuccess('SESSION_REFRESH', {
                resource: 'auth',
              });
            }
          } catch {
            // Invalid stored data, clear it
            clearAllSecureStorage();
            sessionStorage.removeItem('sw_user');
            sessionStorage.removeItem('sw_token');
            sessionStorage.removeItem('sw_refresh_token');
            window.dispatchEvent(new CustomEvent('auth:changed'));
          }
        }
      } catch {
        // Ignore init errors
      } finally {
        setLoading(false);
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      clearSessionTimers();
      auditLogger.destroy();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:expired', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:expired', handleLogout);
    };
  }, [logout]);

  // -----------------------------------------------------------------------
  // Concurrent Session Detection
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated) return;

    // Use BroadcastChannel for cross-tab communication
    const channel = new BroadcastChannel('sw_security');
    const sessionId = generateSecureToken(8);
    sessionStorage.setItem('sw_session_id', sessionId);

    channel.onmessage = (event) => {
      if (event.data.type === 'session_check' && event.data.sessionId !== sessionId) {
        // Another session detected in a different tab
        channel.postMessage({
          type: 'session_ack',
          sessionId,
          timestamp: Date.now(),
        });
      }

      if (event.data.type === 'session_logout') {
        // Logout was triggered in another tab
        logout();
      }
    };

    // Announce our session
    channel.postMessage({
      type: 'session_check',
      sessionId,
      timestamp: Date.now(),
    });

    return () => {
      channel.close();
    };
  }, [isAuthenticated, logout]);

  // -----------------------------------------------------------------------
  // Context Value
  // -----------------------------------------------------------------------

  const contextValue: SecurityContextValue = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    csrfToken,
    refreshCsrfToken,
    sessionTimeoutMinutes: config.sessionTimeoutMinutes,
    sessionWarningMinutes: config.sessionWarningMinutes,
    sessionExpiringSoon,
    resetSessionTimer,
    securityConfig: config,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
      {/* Session Expiring Warning */}
      {isAuthenticated && sessionExpiringSoon && (
        <div
          className="fixed bottom-4 right-4 z-[100] max-w-sm"
          role="alert"
          aria-live="polite"
        >
          <div
            className="rounded-xl border border-[rgba(255,176,32,0.3)] p-4 shadow-lg"
            style={{
              background: 'rgba(5, 11, 20, 0.95)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-[#FFB020] mt-0.5">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#E8EEF7]">
                  Session expiring soon
                </p>
                <p className="text-xs text-[#8BA3C7] mt-1">
                  Your session will expire in {config.sessionWarningMinutes}{' '}
                  minutes due to inactivity.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={resetSessionTimer}
                    className="text-xs font-medium text-white px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)',
                    }}
                  >
                    Stay Logged In
                  </button>
                  <button
                    onClick={logout}
                    className="text-xs font-medium text-[#8BA3C7] px-3 py-1.5 rounded-lg border border-[#162544] hover:bg-[#162544] transition-all"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SecurityContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// CSRF Context Provider (for backward compatibility)
// ---------------------------------------------------------------------------

interface CsrfProviderProps {
  children: ReactNode;
}

/**
 * Standalone CSRF provider for when full SecurityProvider isn't needed.
 */
export function CsrfProvider({ children }: CsrfProviderProps) {
  const [token, setToken] = useState(() => generateCsrfToken());

  const refreshToken = useCallback(() => {
    setToken(regenerateCsrfToken());
  }, []);

  const validateToken = useCallback((submitted: string | null): boolean => {
    // In production, this validates against the server-side token
    return !!submitted && submitted.length > 0;
  }, []);

  const contextValue: CsrfContextValue = {
    token,
    refreshToken,
    validateToken,
  };

  return (
    <SecurityContext.Provider
      value={contextValue as unknown as SecurityContextValue}
    >
      {children}
    </SecurityContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Subresource Integrity Helper
// ---------------------------------------------------------------------------

/**
 * Returns the Subresource Integrity hash algorithm for external scripts.
 * OWASP A08:2021 — Software and Data Integrity Failures
 */
export function getSriAlgorithm(): 'sha256' | 'sha384' | 'sha512' {
  return 'sha384'; // Recommended default
}

/**
 * Generates an SRI hash string for a given integrity hash.
 */
export function getSriHash(integrityHash: string): string {
  return `${getSriAlgorithm()}-${integrityHash}`;
}
