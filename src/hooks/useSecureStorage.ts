/**
 * useSecureStorage Hook
 *
 * React hook for transparent encrypted storage operations.
 * Provides type-safe read/write with automatic encryption/decryption.
 *
 * OWASP: A02:2021 — Cryptographic Failures
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { secureLocalStorage, secureSessionStorage, sensitiveStorage } from '@/lib/storage';
import type { StorageType } from '@/lib/storage';

type StorageInstance = typeof secureLocalStorage;

const storageMap: Record<StorageType, StorageInstance> = {
  local: secureLocalStorage,
  session: secureSessionStorage,
  memory: sensitiveStorage,
};

interface UseSecureStorageOptions<T> {
  storageType?: StorageType;
  defaultValue?: T;
  sensitive?: boolean;
  ttl?: number; // milliseconds
  encrypted?: boolean;
}

/**
 * Hook for encrypted storage with state synchronization.
 * Automatically syncs across components using the same key.
 */
export function useSecureStorage<T>(
  key: string,
  options: UseSecureStorageOptions<T> = {}
) {
  const {
    storageType = 'local',
    defaultValue,
    sensitive = false,
    ttl,
    encrypted = true,
  } = options;

  const storage = storageMap[storageType];
  const [value, setValueState] = useState<T | null>(defaultValue ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  // Load initial value
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const stored = await storage.getSecureItem<T>(key, defaultValue ?? null);
        if (!cancelled && isMounted.current) {
          setValueState(stored);
        }
      } catch (err) {
        if (!cancelled && isMounted.current) {
          setError(err instanceof Error ? err : new Error('Failed to load from secure storage'));
          setValueState(defaultValue ?? null);
        }
      } finally {
        if (!cancelled && isMounted.current) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [key, storage, defaultValue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Set value in secure storage.
   */
  const setValue = useCallback(
    async (newValue: T | null): Promise<void> => {
      try {
        setError(null);
        if (newValue === null) {
          storage.removeSecureItem(key);
        } else {
          await storage.setSecureItem(key, newValue, {
            sensitive,
            ttl,
            encrypted,
          });
        }
        if (isMounted.current) {
          setValueState(newValue);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err : new Error('Failed to save to secure storage'));
        }
      }
    },
    [key, storage, sensitive, ttl, encrypted]
  );

  /**
   * Remove value from secure storage.
   */
  const removeValue = useCallback(async (): Promise<void> => {
    try {
      storage.removeSecureItem(key);
      if (isMounted.current) {
        setValueState(null);
        setError(null);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('Failed to remove from secure storage'));
      }
    }
  }, [key, storage]);

  return {
    value,
    setValue,
    removeValue,
    loading,
    error,
  };
}

/**
 * Hook for memory-only sensitive storage.
 * Data never touches disk.
 */
export function useSensitiveStorage<T>(key: string, defaultValue?: T) {
  return useSecureStorage<T>(key, {
    storageType: 'memory',
    sensitive: true,
    defaultValue,
  });
}

/**
 * Hook for session-scoped encrypted storage.
 * Data cleared when browser tab closes.
 */
export function useSessionStorage<T>(key: string, defaultValue?: T) {
  return useSecureStorage<T>(key, {
    storageType: 'session',
    defaultValue,
  });
}

/**
 * Hook to track authentication state from secure storage.
 */
export function useAuthState() {
  const { value: token, loading } = useSecureStorage<string>('auth_token', {
    storageType: 'session',
    sensitive: true,
  });

  const { value: user } = useSecureStorage<{
    id: string;
    email: string;
    role: string;
    name: string;
  }>('user_data', {
    storageType: 'session',
    sensitive: true,
  });

  return {
    isAuthenticated: !!token && !!user,
    token,
    user,
    loading,
  };
}

/**
 * Hook to track session timeout.
 */
export function useSessionTimeout(timeoutMs: number = 30 * 60 * 1000) {
  const [expired, setExpired] = useState(false);
  const lastActivity = useRef(Date.now());

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

    const updateActivity = () => {
      lastActivity.current = Date.now();
      setExpired(false);
    };

    const checkTimeout = () => {
      if (Date.now() - lastActivity.current > timeoutMs) {
        setExpired(true);
      }
    };

    events.forEach((e) => window.addEventListener(e, updateActivity, { passive: true }));
    const interval = setInterval(checkTimeout, 60000); // Check every minute

    return () => {
      events.forEach((e) => window.removeEventListener(e, updateActivity));
      clearInterval(interval);
    };
  }, [timeoutMs]);

  return expired;
}
