/**
 * useDataRetention.ts — Secure Data Retention Timer Hook
 *
 * Manages data lifecycle with configurable retention periods.
 * Provides automatic cleanup, deletion warnings, and a visual countdown.
 * All timestamps are stored securely with consent metadata.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { secureStorage } from '@/lib/security';

export type RetentionPeriod = 7 | 30 | 90;

export interface DataRetentionState {
  /** Currently selected retention period in days */
  retentionDays: RetentionPeriod;
  /** ISO timestamp when data will be deleted */
  expiresAt: string | null;
  /** Time remaining in milliseconds */
  timeRemainingMs: number;
  /** Human-readable countdown string (e.g., "2d 14h 32m") */
  countdownText: string;
  /** Warning level: null = none, '24h' = 24h warning, '1h' = 1h warning, 'expired' = expired */
  warningLevel: '24h' | '1h' | 'expired' | null;
  /** Whether auto-delete is enabled */
  autoDeleteEnabled: boolean;
}

export interface DataRetentionActions {
  setRetentionPeriod: (days: RetentionPeriod) => void;
  resetTimer: () => void;
  clearAllData: () => void;
  toggleAutoDelete: () => void;
  snoozeWarning: () => void;
}

const RETENTION_KEY = 'data_retention';
const SNOOZE_KEY = 'retention_snooze';
const MS_PER_DAY = 86400000;

interface RetentionStorage {
  retentionDays: RetentionPeriod;
  expiresAt: string;
  autoDeleteEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Expiring now...';
  const days = Math.floor(ms / MS_PER_DAY);
  const hours = Math.floor((ms % MS_PER_DAY) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

function getWarningLevel(ms: number): DataRetentionState['warningLevel'] {
  if (ms <= 0) return 'expired';
  if (ms <= 3600000) return '1h'; // 1 hour
  if (ms <= 86400000) return '24h'; // 24 hours
  return null;
}

/**
 * Hook to manage secure data retention lifecycle.
 *
 * @param initialPeriod — Default retention period (7, 30, or 90 days)
 * @returns Tuple of [state, actions]
 *
 * @example
 * ```tsx
 * const [retention, actions] = useDataRetention(30);
 * // Show countdown: retention.countdownText
 * // Check warning: retention.warningLevel === '24h'
 * // Change period: actions.setRetentionPeriod(90);
 * ```
 */
export function useDataRetention(
  initialPeriod: RetentionPeriod = 30
): [DataRetentionState, DataRetentionActions] {
  const [retentionDays, setRetentionDaysState] = useState<RetentionPeriod>(initialPeriod);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState<number>(0);
  const [warningLevel, setWarningLevel] = useState<DataRetentionState['warningLevel']>(null);
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState<boolean>(true);
  const snoozeUntilRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Load stored retention settings on mount
  useEffect(() => {
    const stored = secureStorage.get<RetentionStorage>(RETENTION_KEY);
    const snoozeData = secureStorage.get<{ snoozeUntil: string }>(SNOOZE_KEY);

    if (stored) {
      setRetentionDaysState(stored.retentionDays);
      setExpiresAt(stored.expiresAt);
      setAutoDeleteEnabled(stored.autoDeleteEnabled);
    } else {
      // Initialize with defaults
      const now = new Date();
      const expires = new Date(now.getTime() + initialPeriod * MS_PER_DAY);
      const data: RetentionStorage = {
        retentionDays: initialPeriod,
        expiresAt: expires.toISOString(),
        autoDeleteEnabled: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      secureStorage.set(RETENTION_KEY, data);
      setExpiresAt(data.expiresAt);
    }

    if (snoozeData) {
      snoozeUntilRef.current = new Date(snoozeData.snoozeUntil).getTime();
    }
  }, [initialPeriod]);

  // Tick the countdown timer every second
  useEffect(() => {
    const tick = () => {
      if (!expiresAt) return;
      const remaining = new Date(expiresAt).getTime() - Date.now();
      const clamped = Math.max(0, remaining);
      setTimeRemainingMs(clamped);
      setWarningLevel(getWarningLevel(clamped));

      // Auto-delete when expired
      if (clamped === 0 && autoDeleteEnabled) {
        performAutoCleanup();
      }
    };

    tick(); // initial
    timerRef.current = setInterval(tick, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt, autoDeleteEnabled]);

  const persist = useCallback(
    (updates: Partial<RetentionStorage>) => {
      const existing = secureStorage.get<RetentionStorage>(RETENTION_KEY);
      const now = new Date().toISOString();
      const data: RetentionStorage = {
        retentionDays: existing?.retentionDays ?? retentionDays,
        expiresAt: existing?.expiresAt ?? new Date().toISOString(),
        autoDeleteEnabled: existing?.autoDeleteEnabled ?? autoDeleteEnabled,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        ...updates,
      };
      secureStorage.set(RETENTION_KEY, data);
    },
    [retentionDays, autoDeleteEnabled]
  );

  const performAutoCleanup = useCallback(() => {
    // Don't delete if snoozed
    if (Date.now() < snoozeUntilRef.current) return;

    // Clear statement data but keep retention settings
    secureStorage.remove('statements');
    secureStorage.remove('conversions');
    secureStorage.remove('upload_history');

    // Reset timer for next cycle
    const now = new Date();
    const newExpires = new Date(now.getTime() + retentionDays * MS_PER_DAY);
    const newData: RetentionStorage = {
      retentionDays,
      expiresAt: newExpires.toISOString(),
      autoDeleteEnabled,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    secureStorage.set(RETENTION_KEY, newData);
    setExpiresAt(newExpires.toISOString());

    // Dispatch event so UI can show notification
    window.dispatchEvent(
      new CustomEvent('dataRetention:cleanup', {
        detail: { deletedAt: now.toISOString() },
      })
    );
  }, [retentionDays, autoDeleteEnabled]);

  const setRetentionPeriod = useCallback(
    (days: RetentionPeriod) => {
      setRetentionDaysState(days);
      const now = new Date();
      const newExpires = new Date(now.getTime() + days * MS_PER_DAY);
      setExpiresAt(newExpires.toISOString());
      persist({
        retentionDays: days,
        expiresAt: newExpires.toISOString(),
        updatedAt: now.toISOString(),
      });
    },
    [persist]
  );

  const resetTimer = useCallback(() => {
    const now = new Date();
    const newExpires = new Date(now.getTime() + retentionDays * MS_PER_DAY);
    setExpiresAt(newExpires.toISOString());
    persist({
      expiresAt: newExpires.toISOString(),
      updatedAt: now.toISOString(),
    });
  }, [retentionDays, persist]);

  const clearAllData = useCallback(() => {
    // Clear all user data except retention settings
    secureStorage.remove('statements');
    secureStorage.remove('conversions');
    secureStorage.remove('upload_history');
    secureStorage.remove('user_profile');
    secureStorage.remove('consent_history');

    // Reset timer
    resetTimer();

    window.dispatchEvent(
      new CustomEvent('dataRetention:cleared', {
        detail: { clearedAt: new Date().toISOString() },
      })
    );
  }, [resetTimer]);

  const toggleAutoDelete = useCallback(() => {
    setAutoDeleteEnabled((prev) => {
      const next = !prev;
      persist({ autoDeleteEnabled: next });
      return next;
    });
  }, [persist]);

  const snoozeWarning = useCallback(() => {
    const snoozeUntil = Date.now() + 86400000; // Snooze 24 hours
    snoozeUntilRef.current = snoozeUntil;
    secureStorage.set(SNOOZE_KEY, {
      snoozeUntil: new Date(snoozeUntil).toISOString(),
    });
  }, []);

  const countdownText = formatCountdown(timeRemainingMs);

  const state: DataRetentionState = {
    retentionDays,
    expiresAt,
    timeRemainingMs,
    countdownText,
    warningLevel,
    autoDeleteEnabled,
  };

  const actions: DataRetentionActions = {
    setRetentionPeriod,
    resetTimer,
    clearAllData,
    toggleAutoDelete,
    snoozeWarning,
  };

  return [state, actions];
}

export default useDataRetention;
