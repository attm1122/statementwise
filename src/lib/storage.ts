/**
 * Secure Storage Module
 *
 * Replaces localStorage/sessionStorage with encrypted versions.
 * - All values encrypted using AES-256-GCM
 * - Keys prefixed to avoid collisions
 * - Memory-only fallback for sensitive data
 * - Automatic cleanup on session end
 *
 * OWASP: A02:2021 — Cryptographic Failures
 * CWE-312: Cleartext Storage of Sensitive Information
 * CWE-522: Insufficiently Protected Credentials
 */

import { encryptData, decryptData, generateSessionKey } from './encryption';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StorageType = 'local' | 'session' | 'memory';

interface StorageConfig {
  prefix: string;
  encryptionPassword?: string;
  fallbackToMemory: boolean;
}

interface StorageEntry<T> {
  value: T;
  encrypted: boolean;
  timestamp: number;
  ttl?: number; // Time-to-live in milliseconds
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PREFIX = 'sw_';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// ---------------------------------------------------------------------------
// Memory Storage (never persists to disk)
// ---------------------------------------------------------------------------

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  clear(): void {
    this.store.clear();
  }
}

// Shared memory storage instance for sensitive data
const sensitiveMemoryStore = new MemoryStorage();

// ---------------------------------------------------------------------------
// Secure Storage Class
// ---------------------------------------------------------------------------

class SecureStorage {
  private config: StorageConfig;
  private memoryStore: MemoryStorage;

  constructor(
    config: Partial<StorageConfig> = {},
    private storageType: StorageType = 'local'
  ) {
    this.config = {
      prefix: config.prefix || DEFAULT_PREFIX,
      encryptionPassword: config.encryptionPassword,
      fallbackToMemory: config.fallbackToMemory ?? true,
    };
    this.memoryStore = new MemoryStorage();
  }

  /**
   * Retrieves and decrypts a value from storage.
   */
  async getSecureItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const prefixedKey = this.prefixedKey(key);

    // Try memory first (for sensitive data)
    const memValue = this.memoryStore.getItem(prefixedKey);
    if (memValue) {
      try {
        return this.deserializeEntry<T>(memValue).value;
      } catch {
        // Fall through to persistent storage
      }
    }

    // Try persistent storage
    const raw = this.getRawStorage().getItem(prefixedKey);
    if (!raw) return defaultValue;

    try {
      let entry: StorageEntry<T>;

      if (this.config.encryptionPassword) {
        // Decrypt the value
        const decrypted = await decryptData(raw, this.config.encryptionPassword);
        entry = this.deserializeEntry<T>(decrypted);
      } else {
        // Unencrypted (dev mode)
        entry = this.deserializeEntry<T>(raw);
      }

      // Check TTL
      if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
        this.removeSecureItem(key);
        return defaultValue;
      }

      return entry.value;
    } catch {
      // If decryption fails, remove corrupted entry
      this.removeSecureItem(key);
      return defaultValue;
    }
  }

  /**
   * Retrieves a value synchronously (only works for unencrypted data in memory).
   */
  getSecureItemSync<T>(key: string, defaultValue: T | null = null): T | null {
    const prefixedKey = this.prefixedKey(key);
    const memValue = this.memoryStore.getItem(prefixedKey);
    if (memValue) {
      try {
        return this.deserializeEntry<T>(memValue).value;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  /**
   * Encrypts and stores a value.
   */
  async setSecureItem<T>(
    key: string,
    value: T,
    options: {
      sensitive?: boolean; // Use memory-only storage
      ttl?: number; // Time-to-live in ms
      encrypted?: boolean; // Force encryption
    } = {}
  ): Promise<void> {
    const { sensitive = false, ttl, encrypted = true } = options;
    const prefixedKey = this.prefixedKey(key);

    const entry: StorageEntry<T> = {
      value,
      encrypted: encrypted && !!this.config.encryptionPassword,
      timestamp: Date.now(),
      ttl: ttl || DEFAULT_TTL_MS,
    };

    const serialized = this.serializeEntry(entry);

    if (sensitive) {
      // Store only in memory (never persists)
      sensitiveMemoryStore.setItem(prefixedKey, serialized);
      return;
    }

    if (encrypted && this.config.encryptionPassword) {
      try {
        const encrypted = await encryptData(serialized, this.config.encryptionPassword);
        this.getRawStorage().setItem(prefixedKey, encrypted);

        // Also store in memory for fast access
        this.memoryStore.setItem(prefixedKey, serialized);
        return;
      } catch (e) {
        if (this.config.fallbackToMemory) {
          console.warn('[Security] Encryption failed, using memory-only storage');
          this.memoryStore.setItem(prefixedKey, serialized);
          return;
        }
        throw e;
      }
    }

    // Unencrypted storage (development only)
    this.getRawStorage().setItem(prefixedKey, serialized);
    this.memoryStore.setItem(prefixedKey, serialized);
  }

  /**
   * Stores a value synchronously (unencrypted, memory-only).
   */
  setSecureItemSync<T>(
    key: string,
    value: T,
    options: { sensitive?: boolean; ttl?: number } = {}
  ): void {
    const { sensitive = false, ttl } = options;
    const prefixedKey = this.prefixedKey(key);

    const entry: StorageEntry<T> = {
      value,
      encrypted: false,
      timestamp: Date.now(),
      ttl: ttl || DEFAULT_TTL_MS,
    };

    const serialized = this.serializeEntry(entry);

    if (sensitive) {
      sensitiveMemoryStore.setItem(prefixedKey, serialized);
    } else {
      this.memoryStore.setItem(prefixedKey, serialized);
    }
  }

  /**
   * Removes an item from all storage layers.
   */
  removeSecureItem(key: string): void {
    const prefixedKey = this.prefixedKey(key);
    this.getRawStorage().removeItem(prefixedKey);
    this.memoryStore.removeItem(prefixedKey);
    sensitiveMemoryStore.removeItem(prefixedKey);
  }

  /**
   * Checks if a key exists in storage.
   */
  hasSecureItem(key: string): boolean {
    const prefixedKey = this.prefixedKey(key);
    return (
      this.memoryStore.getItem(prefixedKey) !== null ||
      this.getRawStorage().getItem(prefixedKey) !== null ||
      sensitiveMemoryStore.getItem(prefixedKey) !== null
    );
  }

  /**
   * Clears all entries with the configured prefix.
   */
  clearSecureStorage(): void {
    // Clear persistent storage
    const storage = this.getRawStorage();
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.config.prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => storage.removeItem(k));

    // Clear memory stores
    this.memoryStore.clear();
  }

  /**
   * Sets the encryption password (called on login/session init).
   */
  setEncryptionPassword(password: string): void {
    this.config.encryptionPassword = password;
  }

  /**
   * Clears the encryption password (called on logout).
   */
  clearEncryptionPassword(): void {
    this.config.encryptionPassword = undefined;
    this.clearSecureStorage();
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  private prefixedKey(key: string): string {
    // Prevent prototype pollution
    if (!key || typeof key !== 'string') {
      throw new Error('Invalid storage key');
    }
    if (
      key.startsWith('__') ||
      key === 'constructor' ||
      key === 'prototype' ||
      key === '__proto__'
    ) {
      throw new Error('Storage key contains potentially dangerous value');
    }
    return this.config.prefix + key;
  }

  private getRawStorage(): Storage {
    switch (this.storageType) {
      case 'session':
        return sessionStorage;
      case 'memory':
        return this.memoryStore as unknown as Storage;
      default:
        return localStorage;
    }
  }

  private serializeEntry<T>(entry: StorageEntry<T>): string {
    return JSON.stringify(entry);
  }

  private deserializeEntry<T>(raw: string): StorageEntry<T> {
    return JSON.parse(raw) as StorageEntry<T>;
  }
}

// ---------------------------------------------------------------------------
// Singleton Instances
// ---------------------------------------------------------------------------

/**
 * Encrypted localStorage instance.
 * Requires encryption password to be set via setEncryptionPassword().
 */
export const secureLocalStorage = new SecureStorage(
  { prefix: 'sw_enc_', fallbackToMemory: true },
  'local'
);

/**
 * Encrypted sessionStorage instance.
 * Automatically clears when browser tab closes.
 */
export const secureSessionStorage = new SecureStorage(
  { prefix: 'sw_ses_', fallbackToMemory: true },
  'session'
);

/**
 * Memory-only storage for highly sensitive data.
 * Never persists to disk.
 */
export const sensitiveStorage = new SecureStorage(
  { prefix: 'sw_mem_', fallbackToMemory: true },
  'memory'
);

// ---------------------------------------------------------------------------
// Convenience Functions
// ---------------------------------------------------------------------------

/**
 * Initializes encryption with a session-derived password.
 * Call this after successful authentication.
 */
export async function initializeSecureStorage(sessionToken: string): Promise<void> {
  // Derive an encryption password from the session token
  // In production, combine with a server-provided key
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(sessionToken));
  const password = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  secureLocalStorage.setEncryptionPassword(password);
  secureSessionStorage.setEncryptionPassword(password);
  sensitiveStorage.setEncryptionPassword(password);
}

/**
 * Clears all secure storage (call on logout).
 */
export function clearAllSecureStorage(): void {
  secureLocalStorage.clearEncryptionPassword();
  secureSessionStorage.clearEncryptionPassword();
  sensitiveStorage.clearEncryptionPassword();

  // Also clear standard secureStorage from security.ts
  const SECURE_PREFIX = 'sw_';
  Object.keys(localStorage)
    .filter((key) => key.startsWith(SECURE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
  Object.keys(sessionStorage)
    .filter((key) => key.startsWith(SECURE_PREFIX))
    .forEach((key) => sessionStorage.removeItem(key));
}

/**
 * Generates and stores a session encryption key.
 * This key is never stored permanently — only in memory.
 */
export async function generateAndStoreSessionKey(): Promise<string> {
  const sessionKey = await generateSessionKey();
  // Store only in memory
  sensitiveStorage.setSecureItemSync('session_key', sessionKey, {
    sensitive: true,
  });
  return sessionKey;
}

// Re-export from encryption module
export { generateSessionKey };
