import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

interface RouteParams {
  params: {
    userId: string
  }
}

const EarnPointsSchema = z.object({
  partnerId: z.string(),
  points: z.number().positive(),
  bookingId: z.string().optional(),
  description: z.string().optional()
})

const RedeemPointsSchema = z.object({
  partnerId: z.string(),
  points: z.number().positive(),
  description: z.string().optional()
})

// GET /api/customers/[userId]/loyalty - Get customer loyalty points
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only access their own loyalty data
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params

    // Mock loyalty system data - in real implementation, fetch from database
    const loyaltySystem = {
      id: 'loyalty-' + userId,
      userId,
      partnerId: 'platform', // Platform loyalty
      points: 2450,
      tier: 'GOLD',
      transactions: [
        {
          id: 'txn-1',
          type: 'EARN',
          points: 100,
          description: 'Booking at Spice Garden',
          partnerId: 'spice-garden',
          bookingId: 'booking-123',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          metadata: {}
        },
        {
          id: 'txn-2',
          type: 'EARN',
          points: 150,
          description: 'MTN Cross-promotion bonus',
          partnerId: 'mtn',
          timestamp: new Date('2024-01-14T15:45:00Z'),
          metadata: {}
        },
        {
          id: 'txn-3',
          type: 'REDEEM',
          points: -500,
          description: 'Redeemed for VIP offer',
          partnerId: 'dstv',
          timestamp: new Date('2024-01-13T12:00:00Z'),
          metadata: {}
        }
      ],
      lastTransaction: new Date('2024-01-15T10:30:00Z'),
      expiryDate: new Date('2025-01-15T10:30:00Z'),
      multiplierRate: 1.5
    }

    return NextResponse.json({
      loyaltySystem,
      totalPoints: loyaltySystem.points,
      tier: loyaltySystem.tier,
      nextTierProgress: ((loyaltySystem.points % 1000) / 1000) * 100 // Progress to next tier
    })
  } catch (error) {
    console.error('Error fetching loyalty points:', error)
    return NextResponse.json(
      { error: 'Failed to fetch loyalty points' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[userId]/loyalty/earn - Earn loyalty points
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only earn points for themselves
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const body = await request.json()
    const validation = EarnPointsSchema.parse(body)

    const updatedLoyalty = await partnerIntegrationService.earnLoyaltyPoints(
      userId,
      validation.partnerId,
      validation.points,
      validation.bookingId,
      validation.description
    )

    return NextResponse.json({
      message: 'Points earned successfully',
      loyaltySystem: updatedLoyalty,
      pointsEarned: validation.points
    }, { status: 201 })
  } catch (error) {
    console.error('Error earning points:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to earn points' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[userId]/loyalty/redeem - Redeem loyalty points
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only redeem points for themselves
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const body = await request.json()
    const validation = RedeemPointsSchema.parse(body)

    const success = await partnerIntegrationService.redeemLoyaltyPoints(
      userId,
      validation.partnerId,
      validation.points,
      validation.description
    )

    if (success) {
      return NextResponse.json({
        message: 'Points redeemed successfully',
        pointsRedeemed: validation.points
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to redeem points' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error redeeming points:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to redeem points' },
      { status: 500 }
    )
  }
}