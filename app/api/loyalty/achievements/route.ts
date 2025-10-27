import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, AchievementType, AchievementCategory } from '@prisma/client'
import { AuthService } from '@/lib/auth'
import { validateSchema, CuidSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const AchievementQuerySchema = PaginationSchema.extend({
  type: z.nativeEnum(AchievementType).optional(),
  category: z.nativeEnum(AchievementCategory).optional(),
  isActive: z.boolean().optional(),
})

const UserAchievementQuerySchema = PaginationSchema.extend({
  isCompleted: z.boolean().optional(),
  category: z.nativeEnum(AchievementCategory).optional(),
})

const AchievementCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  type: z.nativeEnum(AchievementType),
  category: z.nativeEnum(AchievementCategory),
  points: z.number().int().min(0).max(10000),
  icon: z.string().url().optional(),
  requirements: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
})

const AchievementUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  points: z.number().int().min(0).max(10000).optional(),
  icon: z.string().url().optional(),
  requirements: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
})

const AwardAchievementSchema = z.object({
  userId: z.string(),
  achievementId: z.string(),
  progress: z.number().min(0).max(1).default(1.0),
})

// Nigerian market specific achievements
const NIGERIAN_ACHIEVEMENTS = [
  {
    name: 'Naija Foodie',
    description: 'Try 5 different Nigerian cuisines',
    type: 'BADGE',
    category: 'BOOKING_STREAK',
    points: 500,
    requirements: { cuisineTypes: 5 },
  },
  {
    name: 'Lagos Explorer',
    description: 'Dine at restaurants in 3 different Lagos areas',
    type: 'MILESTONE',
    category: 'BOOKING_STREAK',
    points: 750,
    requirements: { locations: 3 },
  },
  {
    name: 'Big Spender',
    description: 'Spend ₦100,000 in a single month',
    type: 'MILESTONE',
    category: 'SPENDING_MILESTONE',
    points: 1000,
    requirements: { monthlySpend: 100000 },
  },
  {
    name: 'Social Diner',
    description: 'Write 10 restaurant reviews',
    type: 'BADGE',
    category: 'REVIEWS',
    points: 400,
    requirements: { reviewCount: 10 },
  },
  {
    name: 'Referral Master',
    description: 'Successfully refer 5 friends',
    type: 'CHALLENGE',
    category: 'REFERRALS',
    points: 2000,
    requirements: { referralCount: 5 },
  },
  {
    name: 'Birthday Celebrant',
    description: 'Book a birthday celebration',
    type: 'SPECIAL',
    category: 'BIRTHDAY_BONUS',
    points: 300,
    requirements: { birthdayBooking: true },
  },
  {
    name: 'Independence Day Special',
    description: 'Dine on Nigerian Independence Day',
    type: 'SPECIAL',
    category: 'FESTIVAL_BONUS',
    points: 500,
    requirements: { date: '10-01' },
  },
  {
    name: 'Festival Foodie',
    description: 'Dine during any Nigerian festival',
    type: 'SPECIAL',
    category: 'FESTIVAL_BONUS',
    points: 300,
    requirements: { festivalBooking: true },
  },
]

// GET /api/loyalty/achievements - Get all achievements or user's achievements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pathParts = request.nextUrl.pathname.split('/')
    const isUserAchievements = pathParts.includes('user') || searchParams.has('userId')

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

    // Get query parameters
    const queryData = Object.fromEntries(searchParams.entries())
    
    if (isUserAchievements) {
      // Get user's achievements
      const userId = searchParams.get('userId') || authPayload.userId
      if (userId !== authPayload.userId && authPayload.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        )
      }

      return await getUserAchievements(userId, queryData, authPayload)
    } else {
      // Get all achievements
      return await getAllAchievements(queryData, authPayload)
    }

  } catch (error: any) {
    logger.error('Error retrieving achievements', {
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
        error: 'Failed to retrieve achievements',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

// Get all achievements (for browsing)
async function getAllAchievements(queryData: any, authPayload: any) {
  const validatedQuery = validateSchema(AchievementQuerySchema, {
    ...queryData,
    page: queryData.page ? parseInt(queryData.page) : 1,
    limit: queryData.limit ? parseInt(queryData.limit) : 20,
  })

  // Build where clause
  const where: any = {}
  if (validatedQuery.type) {
    where.type = validatedQuery.type
  }
  if (validatedQuery.category) {
    where.category = validatedQuery.category
  }
  if (validatedQuery.isActive !== undefined) {
    where.isActive = validatedQuery.isActive
  }

  // Get achievements from database
  const [achievements, totalCount] = await Promise.all([
    prisma.achievement.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { points: 'desc' },
      ],
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    }),
    prisma.achievement.count({ where }),
  ])

  // Add Nigerian cultural context
  const achievementsWithContext = achievements.map(achievement => {
    let nigeriaContext = {}
    
    if (achievement.category === 'FESTIVAL_BONUS') {
      nigeriaContext = {
        nigerianFestivals: [
          'Independence Day (October 1)',
          'Christmas',
          'New Year',
          'Eid al-Fitr',
          'Eid al-Adha',
          'Children\'s Day',
        ],
        culturalSignificance: 'Celebrate Nigerian culture and traditions',
      }
    }

    if (achievement.category === 'BOOKING_STREAK') {
      nigeriaContext = {
        popularDestinations: [
          'Victoria Island, Lagos',
          'Ikoyi, Lagos',
          ' Maitama, Abuja',
          'Port Harcourt',
          'Ibadan',
        ],
        culturalNote: 'Explore Nigeria\'s diverse dining scene',
      }
    }

    return {
      ...achievement,
      nigeriaContext,
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

  return NextResponse.json({
    success: true,
    data: {
      achievements: achievementsWithContext,
      pagination,
      categories: Object.values(AchievementCategory),
      types: Object.values(AchievementType),
      nigerianAchievements: NIGERIAN_ACHIEVEMENTS,
    },
  })
}

// Get user's achievements
async function getUserAchievements(userId: string, queryData: any, authPayload: any) {
  const validatedQuery = validateSchema(UserAchievementQuerySchema, {
    ...queryData,
    page: queryData.page ? parseInt(queryData.page) : 1,
    limit: queryData.limit ? parseInt(queryData.limit) : 20,
  })

  // Build where clause
  const where: any = { userId }
  if (validatedQuery.isCompleted !== undefined) {
    where.isCompleted = validatedQuery.isCompleted
  }
  if (validatedQuery.category) {
    where.achievement = { category: validatedQuery.category }
  }

  // Get user's achievements with achievement details
  const [userAchievements, totalCount] = await Promise.all([
    prisma.userAchievement.findMany({
      where,
      include: {
        achievement: true,
      },
      orderBy: [
        { earnedAt: 'desc' },
      ],
      skip: (validatedQuery.page - 1) * validatedQuery.limit,
      take: validatedQuery.limit,
    }),
    prisma.userAchievement.count({ where }),
  ])

  // Calculate progress stats
  const stats = {
    total: totalCount,
    completed: userAchievements.filter(ua => ua.isCompleted).length,
    inProgress: userAchievements.filter(ua => !ua.isCompleted).length,
    totalPointsEarned: userAchievements
      .filter(ua => ua.isCompleted)
      .reduce((sum, ua) => sum + ua.achievement.points, 0),
    categoriesCompleted: new Set(
      userAchievements.filter(ua => ua.isCompleted).map(ua => ua.achievement.category)
    ).size,
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
      achievements: userAchievements,
      stats,
      pagination,
    },
  })
}

// POST /api/loyalty/achievements - Create new achievement (Admin only)
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
    
    // Check if this is awarding an achievement to a user
    if (body.userId && body.achievementId) {
      return await awardAchievement(body, authPayload)
    }

    // Create new achievement
    const validatedData = validateSchema(AchievementCreateSchema, body)

    // Check if achievement with same name already exists
    const existingAchievement = await prisma.achievement.findUnique({
      where: { name: validatedData.name },
    })

    if (existingAchievement) {
      return NextResponse.json(
        { error: 'Achievement with this name already exists' },
        { status: 409 }
      )
    }

    // Create new achievement
    const achievement = await prisma.achievement.create({
      data: validatedData,
    })

    logger.info('Achievement created', {
      achievementId: achievement.id,
      achievementName: achievement.name,
      adminUserId: authPayload.userId,
    })

    return NextResponse.json({
      success: true,
      data: achievement,
      message: 'Achievement created successfully',
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Error creating/awarding achievement', {
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
        error: 'Failed to create/award achievement',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Award achievement to user
async function awardAchievement(body: any, authPayload: any) {
  const validatedData = validateSchema(AwardAchievementSchema, body)

  // Verify user and achievement exist
  const [user, achievement] = await Promise.all([
    prisma.user.findUnique({ where: { id: validatedData.userId } }),
    prisma.achievement.findUnique({ where: { id: validatedData.achievementId } }),
  ])

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  if (!achievement) {
    return NextResponse.json(
      { error: 'Achievement not found' },
      { status: 404 }
    )
  }

  // Check if user already has this achievement
  const existingUserAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId: validatedData.userId,
        achievementId: validatedData.achievementId,
      },
    },
  })

  if (existingUserAchievement) {
    return NextResponse.json(
      { error: 'User already has this achievement' },
      { status: 409 }
    )
  }

  // Create user achievement
  const userAchievement = await prisma.$transaction(async (tx) => {
    // Create user achievement
    const ua = await tx.userAchievement.create({
      data: {
        userId: validatedData.userId,
        achievementId: validatedData.achievementId,
        progress: validatedData.progress,
        isCompleted: validatedData.progress >= 1.0,
        completedAt: validatedData.progress >= 1.0 ? new Date() : null,
      },
      include: {
        achievement: true,
      },
    })

    // Award points if achievement is completed
    if (validatedData.progress >= 1.0) {
      // Update user loyalty points
      await tx.user.update({
        where: { id: validatedData.userId },
        data: {
          loyaltyPoints: { increment: achievement.points },
        },
      })

      // Create loyalty transaction
      await tx.loyaltyTransaction.create({
        data: {
          userId: validatedData.userId,
          type: 'BONUS',
          points: achievement.points,
          description: `Achievement earned: ${achievement.name}`,
        },
      })
    }

    return ua
  })

  logger.info('Achievement awarded', {
    userId: validatedData.userId,
    achievementId: validatedData.achievementId,
    awardedBy: authPayload.userId,
    completed: userAchievement.isCompleted,
    pointsAwarded: userAchievement.isCompleted ? userAchievement.achievement.points : 0,
  })

  return NextResponse.json({
    success: true,
    data: userAchievement,
    message: userAchievement.isCompleted 
      ? `Achievement completed! ${userAchievement.achievement.points} points awarded.`
      : 'Achievement progress updated.',
  }, { status: 201 })
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
