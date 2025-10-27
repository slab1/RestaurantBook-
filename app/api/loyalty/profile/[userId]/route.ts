import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '@/lib/auth'
import { validateSchema, CuidSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'

const prisma = new PrismaClient()

// Validation schemas
const LoyaltyProfileQuerySchema = PaginationSchema

// Nigerian market validation constants
const NIGERIAN_CURRENCY = 'NGN'
const NIGERIAN_TIMEZONE = 'Africa/Lagos'
const NIGERIAN_PHONE_CODE = '+234'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Get request parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    // Validate user ID format
    const userId = CuidSchema.parse(params.userId)
    
    // Validate query parameters
    const validatedQuery = validateSchema(LoyaltyProfileQuerySchema, {
      ...queryData,
      page: queryData.page ? parseInt(queryData.page) : 1,
      limit: queryData.limit ? parseInt(queryData.limit) : 10,
    })

    // Get authenticated user from token
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authPayload = AuthService.verifyToken(token)
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Users can only view their own profile unless they're admin
    if (authPayload.userId !== userId && authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get user with loyalty profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loyaltyTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 20, // Last 20 transactions
        },
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: { earnedAt: 'desc' },
          take: 10, // Last 10 achievements
        },
        partnerTransactions: {
          include: {
            partner: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 partner transactions
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate current tier based on points and spending
    const currentTier = await getCurrentTier(user.loyaltyPoints, user.totalSpent)
    
    // Calculate next tier
    const nextTier = await getNextTier(user.loyaltyPoints, user.totalSpent)
    
    // Calculate progress to next tier
    const progressToNextTier = nextTier 
      ? calculateTierProgress(user.loyaltyPoints, user.totalSpent, nextTier)
      : null

    // Get recent activity summary
    const recentActivity = {
      transactions: user.loyaltyTransactions.length,
      achievements: user.userAchievements.length,
      partnerTransactions: user.partnerTransactions.length,
      totalPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
    }

    // Nigerian market specific information
    const nigeriaContext = {
      currency: NIGERIAN_CURRENCY,
      timezone: NIGERIAN_TIMEZONE,
      phoneCode: NIGERIAN_PHONE_CODE,
      localSpendFormatted: `₦${user.totalSpent.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
    }

    // Build loyalty profile
    const loyaltyProfile = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      currentTier,
      nextTier,
      progressToNextTier,
      totalPoints: user.loyaltyPoints,
      totalSpent: user.totalSpent,
      memberSince: user.createdAt,
      recentActivity,
      nigeriaContext,
      lastUpdated: new Date().toISOString(),
    }

    logger.info('Loyalty profile retrieved', {
      userId: authPayload.userId,
      targetUserId: userId,
      points: user.loyaltyPoints,
      tier: currentTier?.name,
    })

    return NextResponse.json({
      success: true,
      data: loyaltyProfile,
    })

  } catch (error: any) {
    logger.error('Error retrieving loyalty profile', {
      error: error.message,
      userId: params.userId,
      stack: error.stack,
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

    // Handle invalid user ID
    if (error.message?.includes('Invalid ID format')) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to retrieve loyalty profile',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Helper functions
async function getCurrentTier(points: number, spend: number) {
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'desc' },
  })

  return tiers.find(tier => 
    points >= tier.minPoints || spend >= tier.minSpend
  ) || tiers[tiers.length - 1] // Default to lowest tier
}

async function getNextTier(points: number, spend: number) {
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'asc' },
  })

  return tiers.find(tier => 
    points < tier.minPoints && spend < tier.minSpend
  )
}

function calculateTierProgress(points: number, spend: number, nextTier: any) {
  const currentValue = Math.max(points, spend)
  const requiredValue = Math.min(nextTier.minPoints, nextTier.minSpend)
  
  return {
    current: currentValue,
    required: requiredValue,
    percentage: Math.min(100, (currentValue / requiredValue) * 100),
  }
}

// Handle other HTTP methods
export async function POST() {
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
