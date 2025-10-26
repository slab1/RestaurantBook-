import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { 
          error: 'Refresh token not found',
          code: 'NO_REFRESH_TOKEN'
        },
        { status: 401 }
      )
    }

    // Refresh the token
    const result = await AuthService.refreshToken(refreshToken)

    if (!result.success) {
      // Clear invalid refresh token
      cookieStore.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0,
      })

      return NextResponse.json(
        { 
          error: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        },
        { status: 401 }
      )
    }

    // Update cookies with new tokens
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    }

    // Set new access token
    cookieStore.set('access_token', result.tokens!.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    })

    // Set new refresh token
    cookieStore.set('refresh_token', result.tokens!.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    logger.info('Token refresh successful', {
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    return NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Token refresh error', {
      error: error.message,
      stack: error.stack,
    })

    // Clear potentially invalid refresh token
    const cookieStore = cookies()
    cookieStore.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
      maxAge: 0,
    })

    if (error.message.includes('Invalid refresh token') || 
        error.message.includes('Session expired')) {
      return NextResponse.json(
        { 
          error: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Token refresh failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error'
      },
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
