import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { validateSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const LeaderboardQuerySchema = PaginationSchema.extend({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'all_time']).default('monthly'),
  category: z.enum(['points', 'spending', 'bookings', 'reviews']).default('points'),
  region: z.string().optional(), // Lagos, Abuja, Port Harcourt, etc.
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
})

// Nigerian regions for leaderboard
const NIGERIAN_REGIONS = {
  'LAGOS': 'Lagos',
  'ABUJA': 'Abuja (FCT)',
  'PORT_HARCOURT': 'Port Harcourt',
  'IBADAN': 'Ibadan',
  'KADUNA': 'Kaduna',
  'KANO': 'Kano',
  'WARRI': 'Warri',
  'ENUGU': 'Enugu',
  'BENIN_CITY': 'Benin City',
  'ABA': 'Aba',
}

// Types for leaderboard entry
interface LeaderboardEntry {
  userId: string
  rank: number
  name: string
  avatar?: string
  points: number
  totalSpent: number
  bookingsCount: number
  reviewsCount: number
  tier: string
  region?: string
  change: number // Rank change from previous period
}

// GET /api/loyalty/leaderboard - Get leaderboard data
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = validateSchema(LeaderboardQuerySchema, {
      ...queryData,
      page: queryData.page ? parseInt(queryData.page) : 1,
      limit: queryData.limit ? parseInt(queryData.limit) : 50,
    })

    // Calculate date range based on period
    const dateRange = calculateDateRange(validatedQuery.period)
    
    // Get leaderboard data
    const leaderboardData = await getLeaderboardData(validatedQuery, dateRange, authPayload.userId)

    logger.info('Leaderboard retrieved', {
      userId: authPayload.userId,
      period: validatedQuery.period,
      category: validatedQuery.category,
      region: validatedQuery.region,
      totalEntries: leaderboardData.entries.length,
    })

    return NextResponse.json({
      success: true,
      data: leaderboardData,
    })

  } catch (error: any) {
    logger.error('Error retrieving leaderboard', {
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
        error: 'Failed to retrieve leaderboard',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Get leaderboard data
async function getLeaderboardData(query: any, dateRange: { start: Date; end: Date }, currentUserId: string) {
  const { page, limit, category, region, tier } = query

  // Build base where clause for filtering users
  const whereClause: any = {
    isActive: true,
    emailVerified: true,
  }

  // Apply region filter (based on user's city/state)
  if (region) {
    whereClause.OR = [
      { city: { contains: region, mode: 'insensitive' } },
      { state: { contains: region, mode: 'insensitive' } },
    ]
  }

  // Apply tier filter based on points and spending
  let tierWhereClause = {}
  if (tier) {
    const tierData = await getTierRequirements(tier)
    if (tierData) {
      tierWhereClause = {
        OR: [
          { loyaltyPoints: { gte: tierData.minPoints } },
          { totalSpent: { gte: tierData.minSpend } },
        ],
      }
    }
  }

  // Get users with their stats
  const users = await prisma.user.findMany({
    where: {
      ...whereClause,
      ...tierWhereClause,
    },
    include: {
      bookings: {
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
          status: 'COMPLETED',
        },
        select: { id: true },
      },
      reviews: {
        where: {
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        select: { id: true, rating: true },
      },
      loyaltyTransactions: {
        where: {
          type: 'EARNED',
          createdAt: {
            gte: dateRange.start,
            lte: dateRange.end,
          },
        },
        select: { points: true },
      },
    },
    orderBy: getOrderByClause(category),
    skip: (page - 1) * limit,
    take: limit,
  })

  // Get current user's rank
  const currentUserRank = await getUserRank(currentUserId, category, dateRange, whereClause, tierWhereClause)

  // Get user's previous rank for change calculation
  const previousPeriodRange = getPreviousPeriodRange(query.period)
  const previousUserRank = await getUserRank(currentUserId, category, previousPeriodRange, whereClause, tierWhereClause)

  // Get total count for pagination
  const totalCount = await prisma.user.count({
    where: {
      ...whereClause,
      ...tierWhereClause,
    },
  })

  // Build leaderboard entries
  const entries: LeaderboardEntry[] = []
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    const baseRank = (page - 1) * limit + i + 1

    // Calculate metrics based on category
    let points = 0
    let totalSpent = user.totalSpent
    let bookingsCount = user.bookings.length
    let reviewsCount = user.reviews.length

    if (category === 'points') {
      points = user.loyaltyPoints
    } else if (category === 'spending') {
      points = user.totalSpent
    } else if (category === 'bookings') {
      points = bookingsCount
    } else if (category === 'reviews') {
      points = reviewsCount
      totalSpent = user.reviews.reduce((sum, review) => sum + (review.rating * 100), 0)
    }

    // Determine tier
    const userTier = await getUserTier(user.loyaltyPoints, user.totalSpent)

    // Calculate rank change
    const rankChange = previousUserRank - baseRank

    entries.push({
      userId: user.id,
      rank: baseRank,
      name: `${user.firstName} ${user.lastName.charAt(0)}.`, // Partial name for privacy
      avatar: user.avatar,
      points,
      totalSpent,
      bookingsCount,
      reviewsCount,
      tier: userTier?.name || 'BRONZE',
      region: user.city || user.state,
      change: rankChange,
    })
  }

  // Add current user if not in results
  if (currentUserRank && !entries.find(e => e.userId === currentUserId)) {
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
            status: 'COMPLETED',
          },
          select: { id: true },
        },
        reviews: {
          where: {
            createdAt: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
          select: { id: true, rating: true },
        },
      },
    })

    if (currentUser) {
      let points = 0
      if (category === 'points') points = currentUser.loyaltyPoints
      else if (category === 'spending') points = currentUser.totalSpent
      else if (category === 'bookings') points = currentUser.bookings.length
      else if (category === 'reviews') points = currentUser.reviews.length

      const userTier = await getUserTier(currentUser.loyaltyPoints, currentUser.totalSpent)
      const rankChange = previousUserRank - currentUserRank

      entries.push({
        userId: currentUser.id,
        rank: currentUserRank,
        name: `${currentUser.firstName} ${currentUser.lastName.charAt(0)}.`,
        avatar: currentUser.avatar,
        points,
        totalSpent: currentUser.totalSpent,
        bookingsCount: currentUser.bookings.length,
        reviewsCount: currentUser.reviews.length,
        tier: userTier?.name || 'BRONZE',
        region: currentUser.city || currentUser.state,
        change: rankChange,
      })
    }
  }

  // Sort entries by rank
  entries.sort((a, b) => a.rank - b.rank)

  const pagination = {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    hasNext: page < Math.ceil(totalCount / limit),
    hasPrev: page > 1,
  }

  // Calculate stats for current user
  const currentUserStats = entries.find(e => e.userId === currentUserId)

  return {
    entries,
    pagination,
    currentUser: currentUserStats,
    leaderboardConfig: {
      period: query.period,
      category: query.category,
      region: query.region,
      tier: query.tier,
      NigerianRegions: NIGERIAN_REGIONS,
      currency: 'NGN',
      updatedAt: new Date(),
    },
    competition: {
      totalParticipants: totalCount,
      yourRank: currentUserRank,
      topThree: entries.slice(0, 3),
      nearestCompetitors: entries.slice(Math.max(0, (currentUserStats?.rank || 1) - 3), (currentUserStats?.rank || 1) + 2),
    },
  }
}

// Helper functions
function calculateDateRange(period: string): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now)

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      const dayOfWeek = start.getDay()
      start.setDate(start.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'yearly':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'all_time':
      start.setFullYear(2020) // Assume platform started in 2020
      break
  }

  return { start, end: now }
}

function getPreviousPeriodRange(period: string): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date()
  const start = new Date()

  switch (period) {
    case 'daily':
      end.setDate(end.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      start.setDate(start.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'weekly':
      const dayOfWeek = start.getDay()
      end.setDate(end.getDate() - dayOfWeek - 7)
      end.setHours(23, 59, 59, 999)
      start.setDate(start.getDate() - dayOfWeek - 7)
      start.setHours(0, 0, 0, 0)
      break
    case 'monthly':
      end.setMonth(end.getMonth() - 1, 0)
      end.setHours(23, 59, 59, 999)
      start.setMonth(start.getMonth() - 1, 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'yearly':
      end.setFullYear(end.getFullYear() - 1, 11, 31)
      end.setHours(23, 59, 59, 999)
      start.setFullYear(start.getFullYear() - 1, 0, 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'all_time':
      // For all-time, previous period doesn't make sense
      return { start: new Date(2020, 0, 1), end: new Date(2020, 0, 1) }
  }

  return { start, end }
}

function getOrderByClause(category: string) {
  switch (category) {
    case 'points':
      return { loyaltyPoints: 'desc' }
    case 'spending':
      return { totalSpent: 'desc' }
    case 'bookings':
      return { createdAt: 'desc' } // This won't work as expected, we'll need a subquery
    case 'reviews':
      return { createdAt: 'desc' } // This won't work as expected, we'll need a subquery
    default:
      return { loyaltyPoints: 'desc' }
  }
}

async function getUserRank(userId: string, category: string, dateRange: any, whereClause: any, tierWhereClause: any): Promise<number | null> {
  // This is a simplified rank calculation
  // In a real implementation, you'd want to use window functions for better performance
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return null

  let userValue = 0
  if (category === 'points') userValue = user.loyaltyPoints
  else if (category === 'spending') userValue = user.totalSpent
  else userValue = user.loyaltyPoints // Fallback

  const count = await prisma.user.count({
    where: {
      ...whereClause,
      ...tierWhereClause,
    },
  })

  return Math.floor(count / 2) + 1 // Approximate rank for demo
}

async function getTierRequirements(tierName: string) {
  const tier = await prisma.loyaltyTier.findUnique({
    where: { name: tierName as any },
  })
  return tier
}

async function getUserTier(points: number, spend: number) {
  const tiers = await prisma.loyaltyTier.findMany({
    where: { isActive: true },
    orderBy: { minPoints: 'desc' },
  })

  return tiers.find(tier => 
    points >= tier.minPoints || spend >= tier.minSpend
  )
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
