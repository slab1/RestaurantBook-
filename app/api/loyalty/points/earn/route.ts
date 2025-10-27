import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, LoyaltyTransactionType } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { validateSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const EarnPointsSchema = z.object({
  amount: z.number().min(0.01),
  description: z.string().min(1, 'Description is required').max(255),
  transactionId: z.string().optional(), // External transaction ID
  metadata: z.record(z.any()).optional(),
  source: z.enum(['BOOKING', 'PAYMENT', 'REFERRAL', 'REVIEW', 'BONUS', 'PARTNER', 'EVENT']),
  multiplier: z.number().min(0.1).max(5.0).default(1.0),
})

const BulkEarnPointsSchema = z.object({
  transactions: z.array(
    EarnPointsSchema.extend({
      userId: z.string(),
    })
  ).min(1).max(100), // Max 100 transactions per batch
})

// Nigerian market specific configurations
const NIGERIAN_EARNING_RATES = {
  BOOKING: 0.02, // 2 points per Naira spent on bookings
  PAYMENT: 0.015, // 1.5 points per Naira spent on payments
  REFERRAL: 500, // 500 points per successful referral
  REVIEW: 100, // 100 points per review
  BONUS: 1.0, // Base multiplier
  PARTNER: 0.01, // 1 point per Naira from partner transactions
  EVENT: 2.0, // 2x multiplier for special events
}

// Nigerian cultural bonus events
const NIGERIAN_BONUS_EVENTS = {
  BIRTHDAY_BONUS: {
    multiplier: 3.0,
    bonusPoints: 1000,
    description: 'Birthday celebration bonus',
  },
  INDEPENDENCE_DAY: {
    date: '10-01',
    multiplier: 2.0,
    description: 'Nigeria Independence Day celebration',
  },
  CHRISTMAS: {
    date: '12-25',
    multiplier: 2.5,
    description: 'Christmas celebration bonus',
  },
  NEW_YEAR: {
    date: '01-01',
    multiplier: 3.0,
    description: 'New Year celebration bonus',
  },
  EID_AL_FITR: {
    multiplier: 2.0,
    description: 'Eid al-Fitr celebration bonus',
  },
  EID_AL_ADHA: {
    multiplier: 2.0,
    description: 'Eid al-Adha celebration bonus',
  },
}

// POST /api/loyalty/points/earn - Earn points
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
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

    // Get request body
    const body = await request.json()
    
    // Check if this is a bulk earning request
    if (body.transactions && Array.isArray(body.transactions)) {
      // Only admin can process bulk transactions
      if (authPayload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required for bulk operations' },
          { status: 403 }
        )
      }

      return await handleBulkEarnPoints(body, authPayload)
    }

    // Single transaction
    return await handleSingleEarnPoints(body, authPayload)

  } catch (error: any) {
    logger.error('Error earning points', {
      error: error.message,
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

    return NextResponse.json(
      { 
        error: 'Failed to earn points',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Handle single points earning
async function handleSingleEarnPoints(body: any, authPayload: any) {
  const validatedData = validateSchema(EarnPointsSchema, body)
  
  // Get current user tier for multiplier calculation
  const user = await prisma.user.findUnique({
    where: { id: authPayload.userId },
    include: { loyaltyTransactions: true },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Check for duplicate transaction
  if (validatedData.transactionId) {
    const existingTransaction = await prisma.loyaltyTransaction.findFirst({
      where: { 
        userId: authPayload.userId,
        description: { contains: validatedData.transactionId },
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 409 }
      )
    }
  }

  // Calculate points to earn
  const basePoints = calculateBasePoints(validatedData.source, validatedData.amount)
  const tierMultiplier = await getUserTierMultiplier(user.id)
  const totalMultiplier = tierMultiplier * validatedData.multiplier
  const pointsToEarn = Math.floor(basePoints * totalMultiplier)

  // Check for special events
  const eventBonus = await checkSpecialEvents()
  const finalPoints = Math.floor(pointsToEarn * (eventBonus?.multiplier || 1))

  // Create transaction and update user points atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create loyalty transaction
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        userId: authPayload.userId,
        type: LoyaltyTransactionType.EARNED,
        points: finalPoints,
        description: validatedData.description,
        expiresAt: calculateExpiryDate(validatedData.source),
        ...(validatedData.transactionId && { 
          description: `${validatedData.description} (ID: ${validatedData.transactionId})` 
        }),
      },
    })

    // Update user points
    const updatedUser = await tx.user.update({
      where: { id: authPayload.userId },
      data: {
        loyaltyPoints: { increment: finalPoints },
        totalSpent: validatedData.source === 'BOOKING' || validatedData.source === 'PAYMENT' 
          ? { increment: validatedData.amount } 
          : undefined,
      },
    })

    return { transaction, updatedUser }
  })

  logger.info('Points earned successfully', {
    userId: authPayload.userId,
    points: finalPoints,
    source: validatedData.source,
    amount: validatedData.amount,
    tierMultiplier,
    eventBonus: eventBonus?.description,
  })

  // Send notification if significant points earned
  if (finalPoints >= 1000) {
    // TODO: Send push notification or email
    console.log(`Congratulations! You earned ${finalPoints} loyalty points!`)
  }

  return NextResponse.json({
    success: true,
    data: {
      transactionId: result.transaction.id,
      pointsEarned: finalPoints,
      previousBalance: result.updatedUser.loyaltyPoints - finalPoints,
      newBalance: result.updatedUser.loyaltyPoints,
      tierMultiplier,
      eventBonus: eventBonus?.description || null,
      nigeriaContext: {
        currency: 'NGN',
        amountFormatted: `₦${validatedData.amount.toLocaleString('en-NG')}`,
        pointsValue: `≈ ₦${(finalPoints / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
      },
    },
    message: `Successfully earned ${finalPoints} loyalty points!`,
  }, { status: 201 })
}

// Handle bulk points earning
async function handleBulkEarnPoints(body: any, authPayload: any) {
  const validatedData = validateSchema(BulkEarnPointsSchema, body)
  
  const results = []
  const errors = []

  for (const transaction of validatedData.transactions) {
    try {
      // Calculate points for this transaction
      const basePoints = calculateBasePoints(transaction.source, transaction.amount)
      const tierMultiplier = await getUserTierMultiplier(transaction.userId)
      const totalMultiplier = tierMultiplier * transaction.multiplier
      const pointsToEarn = Math.floor(basePoints * totalMultiplier)

      // Create transaction
      await prisma.loyaltyTransaction.create({
        data: {
          userId: transaction.userId,
          type: LoyaltyTransactionType.EARNED,
          points: pointsToEarn,
          description: transaction.description,
          expiresAt: calculateExpiryDate(transaction.source),
        },
      })

      // Update user points
      await prisma.user.update({
        where: { id: transaction.userId },
        data: {
          loyaltyPoints: { increment: pointsToEarn },
          totalSpent: transaction.source === 'BOOKING' || transaction.source === 'PAYMENT' 
            ? { increment: transaction.amount } 
            : undefined,
        },
      })

      results.push({
        userId: transaction.userId,
        pointsEarned: pointsToEarn,
        success: true,
      })

    } catch (error: any) {
      errors.push({
        userId: transaction.userId,
        error: error.message,
        success: false,
      })
    }
  }

  logger.info('Bulk points earning processed', {
    processedBy: authPayload.userId,
    totalTransactions: validatedData.transactions.length,
    successful: results.length,
    failed: errors.length,
  })

  return NextResponse.json({
    success: true,
    data: {
      results,
      errors,
      summary: {
        total: validatedData.transactions.length,
        successful: results.length,
        failed: errors.length,
        totalPointsEarned: results.reduce((sum, r) => sum + r.pointsEarned, 0),
      },
    },
  })
}

// Helper functions
function calculateBasePoints(source: string, amount: number): number {
  const rate = NIGERIAN_EARNING_RATES[source as keyof typeof NIGERIAN_EARNING_RATES] || 0.01
  return Math.floor(amount * rate)
}

async function getUserTierMultiplier(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { loyaltyTransactions: true },
  })

  if (!user) return 1.0

  // Find current tier
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'desc' },
  })

  const currentTier = tiers.find(tier => 
    user.loyaltyPoints >= tier.minPoints || user.totalSpent >= tier.minSpend
  )

  return currentTier?.multiplier || 1.0
}

async function checkSpecialEvents() {
  const now = new Date()
  const currentDate = now.toISOString().slice(5, 10) // MM-DD format
  
  // Check Nigerian special events
  for (const [eventName, config] of Object.entries(NIGERIAN_BONUS_EVENTS)) {
    if (config.date && config.date === currentDate) {
      return {
        name: eventName,
        multiplier: config.multiplier,
        description: config.description,
      }
    }
  }

  return null
}

function calculateExpiryDate(source: string): Date | null {
  // Most earned points don't expire
  if (['BONUS', 'EVENT'].includes(source)) {
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  }
  
  // Partner points might have shorter expiry
  if (source === 'PARTNER') {
    return new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months
  }
  
  return null // No expiry
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
