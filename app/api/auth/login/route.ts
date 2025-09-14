import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel } from '@/lib/database'
import { AuthService, TokenManager, LoginCredentials, mapDbUserToUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const { email, password }: LoginCredentials = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await UserModel.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate tokens - map DB document to library `User` shape (ensures createdAt/lastLogin are strings)
    const userObj = user.toJSON()
    const mappedUser = mapDbUserToUser(userObj)
    const tokens = TokenManager.generateTokens(mappedUser)

    return NextResponse.json({
      success: true,
      user: {
        id: mappedUser.id,
        email: mappedUser.email,
        name: mappedUser.name,
        role: mappedUser.role,
        isActive: mappedUser.isActive,
        isVerified: mappedUser.isVerified,
        createdAt: mappedUser.createdAt,
        lastLogin: mappedUser.lastLogin
      },
      tokens
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
