import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { logger, loggers } from '@/lib/logger'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('access_token')?.value
    const refreshToken = cookieStore.get('refresh_token')?.value

    let userId = 'unknown'
    let sessionToken = ''

    // Verify and get user info from access token
    if (accessToken) {
      const payload = AuthService.verifyToken(accessToken)
      if (payload) {
        userId = payload.userId
        sessionToken = payload.sessionId
      }
    }

    // If no access token, try refresh token
    if (!sessionToken && refreshToken) {
      const payload = AuthService.verifyToken(refreshToken, true)
      if (payload) {
        userId = payload.userId
        sessionToken = payload.sessionId
      }
    }

    // Invalidate session if we have one
    if (sessionToken) {
      await AuthService.logout(sessionToken, userId)
    }

    // Clear cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0, // Expire immediately
    }

    cookieStore.set('access_token', '', cookieOptions)
    cookieStore.set('refresh_token', '', cookieOptions)

    // Track analytics event
    if (userId !== 'unknown') {
      try {
        await prisma.analyticsEvent.create({
          data: {
            event: 'user_logout',
            properties: {
              ip_address: request.headers.get('x-forwarded-for') || 'unknown',
              user_agent: request.headers.get('user-agent') || 'unknown',
            },
            userId,
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
          },
        })
      } catch (analyticsError) {
        // Don't fail logout if analytics fails
        logger.warn('Analytics tracking failed during logout', { 
          userId, 
          error: analyticsError 
        })
      }
    }

    logger.info('User logout successful', {
      userId,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Logout error', {
      error: error.message,
      stack: error.stack,
    })

    // Even if there's an error, we should clear cookies
    const cookieStore = cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    }

    cookieStore.set('access_token', '', cookieOptions)
    cookieStore.set('refresh_token', '', cookieOptions)

    return NextResponse.json({
      success: true,
      message: 'Logout completed (with cleanup)',
    }, { status: 200 })
  } finally {
    await prisma.$disconnect()
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
