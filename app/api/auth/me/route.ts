import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Demo user data
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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('access_token')

    if (!token || token.value !== 'demo-token-123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: DEMO_USER
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}