import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Demo registration - create mock user
    const demoUser = {
      id: 'demo-user-1',
      email: email || 'demo@restaurantbook.com',
      firstName: firstName || 'Demo',
      lastName: lastName || 'User',
      role: 'CUSTOMER',
      avatar: null,
      emailVerified: true,
      twoFactorEnabled: false,
      loyaltyPoints: 2500,
    }

    // For demo purposes, always return success
    return NextResponse.json({
      success: true,
      message: 'Demo registration successful',
      user: demoUser,
    }, { status: 201 })

  } catch (error) {
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
