import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { validateSchema, UserLoginSchema } from '@/lib/validation'
import { logger, loggers } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Demo credentials check
    if (email === 'demo@restaurantbook.com' && password === 'password123') {
      const demoUser = {
        id: 'demo-user-1',
        email: 'demo@restaurantbook.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'CUSTOMER',
        avatar: null,
        emailVerified: true,
        twoFactorEnabled: false,
        loyaltyPoints: 2500,
      }

      // Set demo cookies
      const cookieStore = cookies()
      cookieStore.set('access_token', 'demo-token-12345', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 15 * 60, // 15 minutes
      })

      return NextResponse.json({
        success: true,
        message: 'Demo login successful',
        user: demoUser,
      }, { status: 200 })
    }

    // For other credentials, check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password (in a real app)
    // For demo, we'll accept any password for existing users
    
    const user = {
      id: existingUser.id,
      email: existingUser.email,
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      role: existingUser.role,
      avatar: existingUser.avatar,
      emailVerified: existingUser.emailVerified,
      twoFactorEnabled: existingUser.twoFactorEnabled,
      loyaltyPoints: 0, // Will be fetched from user profile
    }

    // Set cookies for authenticated user
    const cookieStore = cookies()
    cookieStore.set('access_token', 'token-' + existingUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user,
    }, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
