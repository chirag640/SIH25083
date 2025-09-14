import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, WorkerProfileModel, UserModel } from '@/lib/database'
import { TokenManager, PermissionManager } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

// GET worker profile
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    // Extract worker ID from URL
    const url = new URL(request.url)
    const workerId = url.pathname.split('/').pop()

    if (!workerId) {
      return NextResponse.json(
        { error: 'Worker ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = TokenManager.verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Find worker profile
    const workerProfile = await WorkerProfileModel.findOne({ 
      workerId,
      isActive: true 
    })

    if (!workerProfile) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwnProfile = workerProfile.userId === payload.userId
    const canReadPatientProfiles = payload.permissions.includes('read:patient_profiles')
    const canReadAllUsers = payload.permissions.includes('read:all_users')

    if (!isOwnProfile && !canReadPatientProfiles && !canReadAllUsers) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Return profile data
    const profileData = workerProfile.toJSON()
    
    // Generate QR code data
    const qrData = {
      id: profileData.workerId,
      name: profileData.fullName,
      bloodGroup: profileData.bloodGroup,
      allergies: profileData.allergies,
      emergencyContact: profileData.emergencyContact
    }

    return NextResponse.json({
      success: true,
      worker: profileData,
      qrCodeData: JSON.stringify(qrData)
    })

  } catch (error) {
    console.error('Worker profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch worker profile' },
      { status: 500 }
    )
  }
}

// POST create worker profile
export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = TokenManager.verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const profileData = await request.json()

    // Validate required fields
    const requiredFields = ['fullName', 'dateOfBirth', 'gender', 'phoneNumber']
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Check if user already has a worker profile
    const existingProfile = await WorkerProfileModel.findOne({ 
      userId: payload.userId 
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Worker profile already exists for this user' },
        { status: 409 }
      )
    }

    // Generate unique worker ID
    const workerId = SecureCrypto.generateSecureId('MW')

    // Create worker profile
    const workerProfile = new WorkerProfileModel({
      workerId,
      userId: payload.userId,
      ...profileData,
      qrCodeData: JSON.stringify({
        id: workerId,
        name: profileData.fullName
      })
    })

    await workerProfile.save()

    return NextResponse.json({
      success: true,
      worker: workerProfile.toJSON()
    }, { status: 201 })

  } catch (error) {
    console.error('Worker profile creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create worker profile' },
      { status: 500 }
    )
  }
}

// PUT update worker profile
export async function PUT(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    // Extract worker ID from URL
    const url = new URL(request.url)
    const workerId = url.pathname.split('/').pop()

    if (!workerId) {
      return NextResponse.json(
        { error: 'Worker ID is required' },
        { status: 400 }
      )
    }

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = TokenManager.verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const updateData = await request.json()

    // Find worker profile
    const workerProfile = await WorkerProfileModel.findOne({ 
      workerId,
      isActive: true 
    })

    if (!workerProfile) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const isOwnProfile = workerProfile.userId === payload.userId
    const canUpdateProfiles = payload.permissions.includes('update:patient_health_records')

    if (!isOwnProfile && !canUpdateProfiles) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update profile
    Object.assign(workerProfile, updateData)
    await workerProfile.save()

    return NextResponse.json({
      success: true,
      worker: workerProfile.toJSON()
    })

  } catch (error) {
    console.error('Worker profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update worker profile' },
      { status: 500 }
    )
  }
}
