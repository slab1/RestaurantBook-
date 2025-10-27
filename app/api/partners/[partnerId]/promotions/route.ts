import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

interface RouteParams {
  params: {
    partnerId: string
  }
}

const CreatePromotionSchema = z.object({
  secondaryPartnerId: z.string(),
  promotionType: z.string(),
  title: z.string().min(1),
  description: z.string().min(1),
  discount: z.object({
    type: z.string(),
    value: z.number().positive(),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional()
  }),
  validityPeriod: z.object({
    startDate: z.string().transform(str => new Date(str)),
    endDate: z.string().transform(str => new Date(str)),
    timezone: z.string()
  }),
  targetAudience: z.object({
    customerSegment: z.array(z.string()),
    vipTiers: z.array(z.string()),
    geographicScope: z.array(z.string())
  })
})

// GET /api/partners/[partnerId]/promotions - Get partner promotions
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params

    // Get active promotions for the partner
    const promotions = await partnerIntegrationService.getActivePromotions(partnerId)

    return NextResponse.json({
      promotions,
      count: promotions.length
    })
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    )
  }
}

// POST /api/partners/[partnerId]/promotions - Create new promotion
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER', 'PARTNER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params
    const body = await request.json()
    const validation = CreatePromotionSchema.parse(body)

    // If user is a partner, ensure they can only create promotions for themselves
    if (session.user.role === 'PARTNER' && session.user.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const promotionData = {
      ...validation,
      primaryPartnerId: partnerId,
      status: 'ACTIVE' as const
    }

    const promotion = await partnerIntegrationService.createCrossPromotion(promotionData)

    return NextResponse.json({
      message: 'Cross-promotion created successfully',
      promotion
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    )
  }
}