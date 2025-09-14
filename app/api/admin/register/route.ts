import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel } from '@/lib/database'
import { AuthService, TokenManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const registrationData = await request.json()

    // Validate required fields for admin registration
    const requiredFields = ['fullName', 'email', 'password', 'adminCode', 'department']
    for (const field of requiredFields) {
      if (!registrationData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate admin code (should be a secure code provided by system)
    const validAdminCodes = [
      'ADMIN_HEALTH_2024',
      'MIGRANT_ADMIN_SIH',
      'HEALTHCARE_ADMIN'
    ]
    
    if (!validAdminCodes.includes(registrationData.adminCode)) {
      return NextResponse.json(
        { error: 'Invalid admin registration code' },
        { status: 403 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registrationData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (registrationData.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ 
      email: registrationData.email.toLowerCase() 
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const { hash: passwordHash, salt: passwordSalt } = await AuthService.hashPassword(registrationData.password)

    // Generate secure user ID
    const userId = SecureCrypto.generateSecureId('ADM')

    // Create admin user account
    const user = new UserModel({
      email: registrationData.email.toLowerCase(),
      passwordHash,
      passwordSalt,
      name: registrationData.fullName,
      role: 'admin',
      permissions: [
        'read:all_users',
        'create:users',
        'update:users',
        'delete:users',
        'read:patient_profiles',
        'update:patient_profiles',
        'read:medical_visits',
        'update:medical_visits',
        'read:documents',
        'verify:documents',
        'create:audit_logs',
        'read:audit_logs',
        'manage:system_settings',
        'verify:doctors',
        'manage:permissions'
      ],
      profileData: {
        department: registrationData.department,
        employeeId: registrationData.employeeId || '',
        phoneNumber: registrationData.phoneNumber || '',
        accessLevel: 'system_admin',
        lastLoginIP: '',
        loginAttempts: 0,
        accountLocked: false
      },
      isActive: true,
      isVerified: true // Admins are pre-verified
    })

    await user.save()

    // Generate JWT tokens
    const tokens = TokenManager.generateTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin?.toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Admin registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString()
      },
      admin: {
        department: registrationData.department,
        accessLevel: 'system_admin'
      },
      tokens
    }, { status: 201 })

  } catch (error) {
    console.error('Admin registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
