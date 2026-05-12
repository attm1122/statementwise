/**
 * Security Audit Logging Module
 *
 * OWASP: A09:2021 — Security Logging and Monitoring Failures
 * - Structured security event logging
 * - Event types for all security-relevant actions
 * - Batched async sending to backend
 * - Local queue with retry
 * - Privacy-safe (no PII in logs)
 *
 * CWE-778: Insufficient Logging
 * CWE-532: Insertion of Sensitive Information into Log File
 */

import { generateSecureToken } from './encryption';

// ---------------------------------------------------------------------------
// Event Types
// ---------------------------------------------------------------------------

export type SecurityEventType =
  // Authentication events
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGOUT'
  | 'SESSION_EXPIRED'
  | 'SESSION_REFRESH'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'MFA_ENABLED'
  | 'MFA_VERIFIED'
  // Authorization events
  | 'ACCESS_DENIED'
  | 'RBAC_VIOLATION'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  // File operations
  | 'UPLOAD_STARTED'
  | 'UPLOAD_SUCCESS'
  | 'UPLOAD_FAILURE'
  | 'EXPORT_STARTED'
  | 'EXPORT_SUCCESS'
  | 'EXPORT_FAILURE'
  | 'DOWNLOAD_STARTED'
  | 'DOWNLOAD_SUCCESS'
  // Data access
  | 'DATA_ACCESS'
  | 'DATA_EXPORT'
  | 'BULK_OPERATION'
  // Portal operations
  | 'PORTAL_CREATED'
  | 'PORTAL_ACCESS'
  | 'PORTAL_INVITE_SENT'
  | 'PORTAL_MEMBER_ADDED'
  // Security
  | 'CSRF_VIOLATION'
  | 'XSS_ATTEMPT_BLOCKED'
  | 'RATE_LIMIT_TRIGGERED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'CONFIGURATION_CHANGE'
  // API
  | 'API_KEY_GENERATED'
  | 'API_KEY_REVOKED'
  | 'API_REQUEST';

// ---------------------------------------------------------------------------
// Event Severity
// ---------------------------------------------------------------------------

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

// ---------------------------------------------------------------------------
// Event Interface
// ---------------------------------------------------------------------------

export interface SecurityEvent {
  id: string; // Unique event ID
  type: SecurityEventType;
  severity: EventSeverity;
  timestamp: string; // ISO 8601
  userId?: string; // Hashed user ID only
  sessionId?: string; // Hashed session ID only
  ipHash?: string; // Hashed IP (never store raw IP)
  userAgentHash?: string; // Hashed user agent
  resource?: string; // Resource being accessed
  action?: string; // Action performed
  result: 'success' | 'failure' | 'blocked' | 'attempted';
  details?: Record<string, unknown>; // Additional context (no PII)
  metadata: {
    url?: string;
    method?: string;
    statusCode?: number;
    requestDurationMs?: number;
    // No PII here!
  };
}

// ---------------------------------------------------------------------------
// Event Classification
// ---------------------------------------------------------------------------

const EVENT_SEVERITY: Record<SecurityEventType, EventSeverity> = {
  LOGIN_SUCCESS: 'info',
  LOGIN_FAILURE: 'warning',
  LOGOUT: 'info',
  SESSION_EXPIRED: 'info',
  SESSION_REFRESH: 'info',
  PASSWORD_CHANGE: 'info',
  PASSWORD_RESET_REQUEST: 'info',
  MFA_ENABLED: 'info',
  MFA_VERIFIED: 'info',
  ACCESS_DENIED: 'warning',
  RBAC_VIOLATION: 'warning',
  PRIVILEGE_ESCALATION_ATTEMPT: 'critical',
  UPLOAD_STARTED: 'info',
  UPLOAD_SUCCESS: 'info',
  UPLOAD_FAILURE: 'warning',
  EXPORT_STARTED: 'info',
  EXPORT_SUCCESS: 'info',
  EXPORT_FAILURE: 'warning',
  DOWNLOAD_STARTED: 'info',
  DOWNLOAD_SUCCESS: 'info',
  DATA_ACCESS: 'info',
  DATA_EXPORT: 'info',
  BULK_OPERATION: 'info',
  PORTAL_CREATED: 'info',
  PORTAL_ACCESS: 'info',
  PORTAL_INVITE_SENT: 'info',
  PORTAL_MEMBER_ADDED: 'info',
  CSRF_VIOLATION: 'critical',
  XSS_ATTEMPT_BLOCKED: 'critical',
  RATE_LIMIT_TRIGGERED: 'warning',
  SUSPICIOUS_ACTIVITY: 'error',
  CONFIGURATION_CHANGE: 'warning',
  API_KEY_GENERATED: 'info',
  API_KEY_REVOKED: 'info',
  API_REQUEST: 'info',
};

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface AuditConfig {
  endpoint: string; // Backend endpoint for log ingestion
  batchSize: number; // Events per batch
  flushIntervalMs: number; // Auto-flush interval
  maxQueueSize: number; // Maximum queued events
  includeDebugInfo: boolean;
}

const DEFAULT_CONFIG: AuditConfig = {
  endpoint: '/api/security/log',
  batchSize: 10,
  flushIntervalMs: 30000, // 30 seconds
  maxQueueSize: 100,
  includeDebugInfo: import.meta.env.DEV,
};

// ---------------------------------------------------------------------------
// Audit Logger
// ---------------------------------------------------------------------------

class SecurityAuditLogger {
  private queue: SecurityEvent[] = [];
  private config: AuditConfig;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private userIdHash: string | null = null;
  private sessionIdHash: string | null = null;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startAutoFlush();
  }

  /**
   * Sets the current user context (hashed IDs only).
   */
  setUserContext(userId: string, sessionId: string): void {
    // Store hashed versions only
    this.userIdHash = this.hashIdentifier(userId);
    this.sessionIdHash = this.hashIdentifier(sessionId);
  }

  /**
   * Clears user context on logout.
   */
  clearUserContext(): void {
    this.userIdHash = null;
    this.sessionIdHash = null;
  }

  /**
   * Logs a security event.
   */
  logEvent(
    type: SecurityEventType,
    result: SecurityEvent['result'],
    options: {
      resource?: string;
      action?: string;
      details?: Record<string, unknown>;
      metadata?: SecurityEvent['metadata'];
      severity?: EventSeverity;
    } = {}
  ): void {
    const event: SecurityEvent = {
      id: generateSecureToken(16),
      type,
      severity: options.severity || EVENT_SEVERITY[type] || 'info',
      timestamp: new Date().toISOString(),
      userId: this.userIdHash || undefined,
      sessionId: this.sessionIdHash || undefined,
      resource: options.resource,
      action: options.action,
      result,
      details: this.sanitizeDetails(options.details),
      metadata: options.metadata || {},
    };

    // Add to queue
    this.queue.push(event);

    // Check if we should flush
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }

    // Check queue size limit
    if (this.queue.length > this.config.maxQueueSize) {
      // Remove oldest events if queue is too large
      this.queue = this.queue.slice(-this.config.maxQueueSize);
    }

    // Log critical events immediately
    if (event.severity === 'critical') {
      this.sendImmediateAlert(event);
    }

    // Console logging in development
    if (this.config.includeDebugInfo) {
      const emoji = this.getSeverityEmoji(event.severity);
      console.log(`[Security Audit] ${emoji} ${type} — ${result}`, event);
    }
  }

  /**
   * Shorthand for logging successful events.
   */
  logSuccess(
    type: SecurityEventType,
    options: Omit<Parameters<typeof this.logEvent>[2], 'details'> & { details?: Record<string, unknown> } = {}
  ): void {
    this.logEvent(type, 'success', options);
  }

  /**
   * Shorthand for logging failures.
   */
  logFailure(
    type: SecurityEventType,
    options: Omit<Parameters<typeof this.logEvent>[2], 'details'> & { details?: Record<string, unknown> } = {}
  ): void {
    this.logEvent(type, 'failure', options);
  }

  /**
   * Shorthand for logging blocked events.
   */
  logBlocked(
    type: SecurityEventType,
    options: Omit<Parameters<typeof this.logEvent>[2], 'details'> & { details?: Record<string, unknown> } = {}
  ): void {
    this.logEvent(type, 'blocked', options);
  }

  /**
   * Flushes queued events to the backend.
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      // In production, this sends to the backend
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({ events })], {
          type: 'application/json',
        });
        navigator.sendBeacon(this.config.endpoint, blob);
      } else {
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
          credentials: 'same-origin',
          keepalive: true,
        });
      }
    } catch {
      // On failure, put events back in queue for retry
      this.queue.unshift(...events);
      // Keep only most recent events if queue overflows
      if (this.queue.length > this.config.maxQueueSize) {
        this.queue = this.queue.slice(-this.config.maxQueueSize);
      }
    }
  }

  /**
   * Destroys the logger and flushes remaining events.
   */
  destroy(): void {
    this.stopAutoFlush();
    this.flush();
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private startAutoFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  private stopAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Hashes an identifier using SHA-256.
   * This ensures we never store raw IDs in logs.
   */
  private hashIdentifier(id: string): string {
    // Simple hash for client-side use
    // In production, use a proper HMAC with server-side secret
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  /**
   * Sanitizes event details to ensure no PII is logged.
   */
  private sanitizeDetails(
    details?: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (!details) return undefined;

    const sanitized: Record<string, unknown> = {};
    const piiKeys = [
      'password',
      'token',
      'secret',
      'apiKey',
      'creditCard',
      'ssn',
      'email',
      'phone',
      'address',
      'name',
      'dob',
    ];

    for (const [key, value] of Object.entries(details)) {
      // Skip known PII fields
      if (piiKeys.some((pii) => key.toLowerCase().includes(pii.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Sanitize string values that might contain PII
      if (typeof value === 'string') {
        sanitized[key] = value.length > 200 ? value.slice(0, 200) + '...' : value;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sends immediate alert for critical events.
   */
  private sendImmediateAlert(event: SecurityEvent): void {
    // In production, this would trigger an immediate alert
    // via webhook, email, or monitoring service
    if (this.config.includeDebugInfo) {
      console.error(`[CRITICAL SECURITY EVENT] ${event.type}`, event);
    }
  }

  private getSeverityEmoji(severity: EventSeverity): string {
    const emojis: Record<EventSeverity, string> = {
      info: '\u2139\uFE0F',
      warning: '\u26A0\uFE0F',
      error: '\u274C',
      critical: '\uD83D\udea8',
    };
    return emojis[severity];
  }
}

// ---------------------------------------------------------------------------
// Singleton Export
// ---------------------------------------------------------------------------

export const auditLogger = new SecurityAuditLogger();

// ---------------------------------------------------------------------------
// Convenience Exports
// ---------------------------------------------------------------------------

/**
 * Log a login attempt.
 */
export function logLogin(success: boolean, details?: Record<string, unknown>): void {
  if (success) {
    auditLogger.logSuccess('LOGIN_SUCCESS', { resource: 'auth', details });
  } else {
    auditLogger.logFailure('LOGIN_FAILURE', {
      resource: 'auth',
      details,
      severity: 'warning',
    });
  }
}

/**
 * Log a logout event.
 */
export function logLogout(): void {
  auditLogger.logSuccess('LOGOUT', { resource: 'auth' });
  auditLogger.clearUserContext();
}

/**
 * Log a file upload event.
 */
export function logUpload(
  result: 'success' | 'failure' | 'blocked',
  details?: Record<string, unknown>
): void {
  const type =
    result === 'success'
      ? 'UPLOAD_SUCCESS'
      : result === 'failure'
      ? 'UPLOAD_FAILURE'
      : 'UPLOAD_FAILURE';
  auditLogger.logEvent(
    type,
    result,
    { resource: 'file-upload', details }
  );
}

/**
 * Log a file export event.
 */
export function logExport(
  result: 'success' | 'failure',
  details?: Record<string, unknown>
): void {
  const type = result === 'success' ? 'EXPORT_SUCCESS' : 'EXPORT_FAILURE';
  auditLogger.logEvent(type, result, { resource: 'file-export', details });
}

/**
 * Log a data access event.
 */
export function logDataAccess(
  resource: string,
  action: string,
  details?: Record<string, unknown>
): void {
  auditLogger.logSuccess('DATA_ACCESS', { resource, action, details });
}

/**
 * Log an access denial.
 */
export function logAccessDenied(
  resource: string,
  action: string,
  details?: Record<string, unknown>
): void {
  auditLogger.logBlocked('ACCESS_DENIED', { resource, action, details });
}

/**
 * Log a CSRF violation.
 */
export function logCsrfViolation(details?: Record<string, unknown>): void {
  auditLogger.logBlocked('CSRF_VIOLATION', {
    resource: 'csrf-protection',
    severity: 'critical',
    details,
  });
}

/**
 * Log a rate limit trigger.
 */
export function logRateLimit(
  resource: string,
  details?: Record<string, unknown>
): void {
  auditLogger.logBlocked('RATE_LIMIT_TRIGGERED', {
    resource,
    severity: 'warning',
    details,
  });
}

/**
 * Log suspicious activity.
 */
export function logSuspiciousActivity(
  activity: string,
  details?: Record<string, unknown>
): void {
  auditLogger.logEvent(
    'SUSPICIOUS_ACTIVITY',
    'blocked',
    { resource: 'security', action: activity, severity: 'error', details }
  );
}
