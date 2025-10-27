import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple validation helper
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, phone, role = 'customer' } = body

    // Simple validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, first name, and last name are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // For demo purposes, simulate user creation
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      role,
      avatar: '',
      emailVerified: false,
      twoFactorEnabled: false,
    }

    // Set authentication cookie
    const cookieStore = cookies()
    cookieStore.set('access_token', `token-${newUser.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Registration successful'
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid request data' },
      { status: 400 }
    )
  }
}