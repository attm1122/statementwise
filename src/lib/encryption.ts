/**
 * AES-256-GCM Encryption/Decryption Module
 *
 * Uses the Web Crypto API for browser-native encryption.
 * - AES-256-GCM for authenticated encryption
 * - PBKDF2 for key derivation from passwords/session tokens
 * - Random IV generation for each encryption operation
 * - No external crypto dependencies
 *
 * OWASP: A02:2021 — Cryptographic Failures
 * CWE-327: Use of a Broken or Risky Cryptographic Algorithm
 * CWE-916: Use of Password Hash With Insufficient Computational Effort
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 128; // 128-bit authentication tag
const SALT_LENGTH = 16; // 128-bit salt
const ITERATIONS = 100000; // PBKDF2 iterations (OWASP recommended minimum)

/**
 * Derives an AES-256-GCM key from a password using PBKDF2.
 * OWASP recommends at least 100,000 iterations for PBKDF2.
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Import password as a key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive AES-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generates a cryptographically secure random salt.
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
}

/**
 * Generates a cryptographically secure random IV.
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH));
}

/**
 * Encodes a string to Uint8Array.
 */
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Decodes a Uint8Array to string.
 */
function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Converts Uint8Array to base64 string.
 */
function bytesToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binString);
}

/**
 * Converts base64 string to Uint8Array.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binString = atob(base64);
  return Uint8Array.from(binString, (c) => c.charCodeAt(0));
}

/**
 * Combines salt + IV + ciphertext into a single base64 string.
 * Format: base64(salt || iv || ciphertext)
 */
function packCipherData(
  salt: Uint8Array,
  iv: Uint8Array,
  ciphertext: ArrayBuffer
): string {
  const combined = new Uint8Array(
    salt.length + iv.length + ciphertext.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
  return bytesToBase64(combined);
}

/**
 * Unpacks combined cipher data into salt, IV, and ciphertext.
 */
function unpackCipherData(
  packed: string
): { salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  const combined = base64ToBytes(packed);
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);
  return { salt, iv, ciphertext };
}

/**
 * Encrypts data using AES-256-GCM with PBKDF2 key derivation.
 *
 * @param plaintext - Data to encrypt
 * @param password - Password for key derivation
 * @returns Base64-encoded encrypted payload (salt + iv + ciphertext)
 */
export async function encryptData(
  plaintext: string,
  password: string
): Promise<string> {
  try {
    const salt = generateSalt();
    const iv = generateIV();
    const key = await deriveKey(password, salt);

    const ciphertext = await crypto.subtle.encrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      key,
      stringToBytes(plaintext)
    );

    return packCipherData(salt, iv, ciphertext);
  } catch (error) {
    throw new EncryptionError(
      'Failed to encrypt data: ' +
        (error instanceof Error ? error.message : 'unknown error')
    );
  }
}

/**
 * Decrypts AES-256-GCM encrypted data.
 *
 * @param encryptedPayload - Base64-encoded payload from encryptData
 * @param password - Password used for key derivation
 * @returns Decrypted plaintext string
 */
export async function decryptData(
  encryptedPayload: string,
  password: string
): Promise<string> {
  try {
    const { salt, iv, ciphertext } = unpackCipherData(encryptedPayload);
    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv, tagLength: TAG_LENGTH },
      key,
      ciphertext
    );

    return bytesToString(new Uint8Array(decrypted));
  } catch (error) {
    throw new DecryptionError(
      'Failed to decrypt data — invalid password or corrupted data'
    );
  }
}

/**
 * Generates a secure random key for session-based encryption.
 * This key is derived from a random value and stored in memory only.
 */
export async function generateSessionKey(): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64(randomBytes);
}

/**
 * Computes SHA-256 hash of data (for integrity verification).
 * OWASP A08:2021 — Software and Data Integrity Failures
 */
export async function computeHash(data: string | ArrayBuffer): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer =
    typeof data === 'string' ? encoder.encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Computes SHA-256 hash of a file for integrity verification.
 */
export async function computeFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  return computeHash(arrayBuffer);
}

/**
 * Custom error class for encryption failures.
 */
export class EncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Custom error class for decryption failures.
 */
export class DecryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecryptionError';
  }
}

/**
 * Secure key rotation: Re-encrypts data with a new password.
 */
export async function rotateKey(
  encryptedPayload: string,
  oldPassword: string,
  newPassword: string
): Promise<string> {
  const plaintext = await decryptData(encryptedPayload, oldPassword);
  return encryptData(plaintext, newPassword);
}

/**
 * Generates a cryptographically secure random token.
 * Used for CSRF tokens and session identifiers.
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase64(bytes);
}

/**
 * Timing-safe comparison of two strings to prevent timing attacks.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do comparison to avoid leaking length via timing
    const dummy = b;
    let result = 0;
    for (let i = 0; i < Math.max(a.length, dummy.length); i++) {
      result |= (a.charCodeAt(i) || 0) ^ (dummy.charCodeAt(i) || 0);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
