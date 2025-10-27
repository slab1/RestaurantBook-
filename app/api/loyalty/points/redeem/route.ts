import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, LoyaltyTransactionType } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { validateSchema, CuidSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const RedeemPointsSchema = z.object({
  points: z.number().int().min(1, 'Points must be at least 1'),
  description: z.string().min(1, 'Description is required').max(255),
  redemptionType: z.enum([
    'DISCOUNT',
    'FREE_ITEM',
    'FREE_DELIVERY',
    'UPGRADE',
    'GIFT_CARD',
    'CASHBACK',
    'PARTNER_REWARD'
  ]),
  metadata: z.record(z.any()).optional(),
})

const BulkRedeemPointsSchema = z.object({
  redemptions: z.array(
    RedeemPointsSchema.extend({
      userId: z.string(),
    })
  ).min(1).max(100),
})

// Nigerian market redemption configurations
const NIGERIAN_REDEMPTION_RATES = {
  // 100 points = ₦100 discount
  DISCOUNT_RATE: 1.0,
  // Special redemption rates
  FREE_DELIVERY: 500, // 500 points for free delivery
  FREE_APPETIZER: 1000, // 1000 points for free appetizer
  FREE_MAIN_COURSE: 2500, // 2500 points for free main course
  VIP_UPGRADE: 5000, // 5000 points for VIP upgrade
  GIFT_CARD_5000: 5000, // ₦5000 gift card for 5000 points
  GIFT_CARD_10000: 10000, // ₦10000 gift card for 10000 points
  BIRTHDAY_CAKE: 1500, // 1500 points for birthday cake
}

// Minimum balance requirements
const MINIMUM_BALANCE_AFTER_REDEMPTION = 100 // Keep at least 100 points

// POST /api/loyalty/points/redeem - Redeem points
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
    
    // Check if this is a bulk redemption request
    if (body.redemptions && Array.isArray(body.redemptions)) {
      // Only admin can process bulk redemptions
      if (authPayload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required for bulk operations' },
          { status: 403 }
        )
      }

      return await handleBulkRedeemPoints(body, authPayload)
    }

    // Single redemption
    return await handleSingleRedeemPoints(body, authPayload)

  } catch (error: any) {
    logger.error('Error redeeming points', {
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
        error: 'Failed to redeem points',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Handle single points redemption
async function handleSingleRedeemPoints(body: any, authPayload: any) {
  const validatedData = validateSchema(RedeemPointsSchema, body)
  
  // Get current user
  const user = await prisma.user.findUnique({
    where: { id: authPayload.userId },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  // Check if user has enough points
  if (user.loyaltyPoints < validatedData.points) {
    return NextResponse.json(
      { 
        error: 'Insufficient points',
        code: 'INSUFFICIENT_POINTS',
        data: {
          currentPoints: user.loyaltyPoints,
          requiredPoints: validatedData.points,
          shortage: validatedData.points - user.loyaltyPoints,
        }
      },
      { status: 400 }
    )
  }

  // Check minimum balance requirement
  const newBalance = user.loyaltyPoints - validatedData.points
  if (newBalance < MINIMUM_BALANCE_AFTER_REDEMPTION) {
    return NextResponse.json(
      { 
        error: 'Redemption would violate minimum balance requirement',
        code: 'MINIMUM_BALANCE_VIOLATION',
        data: {
          currentPoints: user.loyaltyPoints,
          redemptionPoints: validatedData.points,
          newBalance,
          minimumRequired: MINIMUM_BALANCE_AFTER_REDEMPTION,
        }
      },
      { status: 400 }
    )
  }

  // Check redemption limits
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayRedemptions = await prisma.loyaltyTransaction.count({
    where: {
      userId: authPayload.userId,
      type: LoyaltyTransactionType.REDEEMED,
      createdAt: { gte: today },
    },
  })

  const MAX_DAILY_REDEMPTIONS = 5
  if (todayRedemptions >= MAX_DAILY_REDEMPTIONS) {
    return NextResponse.json(
      { 
        error: 'Daily redemption limit exceeded',
        code: 'DAILY_LIMIT_EXCEEDED',
        data: {
          maxRedemptions: MAX_DAILY_REDEMPTIONS,
          usedRedemptions: todayRedemptions,
        }
      },
      { status: 429 }
    )
  }

  // Validate redemption type and points requirement
  const validationResult = validateRedemptionType(validatedData.redemptionType, validatedData.points)
  if (!validationResult.valid) {
    return NextResponse.json(
      { 
        error: validationResult.error,
        code: 'INVALID_REDEMPTION',
      },
      { status: 400 }
    )
  }

  // Calculate monetary value
  const monetaryValue = validatedData.points * NIGERIAN_REDEMPTION_RATES.DISCOUNT_RATE

  // Create transaction and update user points atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create loyalty transaction
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        userId: authPayload.userId,
        type: LoyaltyTransactionType.REDEEMED,
        points: -validatedData.points, // Negative for redemption
        description: validatedData.description,
      },
    })

    // Update user points
    const updatedUser = await tx.user.update({
      where: { id: authPayload.userId },
      data: {
        loyaltyPoints: { decrement: validatedData.points },
      },
    })

    // Create gift card if applicable
    let giftCard = null
    if (validatedData.redemptionType === 'GIFT_CARD') {
      const giftCardValue = getGiftCardValue(validatedData.points)
      if (giftCardValue > 0) {
        const giftCardCode = generateGiftCardCode()
        
        giftCard = await tx.giftCard.create({
          data: {
            code: giftCardCode,
            initialAmount: giftCardValue,
            currentAmount: giftCardValue,
            purchasedById: authPayload.userId,
            expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
          },
        })
      }
    }

    return { transaction, updatedUser, giftCard }
  })

  logger.info('Points redeemed successfully', {
    userId: authPayload.userId,
    pointsRedeemed: validatedData.points,
    redemptionType: validatedData.redemptionType,
    monetaryValue,
    newBalance: result.updatedUser.loyaltyPoints,
  })

  // Prepare response data
  const responseData = {
    transactionId: result.transaction.id,
    pointsRedeemed: validatedData.points,
    previousBalance: user.loyaltyPoints,
    newBalance: result.updatedUser.loyaltyPoints,
    monetaryValue: {
      amount: monetaryValue,
      formatted: `₦${monetaryValue.toLocaleString('en-NG')}`,
    },
    redemptionDetails: getRedemptionDetails(validatedData.redemptionType, validatedData.points),
    nigeriaContext: {
      currency: 'NGN',
      pointsToNairaRate: NIGERIAN_REDEMPTION_RATES.DISCOUNT_RATE,
      minimumBalance: MINIMUM_BALANCE_AFTER_REDEMPTION,
    },
  }

  // Add gift card info if created
  if (result.giftCard) {
    responseData.giftCard = {
      id: result.giftCard.id,
      code: result.giftCard.code,
      amount: result.giftCard.initialAmount,
      expiresAt: result.giftCard.expiresAt,
    }
  }

  return NextResponse.json({
    success: true,
    data: responseData,
    message: `Successfully redeemed ${validatedData.points} points!`,
  }, { status: 201 })
}

// Handle bulk points redemption
async function handleBulkRedeemPoints(body: any, authPayload: any) {
  const validatedData = validateSchema(BulkRedeemPointsSchema, body)
  
  const results = []
  const errors = []

  for (const redemption of validatedData.redemptions) {
    try {
      // Validate redemption
      const validationResult = validateRedemptionType(redemption.redemptionType, redemption.points)
      if (!validationResult.valid) {
        errors.push({
          userId: redemption.userId,
          error: validationResult.error,
          success: false,
        })
        continue
      }

      // Create transaction
      await prisma.loyaltyTransaction.create({
        data: {
          userId: redemption.userId,
          type: LoyaltyTransactionType.REDEEMED,
          points: -redemption.points,
          description: redemption.description,
        },
      })

      // Update user points
      await prisma.user.update({
        where: { id: redemption.userId },
        data: {
          loyaltyPoints: { decrement: redemption.points },
        },
      })

      results.push({
        userId: redemption.userId,
        pointsRedeemed: redemption.points,
        redemptionType: redemption.redemptionType,
        success: true,
      })

    } catch (error: any) {
      errors.push({
        userId: redemption.userId,
        error: error.message,
        success: false,
      })
    }
  }

  logger.info('Bulk points redemption processed', {
    processedBy: authPayload.userId,
    totalRedemptions: validatedData.redemptions.length,
    successful: results.length,
    failed: errors.length,
  })

  return NextResponse.json({
    success: true,
    data: {
      results,
      errors,
      summary: {
        total: validatedData.redemptions.length,
        successful: results.length,
        failed: errors.length,
        totalPointsRedeemed: results.reduce((sum, r) => sum + r.pointsRedeemed, 0),
      },
    },
  })
}

// Helper functions
function validateRedemptionType(redemptionType: string, points: number): { valid: boolean; error?: string } {
  const requirements = {
    FREE_DELIVERY: NIGERIAN_REDEMPTION_RATES.FREE_DELIVERY,
    FREE_APPETIZER: NIGERIAN_REDEMPTION_RATES.FREE_APPETIZER,
    FREE_MAIN_COURSE: NIGERIAN_REDEMPTION_RATES.FREE_MAIN_COURSE,
    VIP_UPGRADE: NIGERIAN_REDEMPTION_RATES.VIP_UPGRADE,
    BIRTHDAY_CAKE: NIGERIAN_REDEMPTION_RATES.BIRTHDAY_CAKE,
  }

  if (redemptionType in requirements && points < requirements[redemptionType as keyof typeof requirements]) {
    return {
      valid: false,
      error: `Insufficient points for ${redemptionType}. Required: ${requirements[redemptionType as keyof typeof requirements]} points`,
    }
  }

  return { valid: true }
}

function getGiftCardValue(points: number): number {
  if (points >= NIGERIAN_REDEMPTION_RATES.GIFT_CARD_10000) {
    return 10000
  } else if (points >= NIGERIAN_REDEMPTION_RATES.GIFT_CARD_5000) {
    return 5000
  }
  return 0
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `NG${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}`
}

function getRedemptionDetails(redemptionType: string, points: number) {
  const details: Record<string, any> = {
    DISCOUNT: {
      title: 'Discount Applied',
      description: `₦${(points * NIGERIAN_REDEMPTION_RATES.DISCOUNT_RATE).toLocaleString('en-NG')} discount on your next order`,
      value: points * NIGERIAN_REDEMPTION_RATES.DISCOUNT_RATE,
    },
    FREE_DELIVERY: {
      title: 'Free Delivery',
      description: 'Free delivery on your next order',
      value: 'Free delivery',
    },
    FREE_APPETIZER: {
      title: 'Free Appetizer',
      description: 'Complimentary appetizer with your order',
      value: '1 free appetizer',
    },
    FREE_MAIN_COURSE: {
      title: 'Free Main Course',
      description: 'Complimentary main course with your order',
      value: '1 free main course',
    },
    VIP_UPGRADE: {
      title: 'VIP Upgrade',
      description: 'VIP experience for your next visit',
      value: 'VIP upgrade',
    },
    GIFT_CARD: {
      title: 'Gift Card',
      description: `₦${getGiftCardValue(points).toLocaleString('en-NG')} gift card`,
      value: getGiftCardValue(points),
    },
    BIRTHDAY_CAKE: {
      title: 'Birthday Cake',
      description: 'Complimentary birthday cake',
      value: '1 birthday cake',
    },
  }

  return details[redemptionType] || {
    title: 'Reward',
    description: 'Loyalty reward redeemed',
    value: points,
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
