import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '@/lib/auth'
import { validateSchema, CuidSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const PartnerQuerySchema = PaginationSchema.extend({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  category: z.string().optional(), // For filtering by partner type
})

const PartnerCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  website: z.string().url('Invalid website URL').optional(),
  logo: z.string().url('Invalid logo URL').optional(),
  pointsPerNaira: z.number().min(0.001).max(1.0).default(0.01),
  category: z.enum([
    'RESTAURANT',
    'RETAIL',
    'TRAVEL',
    'ENTERTAINMENT',
    'HEALTHCARE',
    'FINANCE',
    'TELECOMMUNICATION',
    'TRANSPORT',
    'FOOD_DELIVERY',
    'GROCERY',
  ]).default('RESTAURANT'),
  integrationDetails: z.object({
    apiEndpoint: z.string().url().optional(),
    webhookUrl: z.string().url().optional(),
    merchantId: z.string().optional(),
    secretKey: z.string().optional(),
    credentials: z.record(z.any()).optional(),
  }).optional(),
  terms: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
})

const PartnerUpdateSchema = PartnerCreateSchema.partial()

const PartnerTransactionSchema = z.object({
  partnerId: z.string(),
  amount: z.number().min(0.01),
  description: z.string().min(1).max(255).optional(),
  metadata: z.record(z.any()).optional(),
  transactionId: z.string().optional(), // External transaction ID
})

// Nigerian partner categories and configurations
const NIGERIAN_PARTNER_CATEGORIES = {
  RESTAURANT: {
    description: 'Restaurants and food service providers',
    popularPartners: [
      'The Yellow Chilli',
      'Bukka Hut',
      'Chicken Republic',
      'Shawarma Planet',
      'Nigerian Indigenous Restaurant',
    ],
    pointsRate: 0.02, // 2 points per Naira
  },
  RETAIL: {
    description: 'Retail stores and shopping',
    popularPartners: [
      'Spar Nigeria',
      'ShopRite',
      'Sahara Group',
      'Computer Village',
      'Balogun Market',
    ],
    pointsRate: 0.015, // 1.5 points per Naira
  },
  TELECOMMUNICATION: {
    description: 'Telecommunication services',
    popularPartners: [
      'MTN Nigeria',
      'Airtel Nigeria',
      'Glo Mobile',
      '9mobile',
    ],
    pointsRate: 0.01, // 1 point per Naira
  },
  TRANSPORT: {
    description: 'Transportation services',
    popularPartners: [
      'Bolt',
      'Uber',
      'Lagos Ride',
      'Gokada',
      'Lagos LBS',
    ],
    pointsRate: 0.025, // 2.5 points per Naira
  },
  FINANCE: {
    description: 'Financial services',
    popularPartners: [
      'First Bank',
      'GTBank',
      'UBA',
      'Access Bank',
      'Zenith Bank',
    ],
    pointsRate: 0.01, // 1 point per Naira
  },
  FOOD_DELIVERY: {
    description: 'Food delivery platforms',
    popularPartners: [
      'Jumia Food',
      'Foodstuction',
      'RestaurantNG',
      'Campus Food',
    ],
    pointsRate: 0.02, // 2 points per Naira
  },
}

// GET /api/loyalty/partners - Get loyalty partners
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (optional for browsing partners)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let authPayload = null
    
    if (token) {
      authPayload = AuthService.verifyToken(token)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    // Check if this is for partner transactions
    const pathParts = request.nextUrl.pathname.split('/')
    const isTransactions = pathParts.includes('transactions')

    if (isTransactions && authPayload) {
      return await getUserPartnerTransactions(authPayload.userId, queryData, authPayload)
    }

    // Validate query parameters
    const validatedQuery = validateSchema(PartnerQuerySchema, {
      ...queryData,
      page: queryData.page ? parseInt(queryData.page) : 1,
      limit: queryData.limit ? parseInt(queryData.limit) : 20,
    })

    // Build where clause
    const where: any = {}
    
    if (validatedQuery.isActive !== undefined) {
      where.isActive = validatedQuery.isActive
    }
    
    if (validatedQuery.isVerified !== undefined) {
      where.isVerified = validatedQuery.isVerified
    }
    
    if (validatedQuery.category) {
      where.category = validatedQuery.category
    }

    // Get partners from database
    const [partners, totalCount] = await Promise.all([
      prisma.loyaltyPartner.findMany({
        where,
        orderBy: [
          { isVerified: 'desc' },
          { isActive: 'desc' },
          { name: 'asc' },
        ],
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
      }),
      prisma.loyaltyPartner.count({ where }),
    ])

    // Add Nigerian context and user interaction data if authenticated
    const partnersWithContext = partners.map(partner => {
      const categoryConfig = NIGERIAN_PARTNER_CATEGORIES[partner.category as keyof typeof NIGERIAN_PARTNER_CATEGORIES]
      
      return {
        ...partner,
        nigeriaContext: {
          category: partner.category,
          categoryDescription: categoryConfig?.description,
          popularPartners: categoryConfig?.popularPartners,
          localPointsRate: categoryConfig?.pointsRate,
          currency: 'NGN',
          popularLocations: getPopularLocations(partner.category),
          culturalNotes: getCulturalNotes(partner.category),
        },
        rewards: {
          pointsPerNaira: partner.pointsPerNaira,
          monthlyValue: calculateMonthlyValue(partner.pointsPerNaira),
          annualValue: calculateAnnualValue(partner.pointsPerNaira),
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

    // Get user's partner transaction summary if authenticated
    let userSummary = null
    if (authPayload) {
      userSummary = await getUserPartnerSummary(authPayload.userId)
    }

    logger.info('Loyalty partners retrieved', {
      userId: authPayload?.userId,
      count: partners.length,
      filters: validatedQuery,
    })

    return NextResponse.json({
      success: true,
      data: {
        partners: partnersWithContext,
        pagination,
        categories: Object.keys(NIGERIAN_PARTNER_CATEGORIES),
        nigeriaMarketConfig: {
          currency: 'NGN',
          categories: NIGERIAN_PARTNER_CATEGORIES,
          popularIntegrationPartners: [
            'Interswitch',
            'Paystack',
            'Flutterwave',
            'Quickteller',
          ],
        },
        userSummary,
      },
    })

  } catch (error: any) {
    logger.error('Error retrieving loyalty partners', {
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
        error: 'Failed to retrieve loyalty partners',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Get user's partner transactions
async function getUserPartnerTransactions(userId: string, queryData: any, authPayload: any) {
  const validatedQuery = validateSchema(PaginationSchema, {
    ...queryData,
    page: queryData.page ? parseInt(queryData.page) : 1,
    limit: queryData.limit ? parseInt(queryData.limit) : 20,
  })

  // Get user's partner transactions
  const [transactions, totalCount] = await Promise.all([
    prisma.partnerTransaction.findMany({
      where: { userId },
      include: {
        partner: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    }),
    prisma.partnerTransaction.count({ where: { userId } }),
  ])

  // Calculate summary stats
  const stats = {
    totalTransactions: totalCount,
    totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
    totalPoints: transactions.reduce((sum, t) => sum + t.points, 0),
    thisMonthTransactions: transactions.filter(t => {
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      return t.createdAt >= thisMonth
    }).length,
    favoritePartner: transactions.length > 0 
      ? transactions.reduce((acc, t) => {
          acc[t.partnerId] = (acc[t.partnerId] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      : null,
  }

  const pagination = {
    page: validatedQuery.page,
    limit: validatedQuery.limit,
    totalCount,
    totalPages: Math.ceil(totalCount / validatedQuery.limit),
    hasNext: validatedQuery.page < Math.ceil(totalCount / validatedQuery.limit),
    hasPrev: validatedQuery.page > 1,
  }

  return NextResponse.json({
    success: true,
    data: {
      transactions: transactions.map(t => ({
        ...t,
        nigeriaContext: {
          amountFormatted: `₦${t.amount.toLocaleString('en-NG')}`,
          pointsValue: `≈ ₦${(t.points / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
        },
      })),
      pagination,
      stats,
    },
  })
}

// POST /api/loyalty/partners - Create new partner (Admin only) or create partner transaction
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
    
    // Check if this is a partner transaction
    if (body.partnerId && body.amount) {
      return await createPartnerTransaction(body, authPayload)
    }

    // Create new partner (Admin only)
    if (authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return await createPartner(body, authPayload)

  } catch (error: any) {
    logger.error('Error creating partner or transaction', {
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
        error: 'Failed to process partner request',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Create new partner
async function createPartner(body: any, authPayload: any) {
  const validatedData = validateSchema(PartnerCreateSchema, body)

  // Check if partner with same name already exists
  const existingPartner = await prisma.loyaltyPartner.findUnique({
    where: { name: validatedData.name },
  })

  if (existingPartner) {
    return NextResponse.json(
      { error: 'Partner with this name already exists' },
      { status: 409 }
    )
  }

  // Create partner
  const partner = await prisma.loyaltyPartner.create({
    data: validatedData,
  })

  logger.info('Loyalty partner created', {
    partnerId: partner.id,
    partnerName: partner.name,
    adminUserId: authPayload.userId,
  })

  return NextResponse.json({
    success: true,
    data: partner,
    message: 'Loyalty partner created successfully',
  }, { status: 201 })
}

// Create partner transaction
async function createPartnerTransaction(body: any, authPayload: any) {
  const validatedData = validateSchema(PartnerTransactionSchema, body)

  // Verify partner exists
  const partner = await prisma.loyaltyPartner.findUnique({
    where: { id: validatedData.partnerId },
  })

  if (!partner) {
    return NextResponse.json(
      { error: 'Partner not found' },
      { status: 404 }
    )
  }

  if (!partner.isActive) {
    return NextResponse.json(
      { error: 'Partner is not currently active' },
      { status: 400 }
    )
  }

  // Check for duplicate transaction
  if (validatedData.transactionId) {
    const existingTransaction = await prisma.partnerTransaction.findFirst({
      where: { 
        userId: authPayload.userId,
        partnerId: validatedData.partnerId,
        metadata: {
          path: ['transactionId'],
          equals: validatedData.transactionId,
        },
      },
    })

    if (existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 409 }
      )
    }
  }

  // Calculate points
  const points = Math.floor(validatedData.amount * partner.pointsPerNaira)

  // Create transaction and award points atomically
  const result = await prisma.$transaction(async (tx) => {
    // Create partner transaction
    const transaction = await tx.partnerTransaction.create({
      data: {
        userId: authPayload.userId,
        partnerId: validatedData.partnerId,
        amount: validatedData.amount,
        points: points,
        description: validatedData.description || `Transaction with ${partner.name}`,
        metadata: {
          ...validatedData.metadata,
          ...(validatedData.transactionId && { transactionId: validatedData.transactionId }),
          partnerPointsRate: partner.pointsPerNaira,
        },
      },
    })

    // Award loyalty points
    await tx.loyaltyTransaction.create({
      data: {
        userId: authPayload.userId,
        type: 'BONUS',
        points: points,
        description: `Partner transaction: ${partner.name}`,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months expiry
      },
    })

    // Update user points
    const updatedUser = await tx.user.update({
      where: { id: authPayload.userId },
      data: {
        loyaltyPoints: { increment: points },
        totalSpent: { increment: validatedData.amount },
      },
    })

    return { transaction, updatedUser }
  })

  logger.info('Partner transaction processed', {
    userId: authPayload.userId,
    partnerId: validatedData.partnerId,
    amount: validatedData.amount,
    pointsAwarded: points,
    partnerName: partner.name,
  })

  return NextResponse.json({
    success: true,
    data: {
      transactionId: result.transaction.id,
      partner: {
        id: partner.id,
        name: partner.name,
        category: partner.category,
      },
      amount: validatedData.amount,
      pointsAwarded: points,
      previousBalance: result.updatedUser.loyaltyPoints - points,
      newBalance: result.updatedUser.loyaltyPoints,
      nigeriaContext: {
        currency: 'NGN',
        amountFormatted: `₦${validatedData.amount.toLocaleString('en-NG')}`,
        pointsValue: `≈ ₦${(points / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
        pointsPerNaira: partner.pointsPerNaira,
      },
    },
    message: `Successfully earned ${points} points from ${partner.name}!`,
  }, { status: 201 })
}

// Helper functions
function getPopularLocations(category: string): string[] {
  const locationMap: Record<string, string[]> = {
    RESTAURANT: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'],
    RETAIL: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Kaduna'],
    TELECOMMUNICATION: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'],
    TRANSPORT: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Benin City'],
    FINANCE: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'],
    FOOD_DELIVERY: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Warri'],
  }
  return locationMap[category] || []
}

function getCulturalNotes(category: string): string {
  const notes: Record<string, string> = {
    RESTAURANT: 'Authentic Nigerian cuisine and international dining options',
    RETAIL: 'From traditional markets to modern shopping malls',
    TELECOMMUNICATION: 'Stay connected across all 36 states of Nigeria',
    TRANSPORT: 'Navigate Nigeria\'s busy cities with ease',
    FINANCE: 'Banking and financial services trusted by millions',
    FOOD_DELIVERY: 'From street food to gourmet meals, delivered fast',
  }
  return notes[category] || 'Serving communities across Nigeria'
}

function calculateMonthlyValue(pointsPerNaira: number): string {
  // Assuming average monthly spending of ₦50,000
  const monthlySpend = 50000
  const monthlyPoints = Math.floor(monthlySpend * pointsPerNaira)
  return `₦${(monthlyPoints / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function calculateAnnualValue(pointsPerNaira: number): string {
  // Assuming average annual spending of ₦600,000
  const annualSpend = 600000
  const annualPoints = Math.floor(annualSpend * pointsPerNaira)
  return `₦${(annualPoints / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

async function getUserPartnerSummary(userId: string) {
  const transactions = await prisma.partnerTransaction.findMany({
    where: { userId },
    include: { partner: true },
  })

  const partnerCounts = transactions.reduce((acc, t) => {
    const partnerName = t.partner.name
    if (!acc[partnerName]) {
      acc[partnerName] = {
        count: 0,
        totalAmount: 0,
        totalPoints: 0,
        partnerId: t.partnerId,
      }
    }
    acc[partnerName].count++
    acc[partnerName].totalAmount += t.amount
    acc[partnerName].totalPoints += t.points
    return acc
  }, {} as Record<string, any>)

  const totalPartners = Object.keys(partnerCounts).length
  const totalTransactions = transactions.length
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)
  const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0)

  const favoritePartner = totalPartners > 0 
    ? Object.entries(partnerCounts).sort(([,a], [,b]) => b.count - a.count)[0]
    : null

  return {
    totalPartners,
    totalTransactions,
    totalAmount,
    totalPoints,
    favoritePartner: favoritePartner ? {
      name: favoritePartner[0],
      transactionCount: favoritePartner[1].count,
      partnerId: favoritePartner[1].partnerId,
    } : null,
    recentActivity: transactions.slice(0, 5),
  }
}

// Handle other HTTP methods
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
