import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // For demo, return fixed user
    const user = {
      id: 'demo-user-1',
      email: 'demo@restaurantbook.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'CUSTOMER',
      avatar: null,
      phone: null
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}