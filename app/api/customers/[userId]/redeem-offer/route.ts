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

const RedeemOfferSchema = z.object({
  offerId: z.string(),
  bookingId: z.string().optional()
})

// POST /api/customers/[userId]/redeem-offer - Redeem a VIP offer
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only redeem offers for themselves
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const body = await request.json()
    const validation = RedeemOfferSchema.parse(body)

    // Mock redemption logic - in real implementation, validate offer and process redemption
    const offer = await getOfferById(validation.offerId)
    
    if (!offer) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }

    // Check if offer is still available
    if (offer.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Offer is no longer available' }, { status: 400 })
    }

    if (offer.availability.currentUsage >= offer.availability.maxUsage) {
      return NextResponse.json({ error: 'Offer has been fully redeemed' }, { status: 400 })
    }

    // Check if customer meets VIP tier requirement
    const customerVIPTier = session.user.vipTier || 'BRONZE_VIP'
    if (!isVIPTierEligible(customerVIPTier, offer.vipTier)) {
      return NextResponse.json({ error: 'VIP tier not eligible for this offer' }, { status: 400 })
    }

    // Check if customer has sufficient loyalty points (if required)
    // In a real implementation, check booking requirements and payment methods

    // Process the redemption
    const redemption = {
      redemptionId: 'redemption-' + Date.now(),
      userId,
      offerId: validation.offerId,
      partnerId: offer.partnerId,
      discount: offer.discount,
      bookingId: validation.bookingId,
      redeemedAt: new Date(),
      status: 'SUCCESS',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    }

    // Update offer usage (mock)
    // In real implementation, update in database

    return NextResponse.json({
      message: 'Offer redeemed successfully',
      redemption,
      offer: {
        id: offer.id,
        title: offer.title,
        discount: offer.discount
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error redeeming offer:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to redeem offer' },
      { status: 500 }
    )
  }
}

// Helper function to get offer by ID (mock implementation)
async function getOfferById(offerId: string) {
  // Mock offer data
  const offers = [
    {
      id: 'offer-1',
      partnerId: 'gtbank',
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
      partnerId: 'mtn',
      title: 'Free Data Bundle',
      description: 'Get free 1GB data bundle with any booking',
      vipTier: 'SILVER_VIP',
      discount: {
        type: 'FIXED_AMOUNT',
        value: 1000
      },
      bookingRequirement: 5000,
      availability: {
        days: [0, 1, 2, 3, 4, 5, 6],
        timeSlots: ['09:00-22:00'],
        locations: ['Lagos'],
        maxUsage: 200,
        currentUsage: 75
      },
      status: 'ACTIVE',
      usage: {
        totalClaimed: 120,
        totalRedeemed: 75,
        averageRating: 4.2,
        customerSatisfaction: 0.85
      }
    }
  ]

  return offers.find(offer => offer.id === offerId)
}

// Helper function to check VIP tier eligibility
function isVIPTierEligible(customerTier: string, requiredTier: string): boolean {
  const tierHierarchy = {
    'BRONZE_VIP': 1,
    'SILVER_VIP': 2,
    'GOLD_VIP': 3,
    'PLATINUM_VIP': 4,
    'DIAMOND_VIP': 5,
    'BLACK_CARD': 6
  }

  const customerLevel = tierHierarchy[customerTier as keyof typeof tierHierarchy] || 0
  const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0

  return customerLevel >= requiredLevel
}