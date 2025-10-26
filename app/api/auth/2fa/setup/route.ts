import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { validateSchema, TwoFactorSetupSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { cookies } from 'next/headers'

// Middleware to get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    throw new Error('Authentication required')
  }

  const payload = AuthService.verifyToken(accessToken)
  if (!payload) {
    throw new Error('Invalid or expired token')
  }

  return payload
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    // Setup 2FA
    const result = await AuthService.setupTwoFactor(user.userId)

    logger.info('2FA setup initiated', {
      userId: user.userId,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      qrCode: result.qrCode,
      secret: result.secret,
      manualEntryKey: result.manualEntryKey,
    }, { status: 200 })

  } catch (error: any) {
    logger.error('2FA setup error', {
      error: error.message,
      stack: error.stack,
    })

    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.message.includes('Two-factor authentication is already enabled')) {
      return NextResponse.json(
        { 
          error: 'Two-factor authentication is already enabled',
          code: '2FA_ALREADY_ENABLED'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: '2FA setup failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Setup error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = validateSchema(TwoFactorSetupSchema, body)

    // Enable 2FA
    const result = await AuthService.enableTwoFactor(user.userId, validatedData.code)

    logger.info('2FA enabled successfully', {
      userId: user.userId,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully',
    }, { status: 200 })

  } catch (error: any) {
    logger.error('2FA enable error', {
      error: error.message,
      stack: error.stack,
    })

    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

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

    if (error.message.includes('Invalid verification code')) {
      return NextResponse.json(
        { 
          error: 'Invalid verification code. Please try again.',
          code: 'INVALID_2FA_CODE'
        },
        { status: 400 }
      )
    }

    if (error.message.includes('Two-factor setup not found')) {
      return NextResponse.json(
        { 
          error: 'Two-factor setup not found. Please initiate setup first.',
          code: '2FA_SETUP_NOT_FOUND'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: '2FA enable failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Enable error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    // Get request body
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to disable 2FA' },
        { status: 400 }
      )
    }

    // Disable 2FA
    const result = await AuthService.disableTwoFactor(user.userId, password)

    logger.info('2FA disabled successfully', {
      userId: user.userId,
      email: user.email,
    })

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully',
    }, { status: 200 })

  } catch (error: any) {
    logger.error('2FA disable error', {
      error: error.message,
      stack: error.stack,
    })

    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.message.includes('Invalid password')) {
      return NextResponse.json(
        { 
          error: 'Invalid password',
          code: 'INVALID_PASSWORD'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: '2FA disable failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Disable error'
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
