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

const CreateVIPOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  vipTier: z.string(),
  discount: z.object({
    type: z.string(),
    value: z.number().positive(),
    maxDiscount: z.number().optional(),
    minPurchase: z.number().optional()
  }),
  bookingRequirement: z.number().positive(),
  availability: z.object({
    days: z.array(z.number().min(0).max(6)),
    timeSlots: z.array(z.string()),
    locations: z.array(z.string()),
    maxUsage: z.number().positive()
  })
})

// GET /api/partners/[partnerId]/vip-offers - Get partner VIP offers
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params

    // Mock VIP offers data - in real implementation, fetch from database
    const mockOffers = [
      {
        id: 'offer-1',
        partnerId,
        title: '20% Off for Diamond VIPs',
        description: 'Exclusive 20% discount on all bookings for Diamond VIP members',
        vipTier: 'DIAMOND_VIP',
        discount: {
          type: 'PERCENTAGE',
          value: 20,
          maxDiscount: 5000
        },
        bookingRequirement: 10000,
        availability: {
          days: [0, 1, 2, 3, 4, 5, 6],
          timeSlots: ['12:00-14:00', '18:00-21:00'],
          locations: ['Lagos', 'Abuja', 'Port Harcourt'],
          maxUsage: 100,
          currentUsage: 25
        },
        partnerShare: {
          partnerShare: 0.8,
          platformShare: 0.2,
          calculate: () => ({
            partnerAmount: 4000,
            platformAmount: 1000,
            total: 5000
          })
        },
        status: 'ACTIVE',
        usage: {
          totalClaimed: 50,
          totalRedeemed: 25,
          averageRating: 4.5,
          customerSatisfaction: 0.9
        }
      },
      {
        id: 'offer-2',
        partnerId,
        title: 'Free Upgrade for Gold VIPs',
        description: 'Complimentary table upgrade for Gold VIP members',
        vipTier: 'GOLD_VIP',
        discount: {
          type: 'FIXED_AMOUNT',
          value: 2000
        },
        bookingRequirement: 5000,
        availability: {
          days: [0, 5, 6],
          timeSlots: ['18:00-21:00'],
          locations: ['Lagos'],
          maxUsage: 50,
          currentUsage: 15
        },
        partnerShare: {
          partnerShare: 0.75,
          platformShare: 0.25,
          calculate: () => ({
            partnerAmount: 1500,
            platformAmount: 500,
            total: 2000
          })
        },
        status: 'ACTIVE',
        usage: {
          totalClaimed: 30,
          totalRedeemed: 15,
          averageRating: 4.8,
          customerSatisfaction: 0.95
        }
      }
    ]

    return NextResponse.json({
      offers: mockOffers,
      count: mockOffers.length
    })
  } catch (error) {
    console.error('Error fetching VIP offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VIP offers' },
      { status: 500 }
    )
  }
}

// POST /api/partners/[partnerId]/vip-offers - Create new VIP offer
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER', 'PARTNER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params
    const body = await request.json()
    const validation = CreateVIPOfferSchema.parse(body)

    // If user is a partner, ensure they can only create offers for themselves
    if (session.user.role === 'PARTNER' && session.user.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const offerData = {
      ...validation,
      partnerId
    }

    // Mock creation - in real implementation, use partnerIntegrationService.createVIPOffer
    const newOffer = {
      id: 'offer-' + Date.now(),
      ...offerData,
      partnerShare: {
        partnerShare: 0.8,
        platformShare: 0.2,
        calculate: () => ({
          partnerAmount: validation.discount.value * 0.8,
          platformAmount: validation.discount.value * 0.2,
          total: validation.discount.value
        })
      },
      status: 'ACTIVE',
      usage: {
        totalClaimed: 0,
        totalRedeemed: 0,
        averageRating: 0,
        customerSatisfaction: 0
      }
    }

    return NextResponse.json({
      message: 'VIP offer created successfully',
      offer: newOffer
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating VIP offer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create VIP offer' },
      { status: 500 }
    )
  }
}