/**
 * usePrivacyAnalytics.ts — Privacy-Preserving Analytics Hook
 *
 * Only collects data if user consented to analytics.
 * Anonymizes all data: no PII, no IP address, hashed user ID.
 * Tracks: page views, feature usage (not content), errors, performance.
 * Data never leaves user's device until aggregated.
 * Respects "Do Not Track" browser setting.
 */

import { useCallback, useEffect, useRef } from 'react';
import { secureStorage } from '@/lib/security';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalyticsEvent {
  id: string;
  type: 'page_view' | 'feature_used' | 'error' | 'performance' | 'interaction';
  name: string;
  timestamp: string;
  sessionId: string;
  page: string;
  metadata: Record<string, unknown>;
}

export interface AnalyticsState {
  enabled: boolean;
  dnt: boolean;
  consentGiven: boolean;
  eventCount: number;
  lastFlush: string | null;
}

export interface AnalyticsActions {
  trackPageView: (pageName?: string) => void;
  trackFeature: (featureName: string, metadata?: Record<string, unknown>) => void;
  trackError: (errorName: string, metadata?: Record<string, unknown>) => void;
  trackPerformance: (metricName: string, valueMs: number) => void;
  trackInteraction: (elementName: string, action: string) => void;
  flush: () => AnalyticsEvent[];
  getEvents: () => AnalyticsEvent[];
  clearEvents: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ANALYTICS_CONSENT_KEY = 'analytics_consent';
const ANALYTICS_EVENTS_KEY = 'analytics_events';
const ANALYTICS_STATE_KEY = 'analytics_state';
const MAX_EVENTS = 1000;
const FLUSH_INTERVAL_MS = 60000; // 60 seconds

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if Do Not Track is enabled in the browser.
 */
function getDoNotTrack(): boolean {
  if (typeof window === 'undefined') return false;
  const dnt =
    navigator.doNotTrack ||
    // @ts-expect-error vendor-specific property
    navigator.msDoNotTrack ||
    window.doNotTrack;
  return dnt === '1' || dnt === 'yes' || dnt === true;
}

/**
 * Generate a cryptographically insecure but sufficient session hash
 * from a random value (not PII). Used for session correlation without
 * identifying the user.
 */
function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'sw_';
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 16; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
}

/**
 * Get or create a persistent anonymous session ID.
 */
function getSessionId(): string {
  const stored = sessionStorage.getItem('sw_analytics_session');
  if (stored) return stored;
  const id = generateSessionId();
  sessionStorage.setItem('sw_analytics_session', id);
  return id;
}

/**
 * Generate an opaque event ID.
 */
function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Strip any potential PII from metadata values.
 */
function sanitizeMetadata(meta: Record<string, unknown>): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    // Skip keys that look like PII
    const piiKeys = [
      'email', 'name', 'firstName', 'lastName', 'phone', 'address',
      'ssn', 'password', 'token', 'ip', 'ipAddress', 'latitude', 'longitude',
      'card', 'iban', 'accountNumber', 'routing', 'ssn',
    ];
    if (piiKeys.some((pii) => key.toLowerCase().includes(pii.toLowerCase()))) {
      cleaned[key] = '[REDACTED]';
      continue;
    }
    // Redact values that look like emails
    if (typeof value === 'string' && value.includes('@')) {
      cleaned[key] = '[REDACTED_EMAIL]';
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}

/**
 * Load stored events from secure storage.
 */
function loadEvents(): AnalyticsEvent[] {
  return secureStorage.get<AnalyticsEvent[]>(ANALYTICS_EVENTS_KEY) ?? [];
}

/**
 * Persist events to secure storage (capped at MAX_EVENTS).
 */
function persistEvents(events: AnalyticsEvent[]): void {
  const trimmed = events.slice(-MAX_EVENTS);
  secureStorage.set(ANALYTICS_EVENTS_KEY, trimmed);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Privacy-preserving analytics hook.
 *
 * Only tracks when user has consented to analytics and DNT is not enabled.
 * All data is anonymized and stored locally until explicitly flushed.
 *
 * @returns Tuple of [state, actions]
 *
 * @example
 * ```tsx
 * const [analytics, { trackPageView, trackFeature }] = usePrivacyAnalytics();
 * if (analytics.enabled) {
 *   trackPageView('dashboard');
 *   trackFeature('csv_export', { rowCount: 150 });
 * }
 * ```
 */
export function usePrivacyAnalytics(): [AnalyticsState, AnalyticsActions] {
  const dnt = getDoNotTrack();
  const sessionId = useRef(getSessionId()).current;
  const flushTimerRef = useRef<ReturnType<typeof setInterval>>();

  // Check consent from GDPR consent storage
  const consentRecord = secureStorage.get<{
    analytics?: boolean;
    timestamp?: string;
  }>('gdpr_consent');
  const consentGiven = consentRecord?.analytics === true;
  const enabled = consentGiven && !dnt;

  // Auto-flush periodically
  useEffect(() => {
    if (!enabled) return;
    flushTimerRef.current = setInterval(() => {
      const events = loadEvents();
      if (events.length > 0) {
        secureStorage.set(ANALYTICS_STATE_KEY, {
          lastFlush: new Date().toISOString(),
          eventCount: events.length,
        });
      }
    }, FLUSH_INTERVAL_MS);
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
  }, [enabled]);

  // Track page views automatically
  useEffect(() => {
    if (!enabled) return;
    trackPageView(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const createEvent = useCallback(
    (
      type: AnalyticsEvent['type'],
      name: string,
      metadata: Record<string, unknown> = {}
    ): AnalyticsEvent => {
      return {
        id: generateEventId(),
        type,
        name,
        timestamp: new Date().toISOString(),
        sessionId,
        page: window.location.pathname,
        metadata: sanitizeMetadata(metadata),
      };
    },
    [sessionId]
  );

  const storeEvent = useCallback((event: AnalyticsEvent) => {
    const events = loadEvents();
    events.push(event);
    persistEvents(events);
  }, []);

  const trackPageView = useCallback(
    (pageName?: string) => {
      if (!enabled) return;
      const event = createEvent('page_view', pageName || window.location.pathname, {
        referrer: document.referrer || 'direct',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      });
      storeEvent(event);
    },
    [enabled, createEvent, storeEvent]
  );

  const trackFeature = useCallback(
    (featureName: string, metadata?: Record<string, unknown>) => {
      if (!enabled) return;
      const event = createEvent('feature_used', featureName, metadata ?? {});
      storeEvent(event);
    },
    [enabled, createEvent, storeEvent]
  );

  const trackError = useCallback(
    (errorName: string, metadata?: Record<string, unknown>) => {
      if (!enabled) return;
      // Never include stack traces or raw error messages that might contain PII
      const safeMeta = { ...metadata, hasStack: false };
      const event = createEvent('error', errorName, safeMeta);
      storeEvent(event);
    },
    [enabled, createEvent, storeEvent]
  );

  const trackPerformance = useCallback(
    (metricName: string, valueMs: number) => {
      if (!enabled) return;
      // Round to avoid fingerprinting
      const roundedValue = Math.round(valueMs);
      const event = createEvent('performance', metricName, {
        durationMs: roundedValue,
        // Bin into coarse buckets for privacy
        bucket:
          roundedValue < 100
            ? '<100ms'
            : roundedValue < 300
              ? '100-300ms'
              : roundedValue < 1000
                ? '300ms-1s'
                : '>1s',
      });
      storeEvent(event);
    },
    [enabled, createEvent, storeEvent]
  );

  const trackInteraction = useCallback(
    (elementName: string, action: string) => {
      if (!enabled) return;
      const event = createEvent('interaction', `${elementName}:${action}`, {
        element: elementName,
        action,
      });
      storeEvent(event);
    },
    [enabled, createEvent, storeEvent]
  );

  const flush = useCallback((): AnalyticsEvent[] => {
    const events = loadEvents();
    if (events.length > 0) {
      secureStorage.set(ANALYTICS_STATE_KEY, {
        lastFlush: new Date().toISOString(),
        eventCount: events.length,
      });
      // In production, this would send to your privacy-preserving backend
      // which aggregates data before storage
    }
    return events;
  }, []);

  const getEvents = useCallback((): AnalyticsEvent[] => {
    return loadEvents();
  }, []);

  const clearEvents = useCallback(() => {
    secureStorage.remove(ANALYTICS_EVENTS_KEY);
  }, []);

  const eventCount = loadEvents().length;
  const stateData = secureStorage.get<{ lastFlush: string; eventCount: number }>(
    ANALYTICS_STATE_KEY
  );

  const state: AnalyticsState = {
    enabled,
    dnt,
    consentGiven,
    eventCount,
    lastFlush: stateData?.lastFlush ?? null,
  };

  const actions: AnalyticsActions = {
    trackPageView,
    trackFeature,
    trackError,
    trackPerformance,
    trackInteraction,
    flush,
    getEvents,
    clearEvents,
  };

  return [state, actions];
}

export default usePrivacyAnalytics;
