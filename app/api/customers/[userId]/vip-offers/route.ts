import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { VIPTier } from '@/lib/partner-integration'

interface RouteParams {
  params: {
    userId: string
  }
}

// GET /api/customers/[userId]/vip-offers - Get VIP offers for customer
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Users can only access their own offers
    if (session.user.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId } = params
    const { searchParams } = new URL(request.url)
    const vipTier = searchParams.get('tier') as VIPTier

    if (!vipTier) {
      return NextResponse.json({ error: 'VIP tier is required' }, { status: 400 })
    }

    // Get VIP offers for customer's tier
    const offers = await partnerIntegrationService.getVIPOffersForCustomer(userId, vipTier)

    return NextResponse.json({
      offers,
      vipTier,
      count: offers.length
    })
  } catch (error) {
    console.error('Error fetching VIP offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VIP offers' },
      { status: 500 }
    )
  }
}