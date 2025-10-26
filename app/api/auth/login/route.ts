import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { validateSchema, UserLoginSchema } from '@/lib/validation'
import { logger, loggers } from '@/lib/logger'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = validateSchema(UserLoginSchema, body)

    // Attempt login
    const result = await AuthService.login(validatedData, ipAddress, userAgent)

    // Handle 2FA requirement
    if (!result.success && result.requiresTwoFactor) {
      return NextResponse.json({
        success: false,
        requiresTwoFactor: true,
        message: 'Two-factor authentication required',
      }, { status: 200 })
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    // Set secure HTTP-only cookies for tokens
    const cookieStore = cookies()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      path: '/',
    }

    // Set access token cookie (short expiry)
    cookieStore.set('access_token', result.tokens!.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60, // 15 minutes
    })

    // Set refresh token cookie (longer expiry)
    cookieStore.set('refresh_token', result.tokens!.refreshToken, {
      ...cookieOptions,
      maxAge: validatedData.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
    })

    logger.info('User login successful', {
      userId: result.user!.id,
      email: result.user!.email,
      role: result.user!.role,
      ipAddress,
      userAgent,
      rememberMe: validatedData.rememberMe,
    })

    // Track analytics event
    await prisma.analyticsEvent.create({
      data: {
        event: 'user_login',
        properties: {
          email: result.user!.email,
          role: result.user!.role,
          ip_address: ipAddress,
          user_agent: userAgent,
          remember_me: validatedData.rememberMe,
          two_factor_used: result.user!.twoFactorEnabled,
        },
        userId: result.user!.id,
        ipAddress,
        userAgent,
      },
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: result.user!.id,
        email: result.user!.email,
        firstName: result.user!.firstName,
        lastName: result.user!.lastName,
        role: result.user!.role,
        avatar: result.user!.avatar,
        emailVerified: result.user!.emailVerified,
        twoFactorEnabled: result.user!.twoFactorEnabled,
        loyaltyPoints: 0, // Will be fetched from user profile
      },
      session: {
        id: result.session!.id,
        expiresAt: result.session!.expiresAt,
      },
    }, { status: 200 })

  } catch (error: any) {
    logger.error('Login error', {
      error: error.message,
      stack: error.stack,
      ipAddress: request.headers.get('x-forwarded-for'),
    })

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.issues 
        },
        { status: 400 }
      )
    }

    // Handle authentication errors
    if (error.message.includes('Invalid credentials') || 
        error.message.includes('Invalid password') ||
        error.message.includes('User not found')) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      )
    }

    if (error.message.includes('Account is deactivated')) {
      return NextResponse.json(
        { 
          error: 'Account is deactivated. Please contact support.',
          code: 'ACCOUNT_DEACTIVATED'
        },
        { status: 403 }
      )
    }

    if (error.message.includes('Invalid two-factor code')) {
      return NextResponse.json(
        { 
          error: 'Invalid two-factor authentication code',
          code: 'INVALID_2FA'
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Login failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Authentication error'
      },
      { status: 500 }
    )
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
