/**
 * Comprehensive Input Validation & Output Encoding Module
 *
 * OWASP: A03:2021 — Injection
 * - Input sanitization for all user-provided data
 * - Output encoding for rendered content
 * - File upload validation (type, size, magic bytes)
 * - URL parameter validation
 *
 * CWE-79: Cross-site Scripting (XSS)
 * CWE-89: SQL Injection
 * CWE-22: Path Traversal
 * CWE-434: Unrestricted Upload of File with Dangerous Type
 */

import { sanitizeUrl, escapeHtml, SECURITY } from './security';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PDF_MAGIC_BYTES = [
  [0x25, 0x50, 0x44, 0x46], // %PDF
];

const MAX_FILENAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 254;
const MAX_INPUT_LENGTH = 1000;
const MAX_PORTAL_SLUG_LENGTH = 64;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  fileHash?: string;
  mimeType?: string;
}

// ---------------------------------------------------------------------------
// File Upload Validation
// ---------------------------------------------------------------------------

/**
 * Validates a file upload comprehensively.
 * Checks: extension, MIME type, magic bytes, file size.
 *
 * OWASP A04:2021 — Insecure Design
 * CWE-434: Unrestricted Upload of File with Dangerous Type
 */
export async function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedExtensions?: string[];
    allowedMimeTypes?: string[];
    checkMagicBytes?: boolean;
  } = {}
): Promise<FileValidationResult> {
  const {
    maxSizeMB = SECURITY.MAX_FILE_SIZE_MB,
    allowedExtensions = SECURITY.ALLOWED_FILE_EXTENSIONS,
    allowedMimeTypes = ['application/pdf'],
    checkMagicBytes = true,
  } = options;

  // Validate file exists
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size (prevent DoS)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit (received ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
    };
  }

  // Check filename length
  if (file.name.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      error: `Filename exceeds ${MAX_FILENAME_LENGTH} characters`,
    };
  }

  // Sanitize and check extension
  const sanitizedName = sanitizeFileName(file.name);
  const ext = sanitizedName.slice(sanitizedName.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Only ${allowedExtensions.join(', ')} files are allowed (received: ${ext})`,
    };
  }

  // Validate MIME type
  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid MIME type: ${file.type}. Expected: ${allowedMimeTypes.join(' or ')}`,
    };
  }

  // Check magic bytes (most reliable file type check)
  if (checkMagicBytes) {
    const magicValid = await checkFileMagicBytes(file, ext);
    if (!magicValid) {
      return {
        valid: false,
        error: `File content does not match expected type (${ext}). Possible file type spoofing attempt.`,
      };
    }
  }

  // Compute file hash for integrity
  const fileHash = await computeFileHash(file);

  return {
    valid: true,
    sanitizedName,
    fileHash,
    mimeType: file.type,
  };
}

/**
 * Checks file magic bytes against known signatures.
 * This is the most reliable defense against file type spoofing.
 */
async function checkFileMagicBytes(
  file: File,
  extension: string
): Promise<boolean> {
  try {
    // Read first 8 bytes
    const header = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(header);

    // Check PDF magic bytes
    if (extension === '.pdf') {
      return PDF_MAGIC_BYTES.some((signature) =>
        signature.every((byte, i) => bytes[i] === byte)
      );
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Computes SHA-256 hash of file contents.
 */
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Filename Sanitization
// ---------------------------------------------------------------------------

/**
 * Sanitizes a filename to prevent path traversal and injection attacks.
 * CWE-22: Improper Limitation of a Pathname to a Restricted Directory
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') return 'unnamed';

  // Remove path traversal attempts
  let sanitized = fileName
    .replace(/[\\/]/g, '') // Remove path separators
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remove invalid chars
    .replace(/^\.+/, '') // Remove leading dots
    .trim();

  // Ensure reasonable length
  if (sanitized.length === 0) return 'unnamed';
  if (sanitized.length > MAX_FILENAME_LENGTH) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    sanitized = sanitized.slice(0, MAX_FILENAME_LENGTH - ext.length) + ext;
  }

  return sanitized;
}

// ---------------------------------------------------------------------------
// Email Validation
// ---------------------------------------------------------------------------

/**
 * Validates email address format with security considerations.
 * Prevents: ReDoS via length limits, injection chars, homograph attacks.
 *
 * OWASP: Validation Cheat Sheet — Email Address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmed = email.trim();

  // Length check (prevents ReDoS)
  if (trimmed.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email exceeds maximum length of ${MAX_EMAIL_LENGTH} characters` };
  }
  if (trimmed.length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  // Reject dangerous characters that could be used for header injection
  if (/[\r\n\x00]/.test(trimmed)) {
    return { valid: false, error: 'Email contains invalid characters' };
  }

  // RFC 5322 compliant regex (simplified, safe from ReDoS due to length limit)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }

  // Check for homograph attack indicators (mixed scripts)
  // Basic check for Cyrillic/punycode indicators
  if (/\p{Script=Cyrillic}/u.test(trimmed)) {
    return { valid: false, error: 'Email contains non-standard characters' };
  }

  return { valid: true, sanitized: trimmed.toLowerCase() };
}

// ---------------------------------------------------------------------------
// Password Validation
// ---------------------------------------------------------------------------

/**
 * Validates password strength.
 * OWASP: Authentication Cheat Sheet — Password Complexity
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  const checks = [
    { test: password.length >= 8, msg: 'at least 8 characters' },
    { test: password.length <= 128, msg: 'no more than 128 characters' },
    { test: /[a-z]/.test(password), msg: 'one lowercase letter' },
    { test: /[A-Z]/.test(password), msg: 'one uppercase letter' },
    { test: /\d/.test(password), msg: 'one digit' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), msg: 'one special character' },
    { test: !/(.+)\1{2,}/.test(password), msg: 'no repeated character sequences' },
  ];

  const failures = checks.filter((c) => !c.test).map((c) => c.msg);
  if (failures.length > 0) {
    return {
      valid: false,
      error: `Password must contain: ${failures.join(', ')}`,
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Portal Slug Validation
// ---------------------------------------------------------------------------

/**
 * Validates and sanitizes a portal URL slug.
 */
export function validatePortalSlug(slug: string): ValidationResult {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Slug is required' };
  }

  const trimmed = slug.trim().toLowerCase();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Slug cannot be empty' };
  }
  if (trimmed.length > MAX_PORTAL_SLUG_LENGTH) {
    return { valid: false, error: `Slug exceeds ${MAX_PORTAL_SLUG_LENGTH} characters` };
  }

  // Only allow alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-z0-9]+(?:[\-_][a-z0-9]+)*$/;
  if (!slugRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Slug must contain only lowercase letters, numbers, hyphens, and underscores',
    };
  }

  // Check for reserved keywords
  const reservedSlugs = ['admin', 'api', 'auth', 'login', 'logout', 'signup', 'register', 'static', 'public', 'internal'];
  if (reservedSlugs.includes(trimmed)) {
    return { valid: false, error: `'${trimmed}' is a reserved slug` };
  }

  return { valid: true, sanitized: trimmed };
}

// ---------------------------------------------------------------------------
// Client/Company Name Validation
// ---------------------------------------------------------------------------

/**
 * Validates a client or company name.
 */
export function validateCompanyName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Name exceeds ${MAX_INPUT_LENGTH} characters` };
  }

  // Remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1f\x7f]/g, '');

  // Check for obvious script injection
  if (/<script/i.test(sanitized) || /javascript:/i.test(sanitized)) {
    return { valid: false, error: 'Name contains invalid content' };
  }

  return { valid: true, sanitized: escapeHtml(sanitized) };
}

// ---------------------------------------------------------------------------
// Amount / Numeric Validation
// ---------------------------------------------------------------------------

/**
 * Validates a monetary amount.
 */
export function validateAmount(amount: string): ValidationResult {
  if (!amount || typeof amount !== 'string') {
    return { valid: false, error: 'Amount is required' };
  }

  const trimmed = amount.trim();

  // Only allow digits, decimal point, and minus sign
  const amountRegex = /^-?\d+(?:\.\d{1,2})?$/;
  if (!amountRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid amount format' };
  }

  const numValue = parseFloat(trimmed);
  if (isNaN(numValue)) {
    return { valid: false, error: 'Invalid amount' };
  }

  // Reasonable bounds check
  if (Math.abs(numValue) > 1e12) {
    return { valid: false, error: 'Amount exceeds maximum allowed value' };
  }

  return { valid: true, sanitized: trimmed };
}

// ---------------------------------------------------------------------------
// Bank Name Validation
// ---------------------------------------------------------------------------

/**
 * Validates a bank name input.
 */
export function validateBankName(name: string): ValidationResult {
  if (!name || typeof name !== 'string') {
    return { valid: true }; // Bank name is optional
  }

  const trimmed = name.trim();

  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Bank name exceeds ${MAX_INPUT_LENGTH} characters` };
  }

  // Allow letters, digits, spaces, and common bank name characters
  const sanitized = trimmed.replace(/[<>\x00-\x1f]/g, '');

  if (/<script/i.test(sanitized)) {
    return { valid: false, error: 'Bank name contains invalid content' };
  }

  return { valid: true, sanitized: escapeHtml(sanitized) };
}

// ---------------------------------------------------------------------------
// Search Query Validation
// ---------------------------------------------------------------------------

/**
 * Validates and sanitizes a search query.
 * Prevents: ReDoS, XSS via search reflection.
 */
export function validateSearchQuery(query: string): ValidationResult {
  if (!query || typeof query !== 'string') {
    return { valid: true, sanitized: '' };
  }

  const trimmed = query.trim();

  if (trimmed.length === 0) {
    return { valid: true, sanitized: '' };
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    return { valid: false, error: `Search query exceeds ${MAX_INPUT_LENGTH} characters` };
  }

  // Remove control characters
  const sanitized = trimmed.replace(/[\x00-\x1f\x7f]/g, '');

  // Check for dangerous patterns (but allow normal search syntax)
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: 'Search query contains invalid characters' };
    }
  }

  return { valid: true, sanitized: escapeHtml(sanitized) };
}

// ---------------------------------------------------------------------------
// Output Encoding
// ---------------------------------------------------------------------------

/**
 * Encodes text for safe HTML rendering.
 * This is in addition to React's built-in XSS protection.
 * CWE-79: Cross-site Scripting (XSS)
 */
export function encodeHtml(input: string): string {
  return escapeHtml(input);
}

/**
 * Encodes text for JavaScript context.
 * Use when inserting data into JavaScript strings.
 */
export function encodeJavaScript(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Encodes text for URL context.
 */
export function encodeUrl(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Encodes text for CSS context.
 */
export function encodeCss(input: string): string {
  return input.replace(/[<>'"&]/g, (c) => `\\${c.charCodeAt(0).toString(16)} `);
}

// ---------------------------------------------------------------------------
// URL Validation
// ---------------------------------------------------------------------------

/**
 * Validates an external URL for SSRF prevention.
 * Blocks: private IP ranges, localhost, file URLs.
 *
 * OWASP: A10:2021 — Server-Side Request Forgery (SSRF)
 * CWE-918: Server-Side Request Forgery (SSRF)
 */
export function validateExternalUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    // Only allow http and https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Block localhost
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1'
    ) {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }

    // Block private IP ranges
    if (isPrivateIP(hostname)) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }

    // Block common internal domains
    const blockedDomains = ['internal', 'intranet', 'local', 'corp', 'home'];
    if (blockedDomains.some((d) => hostname.endsWith(`.${d}`))) {
      return { valid: false, error: 'Internal domains are not allowed' };
    }

    return { valid: true, sanitized: trimmed };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Checks if an IP address is in a private range.
 */
function isPrivateIP(ip: string): boolean {
  // Check IPv4 private ranges
  const privateRanges = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^127\./, // 127.0.0.0/8
    /^169\.254\./, // Link-local
    /^0\./, // 0.0.0.0/8
  ];

  return privateRanges.some((range) => range.test(ip));
}

// ---------------------------------------------------------------------------
// Rate Limiting Simulation
// ---------------------------------------------------------------------------

/**
 * Client-side rate limiter with memory-backed tracking.
 * Server-side enforcement is required for production.
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Checks if a request is allowed for the given key.
   */
  isAllowed(key: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get or create request history
    let timestamps = this.requests.get(key) || [];

    // Remove old entries outside the window
    timestamps = timestamps.filter((t) => t > windowStart);

    const remaining = Math.max(0, this.maxRequests - timestamps.length);
    const allowed = remaining > 0;

    if (allowed) {
      timestamps.push(now);
    }

    this.requests.set(key, timestamps);

    const resetIn = timestamps.length > 0
      ? Math.min(...timestamps) + this.windowMs - now
      : this.windowMs;

    return { allowed, remaining, resetIn };
  }

  /**
   * Resets rate limit for a key.
   */
  reset(key: string): void {
    this.requests.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Export rate limiter instances for common use cases
// ---------------------------------------------------------------------------

export const uploadRateLimiter = new RateLimiter(60000, 5); // 5 uploads per minute
export const apiRateLimiter = new RateLimiter(60000, 60); // 60 API calls per minute
export const exportRateLimiter = new RateLimiter(60000, 10); // 10 exports per minute
