import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, LoyaltyTier as Tier } from '@prisma/client'
import { AuthService } from '@/lib/auth'
import { validateSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const LoyaltyTierCreateSchema = z.object({
  name: z.nativeEnum(Tier),
  minPoints: z.number().int().min(0),
  minSpend: z.number().min(0),
  benefits: z.array(z.string()).min(1),
  multiplier: z.number().min(0.1).max(10).default(1.0),
})

const LoyaltyTierUpdateSchema = z.object({
  name: z.nativeEnum(Tier).optional(),
  minPoints: z.number().int().min(0).optional(),
  minSpend: z.number().min(0).optional(),
  benefits: z.array(z.string()).optional(),
  multiplier: z.number().min(0.1).max(10).optional(),
  isActive: z.boolean().optional(),
})

const LoyaltyTierSearchSchema = PaginationSchema.extend({
  tier: z.nativeEnum(Tier).optional(),
  isActive: z.boolean().optional(),
})

// Nigerian market tier configurations
const NIGERIAN_TIER_CONFIGURATIONS = {
  BRONZE: {
    minPoints: 0,
    minSpend: 0,
    benefits: [
      'Welcome bonus points',
      'Birthday reward',
      'Basic customer support',
    ],
    multiplier: 1.0,
  },
  SILVER: {
    minPoints: 1000,
    minSpend: 50000, // ₦50,000
    benefits: [
      'All Bronze benefits',
      '5% discount on orders',
      'Priority customer support',
      'Free delivery on orders above ₦5,000',
      'Early access to promotions',
    ],
    multiplier: 1.25,
  },
  GOLD: {
    minPoints: 5000,
    minSpend: 250000, // ₦250,000
    benefits: [
      'All Silver benefits',
      '10% discount on orders',
      'Free delivery on all orders',
      'Complimentary appetizer once per month',
      'Exclusive Gold member events',
      'Personal account manager',
    ],
    multiplier: 1.5,
  },
  PLATINUM: {
    minPoints: 15000,
    minSpend: 750000, // ₦750,000
    benefits: [
      'All Gold benefits',
      '15% discount on orders',
      'VIP dining experience',
      'Complimentary main course once per month',
      'Priority reservations',
      'Dedicated concierge service',
      'Exclusive partner discounts',
    ],
    multiplier: 2.0,
  },
}

// GET /api/loyalty/tiers - List all loyalty tiers
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = validateSchema(LoyaltyTierSearchSchema, {
      ...queryData,
      page: queryData.page ? parseInt(queryData.page) : 1,
      limit: queryData.limit ? parseInt(queryData.limit) : 10,
    })

    // Build where clause
    const where: any = {}
    if (validatedQuery.tier) {
      where.name = validatedQuery.tier
    }
    if (validatedQuery.isActive !== undefined) {
      where.isActive = validatedQuery.isActive
    }

    // Get tiers from database
    const [tiers, totalCount] = await Promise.all([
      prisma.loyaltyTier.findMany({
        where,
        orderBy: [
          { name: 'asc' }, // BRONZE, SILVER, GOLD, PLATINUM
        ],
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
      }),
      prisma.loyaltyTier.count({ where }),
    ])

    // Add Nigerian market context to each tier
    const tiersWithContext = tiers.map(tier => {
      const config = NIGERIAN_TIER_CONFIGURATIONS[tier.name as keyof typeof NIGERIAN_TIER_CONFIGURATIONS]
      
      return {
        ...tier,
        nigeriaContext: {
          currency: 'NGN',
          minSpendFormatted: `₦${tier.minSpend.toLocaleString('en-NG')}`,
          benefitsInLocalContext: config?.benefits || [],
          tierPrivileges: {
            discountPercentage: tier.multiplier > 1.5 ? 15 : tier.multiplier > 1.2 ? 10 : tier.multiplier > 1.0 ? 5 : 0,
            freeDeliveryThreshold: tier.name === 'PLATINUM' ? 0 : tier.name === 'GOLD' ? 0 : tier.name === 'SILVER' ? 5000 : null,
            prioritySupport: tier.name !== 'BRONZE',
            exclusiveEvents: ['GOLD', 'PLATINUM'].includes(tier.name),
          },
        },
      }
    })

    const pagination = {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      totalCount,
      totalPages: Math.ceil(totalCount / validatedQuery.limit),
      hasNext: validatedQuery.page < Math.ceil(totalCount / validatedQuery.limit),
      hasPrev: validatedQuery.page > 1,
    }

    logger.info('Loyalty tiers retrieved', {
      count: tiers.length,
      filters: validatedQuery,
    })

    return NextResponse.json({
      success: true,
      data: {
        tiers: tiersWithContext,
        pagination,
        nigeriaMarketConfig: {
          currency: 'NGN',
          tierConfigurations: NIGERIAN_TIER_CONFIGURATIONS,
          exchangeRate: 1, // 1 NGN = 1 NGN (for local transactions)
        },
      },
    })

  } catch (error: any) {
    logger.error('Error retrieving loyalty tiers', {
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
        error: 'Failed to retrieve loyalty tiers',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/loyalty/tiers - Create new loyalty tier (Admin only)
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
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    
    // Validate input
    const validatedData = validateSchema(LoyaltyTierCreateSchema, body)

    // Check if tier already exists
    const existingTier = await prisma.loyaltyTier.findUnique({
      where: { name: validatedData.name },
    })

    if (existingTier) {
      return NextResponse.json(
        { error: 'Tier already exists' },
        { status: 409 }
      )
    }

    // Create new tier
    const tier = await prisma.loyaltyTier.create({
      data: validatedData,
    })

    logger.info('Loyalty tier created', {
      tierId: tier.id,
      tierName: tier.name,
      adminUserId: authPayload.userId,
    })

    return NextResponse.json({
      success: true,
      data: tier,
      message: 'Loyalty tier created successfully',
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Error creating loyalty tier', {
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
        error: 'Failed to create loyalty tier',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use specific tier endpoint for updates.' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use specific tier endpoint for deletion.' },
    { status: 405 }
  )
}
