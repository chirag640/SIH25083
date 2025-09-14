/**
 * Secure cryptographic utilities using Web Crypto API
 * Replaces the weak XOR encryption with industry-standard encryption
 */

// Determine available crypto implementation: prefer globalThis.crypto (browser or Node 16+),
// otherwise try to import Node's built-in crypto.webcrypto.
let nodeWebCrypto: typeof globalThis.crypto | null = null

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeCrypto = require('crypto')
  if (nodeCrypto && nodeCrypto.webcrypto) {
    nodeWebCrypto = nodeCrypto.webcrypto as unknown as typeof globalThis.crypto
  }
} catch (e) {
  // ignore; will fallback to globalThis.crypto if present
}

const hasWebCrypto = typeof globalThis !== 'undefined' && typeof (globalThis as any).crypto !== 'undefined'

// Simple flag used for browser-only features (like localStorage)
const isBrowser = typeof window !== 'undefined' && typeof window.crypto !== 'undefined'

const getCrypto = (): typeof globalThis.crypto => {
  if (hasWebCrypto) return (globalThis as any).crypto
  if (nodeWebCrypto) return nodeWebCrypto
  throw new Error('Web Crypto API not available in this environment')
}

export class SecureCrypto {
  private static readonly ALGORITHM = 'AES-GCM'
  private static readonly KEY_LENGTH = 256
  private static readonly IV_LENGTH = 12
  private static readonly TAG_LENGTH = 16

  /**
   * Generate a cryptographically secure key for encryption
   */
  static async generateKey(): Promise<CryptoKey> {
  const crypto = getCrypto()

  return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Export a key to a base64 string for storage
   */
  static async exportKey(key: CryptoKey): Promise<string> {
  const crypto = getCrypto()
  const exported = await crypto.subtle.exportKey('raw', key)
  return this.arrayBufferToBase64(exported)
  }

  /**
   * Import a key from a base64 string
   */
  static async importKey(keyString: string): Promise<CryptoKey> {
  const crypto = getCrypto()
  const keyBuffer = this.base64ToArrayBuffer(keyString)
  return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const crypto = getCrypto()
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return this.arrayBufferToBase64(combined.buffer)
  }

  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const crypto = getCrypto()
    const combined = this.base64ToArrayBuffer(encryptedData)

    // Extract IV and encrypted data
    const iv = combined.slice(0, this.IV_LENGTH)
    const encrypted = combined.slice(this.IV_LENGTH)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  /**
   * Hash data using SHA-256
   */
  static async hash(data: string): Promise<string> {
  const crypto = getCrypto()
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return this.arrayBufferToBase64(hashBuffer)
  }

  /**
   * Generate a cryptographically secure random salt
   */
  static generateSalt(length: number = 32): string {
    try {
      const crypto = getCrypto()
      const salt = crypto.getRandomValues(new Uint8Array(length))
      return this.arrayBufferToBase64(salt.buffer)
    } catch (e) {
      // Fallback: non-cryptographic random (should be rare on server)
      const arr = new Uint8Array(length)
      for (let i = 0; i < length; i++) arr[i] = Math.floor(Math.random() * 256)
      return this.arrayBufferToBase64(arr.buffer)
    }
  }

  /**
   * Hash password with salt using PBKDF2
   */
  static async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const crypto = getCrypto()
    const passwordSalt = salt || this.generateSalt()
    const encoder = new TextEncoder()

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )

    // Derive key using PBKDF2
    const derived = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: this.base64ToArrayBuffer(passwordSalt),
        iterations: 100000, // 100k iterations for security
        hash: 'SHA-256',
      },
      keyMaterial,
      256 // 256 bits = 32 bytes
    )

    return {
      hash: this.arrayBufferToBase64(derived),
      salt: passwordSalt
    }
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const { hash: computedHash } = await this.hashPassword(password, salt)
      return computedHash === hash
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  /**
   * Generate a secure random ID
   */
  static generateSecureId(prefix: string = 'SEC'): string {
    try {
      const crypto = getCrypto()
      const timestamp = Date.now().toString()
      const randomBytes = crypto.getRandomValues(new Uint8Array(8))
      const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
      return `${prefix}_${timestamp}_${randomString}`
    } catch (e) {
      // Fallback for environments without crypto
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * Utility: Convert ArrayBuffer to Base64
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    // Use Buffer in Node, btoa in browser
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(buffer).toString('base64')
    }

    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Utility: Convert Base64 to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    // Use Buffer in Node, atob in browser
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(base64, 'base64').buffer
    }

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

/**
 * Encryption manager that handles key management
 */
export class EncryptionManager {
  private static masterKey: CryptoKey | null = null
  private static readonly MASTER_KEY_STORAGE = 'healthsystem_master_key'

  /**
   * Initialize or retrieve the master encryption key
   */
  static async initializeKey(): Promise<void> {
    if (!isBrowser) return

    try {
      const storedKey = localStorage.getItem(this.MASTER_KEY_STORAGE)
      
      if (storedKey) {
        this.masterKey = await SecureCrypto.importKey(storedKey)
      } else {
        // Generate new master key
        this.masterKey = await SecureCrypto.generateKey()
        const exportedKey = await SecureCrypto.exportKey(this.masterKey)
        localStorage.setItem(this.MASTER_KEY_STORAGE, exportedKey)
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error)
      // Fallback: generate temporary key (won't persist across sessions)
      this.masterKey = await SecureCrypto.generateKey()
    }
  }

  /**
   * Get the master key, initializing if needed
   */
  static async getMasterKey(): Promise<CryptoKey> {
    if (!this.masterKey) {
      await this.initializeKey()
    }
    
    if (!this.masterKey) {
      throw new Error('Failed to initialize or retrieve master key')
    }
    
    return this.masterKey
  }

  /**
   * Encrypt sensitive data using the master key
   */
  static async encryptData(data: string): Promise<string> {
    try {
      const key = await this.getMasterKey()
      return await SecureCrypto.encrypt(data, key)
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data using the master key
   */
  static async decryptData(encryptedData: string): Promise<string> {
    try {
      const key = await this.getMasterKey()
      return await SecureCrypto.decrypt(encryptedData, key)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Reset encryption key (use with caution - will invalidate all encrypted data)
   */
  static async resetKey(): Promise<void> {
    if (!isBrowser) return

    this.masterKey = await SecureCrypto.generateKey()
    const exportedKey = await SecureCrypto.exportKey(this.masterKey)
    localStorage.setItem(this.MASTER_KEY_STORAGE, exportedKey)
  }
}

// Initialize encryption on module load (browser only)
if (isBrowser) {
  EncryptionManager.initializeKey().catch(console.error)
}
