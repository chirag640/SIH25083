import jwt, { SignOptions } from 'jsonwebtoken'
import { SecureCrypto } from './crypto'

// Helper: map a DB user document (Mongoose) to the `User` interface used by auth utilities
export function mapDbUserToUser(userDoc: any): User {
  if (!userDoc) return null as any

  // Support both plain object and Mongoose Document
  const u = (userDoc.toJSON && typeof userDoc.toJSON === 'function') ? userDoc.toJSON() : userDoc

  return {
    id: u._id?.toString ? u._id.toString() : (u.id || ''),
    email: u.email || '',
    role: u.role || 'worker',
    name: u.name || u.fullName || '',
    isActive: !!u.isActive,
    isVerified: !!u.isVerified,
    createdAt: (u.createdAt instanceof Date) ? u.createdAt.toISOString() : (u.createdAt || ''),
    lastLogin: (u.lastLogin instanceof Date) ? u.lastLogin.toISOString() : (u.lastLogin || undefined),
    permissions: u.permissions || [],
    profileData: u.profileData || {}
  }
}

// Environment variables with fallbacks for development
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

export type UserRole = 'worker' | 'doctor' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLogin?: string
  permissions: string[]
  profileData?: any
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
  profileData?: any
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  permissions: string[]
  iat?: number
  exp?: number
}

/**
 * Role-based permissions system
 */
export class PermissionManager {
  private static readonly ROLE_PERMISSIONS: Record<UserRole, string[]> = {
    worker: [
      'read:own_profile',
      'update:own_profile',
      'read:own_health_records',
      'upload:own_documents',
      'read:own_documents',
      'delete:own_documents',
      'read:own_prescriptions',
      'read:own_appointments'
    ],
    doctor: [
      'read:patient_profiles',
      'update:patient_health_records',
      'create:prescriptions',
      'read:prescriptions',
      'update:prescriptions',
      'create:appointments',
      'read:appointments',
      'update:appointments',
      'read:patient_documents',
      'verify:documents',
      'create:medical_visits',
      'read:medical_visits',
      'update:medical_visits'
    ],
    admin: [
      'read:all_users',
      'create:users',
      'update:users',
      'delete:users',
      'read:all_health_records',
      'update:all_health_records',
      'delete:health_records',
      'read:all_documents',
      'delete:documents',
      'read:audit_logs',
      'read:system_status',
      'update:system_settings',
      'manage:doctors',
      'manage:workers',
      'export:system_data',
      'import:system_data'
    ]
  }

  /**
   * Get permissions for a specific role
   */
  static getPermissions(role: UserRole): string[] {
    return this.ROLE_PERMISSIONS[role] || []
  }

  /**
   * Check if a role has a specific permission
   */
  static hasPermission(role: UserRole, permission: string): boolean {
    return this.ROLE_PERMISSIONS[role]?.includes(permission) || false
  }

  /**
   * Check if a user has a specific permission
   */
  static userHasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || this.hasPermission(user.role, permission)
  }

  /**
   * Get all permissions for a user (role + custom permissions)
   */
  static getUserPermissions(user: User): string[] {
    const rolePermissions = this.getPermissions(user.role)
    const customPermissions = user.permissions || []
    return [...new Set([...rolePermissions, ...customPermissions])]
  }
}

/**
 * JWT Token Management
 */
export class TokenManager {
  /**
   * Generate access and refresh tokens
   */
  static generateTokens(user: User): AuthTokens {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: PermissionManager.getUserPermissions(user)
    }

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'migrant-worker-system',
      audience: 'healthcare-app'
    } as SignOptions)

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      JWT_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'migrant-worker-system',
        audience: 'healthcare-app'
      } as SignOptions
    )

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpiry(JWT_EXPIRES_IN)
    }
  }

  /**
   * Verify and decode JWT token
   */
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'migrant-worker-system',
        audience: 'healthcare-app'
      }) as JWTPayload

      return decoded
    } catch (error) {
      console.error('Token verification failed:', error)
      return null
    }
  }

  /**
   * Refresh access token using refresh token
   */
  // Accepts a DB-style getUserById that returns any Mongoose document; we will map it to `User`
  static async refreshAccessToken(refreshToken: string, getUserById: (id: string) => Promise<any | null>): Promise<AuthTokens | null> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as any

      if (decoded.type !== 'refresh') {
        return null
      }

      // `userDoc` may be a Mongoose document with Date fields. Map it to the `User` shape.
      const userDoc = await getUserById(decoded.userId)
      if (!userDoc) return null

      const user: User = mapDbUserToUser(userDoc)

      if (!user || !user.isActive) {
        return null
      }

      return this.generateTokens(user)
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any
      if (!decoded || !decoded.exp) return true
      
      return Date.now() >= decoded.exp * 1000
    } catch {
      return true
    }
  }

  private static getTokenExpiry(expiresIn: string): number {
    const now = Date.now()
    const match = expiresIn.match(/^(\d+)([hmsd])$/)
    
    if (!match) return now + 24 * 60 * 60 * 1000 // Default 24h
    
    const [, value, unit] = match
    const multipliers = { h: 3600000, m: 60000, s: 1000, d: 86400000 }
    
    return now + parseInt(value) * (multipliers[unit as keyof typeof multipliers] || 3600000)
  }
}

/**
 * Authentication Service
 */
export class AuthService {
  private static readonly AUTH_STORAGE_KEY = 'healthcare_auth'
  private static readonly USER_STORAGE_KEY = 'healthcare_user'

  /**
   * Hash password with salt
   */
  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    return await SecureCrypto.hashPassword(password)
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    return await SecureCrypto.verifyPassword(password, hash, salt)
  }

  /**
   * Store authentication data securely
   */
  static storeAuthData(tokens: AuthTokens, user: User): void {
    if (typeof window === 'undefined') return

    try {
      // Store tokens securely
      sessionStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(tokens))
      
      // Store user data (non-sensitive parts)
      const userData = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isActive: user.isActive,
        permissions: PermissionManager.getUserPermissions(user),
        createdAt: user.createdAt // already a string via mapDbUserToUser
      }
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userData))
    } catch (error) {
      console.error('Failed to store auth data:', error)
    }
  }

  /**
   * Get stored authentication data
   */
  static getAuthData(): { tokens: AuthTokens | null; user: Partial<User> | null } {
    if (typeof window === 'undefined') {
      return { tokens: null, user: null }
    }

    try {
      const tokensData = sessionStorage.getItem(this.AUTH_STORAGE_KEY)
      const userData = localStorage.getItem(this.USER_STORAGE_KEY)

      return {
        tokens: tokensData ? JSON.parse(tokensData) : null,
        user: userData ? JSON.parse(userData) : null
      }
    } catch (error) {
      console.error('Failed to retrieve auth data:', error)
      return { tokens: null, user: null }
    }
  }

  /**
   * Clear authentication data
   */
  static clearAuthData(): void {
    if (typeof window === 'undefined') return

    try {
      sessionStorage.removeItem(this.AUTH_STORAGE_KEY)
      localStorage.removeItem(this.USER_STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear auth data:', error)
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const { tokens, user } = this.getAuthData()
    
    if (!tokens || !user) return false
    
    return !TokenManager.isTokenExpired(tokens.accessToken)
  }

  /**
   * Get current user
   */
  static getCurrentUser(): Partial<User> | null {
    const { user } = this.getAuthData()
    return user
  }

  /**
   * Get current user's role
   */
  static getCurrentUserRole(): UserRole | null {
    const user = this.getCurrentUser()
    return user?.role || null
  }

  /**
   * Check if current user has permission
   */
  static hasPermission(permission: string): boolean {
    const user = this.getCurrentUser()
    if (!user) return false

    return user.permissions?.includes(permission) || false
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    const { tokens } = this.getAuthData()
    return tokens?.accessToken || null
  }
}

/**
 * Route protection middleware
 */
export class RouteGuard {
  /**
   * Check if user can access a route based on required permissions
   */
  static canAccess(requiredPermissions: string[], userRole?: UserRole): boolean {
    if (!userRole) {
      const user = AuthService.getCurrentUser()
      userRole = user?.role
    }

    if (!userRole) return false

    return requiredPermissions.some(permission => 
      PermissionManager.hasPermission(userRole!, permission) ||
      AuthService.hasPermission(permission)
    )
  }

  /**
   * Require authentication
   */
  static requireAuth(): boolean {
    return AuthService.isAuthenticated()
  }

  /**
   * Require specific role
   */
  static requireRole(role: UserRole): boolean {
    const currentRole = AuthService.getCurrentUserRole()
    return currentRole === role
  }

  /**
   * Require any of the specified roles
   */
  static requireAnyRole(roles: UserRole[]): boolean {
    const currentRole = AuthService.getCurrentUserRole()
    return currentRole ? roles.includes(currentRole) : false
  }
}

/**
 * Route permissions configuration
 */
export const ROUTE_PERMISSIONS = {
  // Worker routes
  '/workers': ['read:own_profile'],
  '/workers/dashboard': ['read:own_profile'],
  '/workers/register': [], // Public
  '/workers/documents': ['read:own_documents'],
  '/workers/health-card': ['read:own_profile'],

  // Doctor routes
  '/doctors': ['read:patient_profiles'],
  '/doctors/patient': ['read:patient_profiles'],
  '/doctors/qr-scanner': ['read:patient_profiles'],

  // Admin routes
  '/admin': ['read:all_users', 'read:system_status'],
  '/admin/hospital': ['read:all_users', 'manage:doctors'],
  '/security/audit-logs': ['read:audit_logs'],
  '/storage/management': ['read:all_documents'],
  '/system-status': ['read:system_status'],

  // Government routes
  '/govt': ['read:all_users', 'read:system_status'],

  // Help routes
  '/help': [], // Public
} as const
