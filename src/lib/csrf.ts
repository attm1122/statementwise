/**
 * CSRF (Cross-Site Request Forgery) Protection Module
 *
 * OWASP: A01:2021 — Broken Access Control
 * OWASP: Cross-Site Request Forgery Prevention Cheat Sheet
 *
 * Implements the Double Submit Cookie pattern with token-based validation.
 * - Generates cryptographically secure tokens
 * - Validates tokens on state-changing requests
 * - Provides React context for token distribution
 *
 * CWE-352: Cross-Site Request Forgery (CSRF)
 */

import { timingSafeEqual, generateSecureToken } from './encryption';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CSRF_TOKEN_KEY = 'sw_csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Token Generation
// ---------------------------------------------------------------------------

/**
 * Generates a new CSRF token using the Web Crypto API.
 * Tokens are 32-byte base64-encoded strings.
 */
export function generateCsrfToken(): string {
  // First check for existing valid token
  const existing = getStoredToken();
  if (existing && !isTokenExpired(existing)) {
    return existing.token;
  }

  // Generate new token
  const token = generateSecureToken(32);
  storeToken(token);
  return token;
}

/**
 * Regenerates the CSRF token (e.g., on login/session change).
 * This invalidates the previous token.
 */
export function regenerateCsrfToken(): string {
  clearCsrfToken();
  return generateCsrfToken();
}

// ---------------------------------------------------------------------------
// Token Validation
// ---------------------------------------------------------------------------

/**
 * Validates a submitted CSRF token against the stored token.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function validateCsrfToken(submittedToken: string | null): boolean {
  if (!submittedToken) {
    console.warn('[Security] CSRF token missing from request');
    return false;
  }

  const stored = getStoredToken();
  if (!stored) {
    console.warn('[Security] No CSRF token stored');
    return false;
  }

  // Check expiry
  if (isTokenExpired(stored)) {
    console.warn('[Security] CSRF token expired');
    return false;
  }

  // Timing-safe comparison
  return timingSafeEqual(stored.token, submittedToken);
}

/**
 * Validates a CSRF token and regenerates if expired.
 * Returns the current valid token.
 */
export function validateAndRefreshToken(submittedToken: string | null): {
  valid: boolean;
  currentToken: string;
} {
  const valid = validateCsrfToken(submittedToken);
  const currentToken = generateCsrfToken(); // Gets existing or generates new

  return { valid, currentToken };
}

// ---------------------------------------------------------------------------
// Token Storage
// ---------------------------------------------------------------------------

interface StoredToken {
  token: string;
  createdAt: number;
}

/**
 * Stores the CSRF token in sessionStorage with timestamp.
 * Using sessionStorage ensures the token is tied to the browser tab session.
 */
function storeToken(token: string): void {
  try {
    const data: StoredToken = {
      token,
      createdAt: Date.now(),
    };
    sessionStorage.setItem(CSRF_TOKEN_KEY, JSON.stringify(data));
  } catch (e) {
    // sessionStorage may be unavailable (private mode)
    // Token will be memory-only in that case
  }
}

/**
 * Retrieves the stored CSRF token.
 */
function getStoredToken(): StoredToken | null {
  try {
    const raw = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredToken;
  } catch {
    return null;
  }
}

/**
 * Checks if the stored token has expired.
 */
function isTokenExpired(stored: StoredToken): boolean {
  return Date.now() - stored.createdAt > TOKEN_EXPIRY_MS;
}

/**
 * Clears the stored CSRF token.
 * Call on logout.
 */
export function clearCsrfToken(): void {
  try {
    sessionStorage.removeItem(CSRF_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

// ---------------------------------------------------------------------------
// HTTP Header Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the CSRF header name for HTTP requests.
 */
export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

/**
 * Returns headers object with CSRF token for fetch requests.
 */
export function getCsrfHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER_NAME]: generateCsrfToken(),
  };
}

/**
 * Creates a secure fetch wrapper that includes CSRF token.
 */
export function secureFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const csrfToken = generateCsrfToken();

  const headers = new Headers(init?.headers);
  headers.set(CSRF_HEADER_NAME, csrfToken);

  // Set additional security headers
  if (!headers.has('Content-Type') && init?.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Requested-With', 'XMLHttpRequest');

  return fetch(input, {
    ...init,
    headers,
    credentials: 'same-origin',
  });
}

// ---------------------------------------------------------------------------
// Request Classification
// ---------------------------------------------------------------------------

/**
 * Determines if an HTTP method is state-changing.
 * Only state-changing requests need CSRF protection.
 */
export function isStateChangingMethod(method: string): boolean {
  const stateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return stateChanging.includes(method.toUpperCase());
}

/**
 * Checks if a request needs CSRF protection based on method and URL.
 */
export function needsCsrfProtection(
  method: string,
  _url?: string
): boolean {
  // Safe methods (GET, HEAD, OPTIONS, TRACE) don't need CSRF
  const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
  if (safeMethods.includes(method.toUpperCase())) {
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// React Integration Types
// ---------------------------------------------------------------------------

/**
 * Context value for CSRF token distribution.
 */
export interface CsrfContextValue {
  token: string;
  refreshToken: () => void;
  validateToken: (submitted: string | null) => boolean;
}

// ---------------------------------------------------------------------------
// SameSite Cookie Helper (for backend reference)
// ---------------------------------------------------------------------------

/**
 * Returns recommended cookie settings for CSRF protection.
 * These should be implemented server-side.
 */
export function getSecureCookieSettings(): Record<string, string> {
  return {
    SameSite: 'Strict',
    Secure: 'true',
    HttpOnly: 'true',
    Path: '/',
  };
}
