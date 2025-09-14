import { NextRequest, NextResponse } from 'next/server'
import { DatabaseManager, UserModel } from '@/lib/database'
import { TokenManager } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await DatabaseManager.connect()

    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      )
    }

    // Function to get user by ID
    const getUserById = async (id: string) => {
      const user = await UserModel.findById(id)
      return user ? user.toJSON() : null
    }

    // Refresh tokens
    const newTokens = await TokenManager.refreshAccessToken(refreshToken, getUserById)

    if (!newTokens) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens: newTokens
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}
