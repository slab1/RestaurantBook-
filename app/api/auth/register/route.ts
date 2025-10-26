import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { validateSchema, UserRegistrationSchema } from '@/lib/validation'
import { logger, loggers } from '@/lib/logger'
import { PrismaClient } from '@prisma/client'
import rateLimit from 'express-rate-limit'

const prisma = new PrismaClient()

// Rate limiting for registration
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 registration attempts per window
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = validateSchema(UserRegistrationSchema, body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      loggers.auth.loginFailed(validatedData.email, ipAddress, 'User already exists')
      return NextResponse.json(
        { 
          error: 'User already exists with this email address',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      )
    }

    // Register user
    const result = await AuthService.register(validatedData, ipAddress)

    logger.info('User registration successful', {
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      ipAddress,
    })

    // Return success response (don't include sensitive data)
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Registration error', {
      error: error.message,
      stack: error.stack,
      body: body,
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

    // Handle Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'User already exists with this email address',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Registration failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
