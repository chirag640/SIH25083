import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel } from '@/lib/database'
import { AuthService, TokenManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const registrationData = await request.json()

    // Validate required fields for doctor registration
    const requiredFields = ['fullName', 'email', 'password', 'phoneNumber', 'medicalLicense', 'specialization']
    for (const field of requiredFields) {
      if (!registrationData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
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

    // Check if medical license already exists (assuming it should be unique)
    const existingDoctor = await UserModel.findOne({ 
      'profileData.medicalLicense': registrationData.medicalLicense,
      role: 'doctor'
    })
    
    if (existingDoctor) {
      return NextResponse.json(
        { error: 'Doctor with this medical license already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const { hash: passwordHash, salt: passwordSalt } = await AuthService.hashPassword(registrationData.password)

    // Generate secure user ID
    const userId = SecureCrypto.generateSecureId('DOC')

    // Create doctor user account
    const user = new UserModel({
      email: registrationData.email.toLowerCase(),
      passwordHash,
      passwordSalt,
      name: registrationData.fullName,
      role: 'doctor',
      permissions: [
        'read:patient_profiles',
        'create:medical_visits',
        'update:medical_visits',
        'read:medical_visits',
        'create:prescriptions',
        'update:prescriptions',
        'read:documents',
        'verify:documents'
      ],
      profileData: {
        phoneNumber: registrationData.phoneNumber,
        medicalLicense: registrationData.medicalLicense,
        specialization: registrationData.specialization,
        hospitalAffiliation: registrationData.hospitalAffiliation || '',
        department: registrationData.department || '',
        experience: registrationData.experience || '',
        qualifications: registrationData.qualifications || [],
        consultationHours: registrationData.consultationHours || {},
        isAvailable: true,
        verificationStatus: 'pending' // Doctors need to be verified by admin
      },
      isActive: true,
      isVerified: false // Email verification required
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
      message: 'Doctor registered successfully. Account pending verification.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString()
      },
      doctor: {
        medicalLicense: registrationData.medicalLicense,
        specialization: registrationData.specialization,
        verificationStatus: 'pending'
      },
      tokens
    }, { status: 201 })

  } catch (error) {
    console.error('Doctor registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
