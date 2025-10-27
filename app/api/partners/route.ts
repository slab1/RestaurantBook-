import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// GET /api/partners - Get all partners
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const tier = searchParams.get('tier')
    const status = searchParams.get('status')

    // Mock partners data - in real implementation, fetch from database
    const allPartners = [
      ...NIGERIAN_BANKS,
      ...NIGERIAN_TELECOMS,
      ...NIGERIAN_RETAIL,
      ...NIGERIAN_ENTERTAINMENT
    ]

    let filteredPartners = allPartners

    if (type) {
      filteredPartners = filteredPartners.filter(p => p.type === type)
    }
    if (tier) {
      filteredPartners = filteredPartners.filter(p => 
        p.partnershipTerms.commission >= getTierThreshold(tier)
      )
    }
    if (status) {
      // Filter by status if needed
    }

    return NextResponse.json({
      partners: filteredPartners,
      total: filteredPartners.length
    })
  } catch (error) {
    console.error('Error fetching partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    )
  }
}

// POST /api/partners - Create new partner
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = PartnerOnboardingSchema.parse(body)

    const partnerId = await partnerIntegrationService.initiateOnboarding(validation)

    return NextResponse.json({
      partnerId,
      message: 'Partner onboarding initiated successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating partner:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create partner' },
      { status: 500 }
    )
  }
}

// Helper function to get tier threshold
function getTierThreshold(tier: string): number {
  const thresholds = {
    bronze: 0.05,
    silver: 0.04,
    gold: 0.035,
    platinum: 0.03,
    diamond: 0.025
  }
  return thresholds[tier as keyof typeof thresholds] || 0.05
}

// Import Nigerian partners data
import { 
  NIGERIAN_BANKS, 
  NIGERIAN_TELECOMS, 
  NIGERIAN_RETAIL, 
  NIGERIAN_ENTERTAINMENT,
  PartnerOnboardingSchema
} from '@/lib/partner-integration'