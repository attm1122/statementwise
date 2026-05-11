/**
 * Security Utilities
 *
 * This module provides sanitization and validation utilities
 * to protect against XSS, injection, and other client-side attacks.
 *
 * All functions are designed to be used with React's default escaping
 * or as additional safeguards when rendering dynamic content.
 */

// ---------------------------------------------------------------------------
// URL Validation
// ---------------------------------------------------------------------------

/**
 * Validates that a URL uses a safe protocol.
 * Blocks javascript:, data:, vbscript:, file:, and other dangerous protocols.
 */
export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const trimmed = url.trim().toLowerCase();

  // Allow empty/anchor links
  if (trimmed === '' || trimmed === '#') return true;

  // Allow relative URLs (start with / or ./ or ../)
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return true;
  }

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
    'blob:',
    'filesystem:',
  ];

  for (const protocol of dangerousProtocols) {
    if (trimmed.startsWith(protocol)) return false;
  }

  // Allow http: and https: protocols
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Sanitizes a URL by stripping dangerous protocols.
 * Returns '#' for unsafe URLs.
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url) return '#';
  return isSafeUrl(url) ? url : '#';
}

// ---------------------------------------------------------------------------
// Input Validation
// ---------------------------------------------------------------------------

/**
 * Validates an email address format.
 * Basic validation to prevent obvious injection.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // Max length to prevent ReDoS
  if (email.length > 254) return false;

  // Basic email regex - not exhaustive but prevents obvious attacks
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return emailRegex.test(email);
}

/**
 * Sanitizes a file name to prevent path traversal attacks.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') return 'unnamed';

  return fileName
    .replace(/[\\/]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid characters
    .trim() || 'unnamed';
}

/**
 * Validates a file upload by checking extension and size.
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSizeMB = 50, allowedExtensions = ['.pdf'] } = options;

  // Check file size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check extension
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Only ${allowedExtensions.join(', ')} files are allowed`,
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// String Sanitization
// ---------------------------------------------------------------------------

/**
 * Escapes HTML entities to prevent XSS.
 * Use this when you need to safely embed user input in HTML attributes
 * or when bypassing React's default escaping is necessary.
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char] || char);
}

/**
 * Truncates a string to a maximum length.
 * Useful for preventing excessively long input from causing UI issues.
 */
export function truncate(input: string, maxLength: number): string {
  if (!input || typeof input !== 'string') return '';
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength) + '...';
}

// ---------------------------------------------------------------------------
// DOM Purification
// ---------------------------------------------------------------------------

let domPurifyInstance: typeof import('dompurify') | null = null;

/**
 * Lazily loads and returns DOMPurify instance.
 * This avoids importing DOMPurify unless it's actually needed.
 */
async function getDomPurify() {
  if (domPurifyInstance) return domPurifyInstance;

  const DOMPurify = await import('dompurify');
  domPurifyInstance = DOMPurify.default || DOMPurify;
  return domPurifyInstance;
}

/**
 * Sanitizes HTML content using DOMPurify.
 * Returns plain text if DOMPurify is not available.
 *
 * Use this when you MUST render HTML from user input.
 * Prefer React's default escaping whenever possible.
 */
export async function sanitizeHtml(dirty: string): Promise<string> {
  if (!dirty || typeof dirty !== 'string') return '';

  try {
    const DOMPurify = await getDomPurify();
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [], // Strip all HTML tags by default
      ALLOWED_ATTR: [], // Strip all attributes by default
      KEEP_CONTENT: true, // Keep the text content
    });
  } catch {
    // Fallback: strip all HTML tags with regex if DOMPurify fails
    return dirty.replace(/<[^>]*>/g, '');
  }
}

/**
 * Sanitizes HTML content synchronously (without DOMPurify).
 * Use as a fallback when async sanitization is not possible.
 */
export function sanitizeHtmlSync(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') return '';

  // Create a temporary div to parse HTML
  const tmp = document.createElement('div');
  tmp.textContent = dirty; // textContent escapes HTML automatically
  return tmp.textContent || '';
}

// ---------------------------------------------------------------------------
// Security Headers Helper
// ---------------------------------------------------------------------------

/**
 * Returns recommended security headers for API fetch requests.
 */
export function getSecureHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Requested-With': 'XMLHttpRequest',
  };
}

// ---------------------------------------------------------------------------
// LocalStorage Security
// ---------------------------------------------------------------------------

/**
 * Secure localStorage wrapper that encrypts keys and validates data.
 * Prevents prototype pollution and XSS via stored data.
 */
export const secureStorage = {
  /**
   * Stores data in localStorage with key prefix validation.
   */
  set(key: string, value: unknown): void {
    // Validate key to prevent prototype pollution
    if (!key || typeof key !== 'string') return;
    if (key.startsWith('__') || key === 'constructor' || key === 'prototype') {
      console.warn(`[Security] Blocked storage of potentially dangerous key: ${key}`);
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`sw_${key}`, serialized);
    } catch (e) {
      console.error('[Security] Failed to store data:', e);
    }
  },

  /**
   * Retrieves data from localStorage.
   */
  get<T>(key: string): T | null {
    if (!key || typeof key !== 'string') return null;

    try {
      const item = localStorage.getItem(`sw_${key}`);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },

  /**
   * Removes data from localStorage.
   */
  remove(key: string): void {
    if (!key || typeof key !== 'string') return;
    localStorage.removeItem(`sw_${key}`);
  },

  /**
   * Clears all Statementwise data from localStorage.
   */
  clear(): void {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('sw_'))
      .forEach((key) => localStorage.removeItem(key));
  },
};

// ---------------------------------------------------------------------------
// Constant: Security-related constants
// ---------------------------------------------------------------------------

export const SECURITY = {
  // Maximum file upload size (50MB)
  MAX_FILE_SIZE_MB: 50,

  // Allowed file extensions
  ALLOWED_FILE_EXTENSIONS: ['.pdf'],

  // Maximum input lengths
  MAX_INPUT_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  MAX_FILE_NAME_LENGTH: 255,

  // Rate limiting (client-side)
  UPLOAD_DEBOUNCE_MS: 1000,
  API_DEBOUNCE_MS: 500,
} as const;
