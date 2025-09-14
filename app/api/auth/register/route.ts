import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel } from '@/lib/database'
import { AuthService, TokenManager, RegisterData, mapDbUserToUser } from '@/lib/auth'
import { SecureCrypto } from '@/lib/crypto'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const { email, password, name, role, profileData }: RegisterData = await request.json()

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const { hash: passwordHash, salt: passwordSalt } = await AuthService.hashPassword(password)

    // Generate secure user ID
    const userId = SecureCrypto.generateSecureId('USER')

    // Create user
    const user = new UserModel({
      email: email.toLowerCase(),
      passwordHash,
      passwordSalt,
      name,
      role,
      permissions: [],
      profileData: profileData || {},
      isActive: true,
      isVerified: false // Email verification required
    })

    await user.save()

  // Generate tokens - map DB document to library `User` shape
  const userObj = user.toJSON()
  const mappedUser = mapDbUserToUser(userObj)
  const tokens = TokenManager.generateTokens(mappedUser)

  // Store auth data (this would typically be done on the client)
  AuthService.storeAuthData(tokens, mappedUser)

    return NextResponse.json({
      success: true,
        user: {
        id: mappedUser.id,
        email: mappedUser.email,
        name: mappedUser.name,
        role: mappedUser.role,
        isActive: mappedUser.isActive,
        isVerified: mappedUser.isVerified,
        createdAt: mappedUser.createdAt
      },
      tokens
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
