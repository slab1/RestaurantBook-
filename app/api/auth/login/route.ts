import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple validation helper
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Demo user for testing
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@restaurantbook.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'customer',
  avatar: '',
  emailVerified: true,
  twoFactorEnabled: false,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Simple validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Demo authentication
    if (email === 'demo@restaurantbook.com' && password === 'password123') {
      // Set authentication cookie
      const cookieStore = cookies()
      cookieStore.set('access_token', 'demo-token-123', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({
        success: true,
        user: DEMO_USER,
        message: 'Login successful'
      })
    }

    // Invalid credentials
    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Invalid request' },
      { status: 400 }
    )
  }
}