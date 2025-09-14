import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel, WorkerProfileModel } from '@/lib/database'
import { AuthService, TokenManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const registrationData = await request.json()

  // Validate required fields (email is optional for workers)
  const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'phoneNumber', 'password']
    for (const field of requiredFields) {
      if (!registrationData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate emergency contact fields (they are required by schema)
    const emergencyFields = [
      { key: 'emergencyContactName', label: 'Emergency contact name' },
      { key: 'emergencyContactRelationship', label: 'Emergency contact relationship' },
      { key: 'emergencyContactPhone', label: 'Emergency contact phone' }
    ]

    for (const ef of emergencyFields) {
      if (!registrationData[ef.key]) {
        return NextResponse.json({ error: `${ef.label} is required` }, { status: 400 })
      }
    }

  // Email is not required for worker registration; we will not validate or dedupe it here.

    // Validate password strength
    if (registrationData.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

  // Skip checking user-by-email for worker registrations to avoid conflicts.

    // Check if phone number already exists
    const existingWorker = await WorkerProfileModel.findOne({ 
      phoneNumber: registrationData.phoneNumber 
    })
    
    if (existingWorker) {
      return NextResponse.json(
        { error: 'Worker with this phone number already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const { hash: passwordHash, salt: passwordSalt } = await AuthService.hashPassword(registrationData.password)

    // Generate secure user ID and worker ID
    const userId = SecureCrypto.generateSecureId('USER')
    const workerId = SecureCrypto.generateSecureId('MW')

    // Create user account
    // Always generate a placeholder unique email for the User model (schema requires email).
    const generatedEmail = `${userId.toLowerCase()}+worker@no-reply.local`

    const user = new UserModel({
      email: generatedEmail,
      passwordHash,
      passwordSalt,
      name: registrationData.fullName,
      role: 'worker',
      permissions: ['read:own_profile', 'update:own_profile'],
      profileData: {},
      isActive: true,
      isVerified: false
    })

    await user.save()

    // Create worker profile
    const workerProfile = new WorkerProfileModel({
      workerId,
      userId: user.id,
      fullName: registrationData.fullName,
      dateOfBirth: new Date(registrationData.dateOfBirth),
      gender: registrationData.gender,
      phoneNumber: registrationData.phoneNumber,
      emergencyContact: {
        name: registrationData.emergencyContactName || '',
        relationship: registrationData.emergencyContactRelationship || '',
        phoneNumber: registrationData.emergencyContactPhone || ''
      },
      currentAddress: {
        street: registrationData.currentAddress || '',
        city: registrationData.currentCity || '',
        state: registrationData.nativeState || '',
        pincode: registrationData.pincode || '',
        country: 'India'
      },
      permanentAddress: {
        street: registrationData.permanentAddress || registrationData.currentAddress || '',
        city: registrationData.permanentCity || registrationData.currentCity || '',
        state: registrationData.nativeState || '',
        pincode: registrationData.permanentPincode || registrationData.pincode || '',
        country: 'India'
      },
      bloodGroup: registrationData.bloodGroup || '',
      allergies: registrationData.allergies ? registrationData.allergies.split(',').map((a: string) => a.trim()) : [],
      medicalConditions: registrationData.currentMedication ? [registrationData.currentMedication] : [],
      employmentDetails: {
        employer: registrationData.employer || '',
        jobTitle: registrationData.jobTitle || '',
        workLocation: registrationData.workLocation || '',
        contractStartDate: registrationData.contractStartDate ? new Date(registrationData.contractStartDate) : new Date(),
        contractEndDate: registrationData.contractEndDate ? new Date(registrationData.contractEndDate) : undefined
      },
      documents: {
        idProof: {
          type: '',
          number: '',
          verified: false,
          uploadedAt: new Date()
        },
        medicalClearance: {
          verified: false,
          issuedBy: '',
          validUntil: new Date(),
          uploadedAt: new Date()
        }
      },
      qrCodeData: JSON.stringify({
        id: workerId,
        name: registrationData.fullName,
        phoneNumber: registrationData.phoneNumber,
        bloodGroup: registrationData.bloodGroup || 'Unknown'
      }),
      isActive: true
    })

    await workerProfile.save()

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
      message: 'Worker registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString()
      },
      worker: {
        workerId: workerProfile.workerId,
        fullName: workerProfile.fullName,
        phoneNumber: workerProfile.phoneNumber,
        bloodGroup: workerProfile.bloodGroup
      },
      tokens
    }, { status: 201 })

  } catch (error) {
    console.error('Worker registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
