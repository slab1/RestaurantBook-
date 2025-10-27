import { NextRequest, NextResponse } from 'next/server'
import { 
  NIGERIAN_BANKS, 
  NIGERIAN_TELECOMS, 
  NIGERIAN_RETAIL, 
  NIGERIAN_ENTERTAINMENT 
} from '@/lib/partner-integration'

// GET /api/partners/available - Get all available partners for integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const tier = searchParams.get('tier')

    // Combine all Nigerian partners
    const allPartners = [
      ...NIGERIAN_BANKS,
      ...NIGERIAN_TELECOMS,
      ...NIGERIAN_RETAIL,
      ...NIGERIAN_ENTERTAINMENT
    ]

    let filteredPartners = allPartners

    // Filter by type if specified
    if (type) {
      filteredPartners = filteredPartners.filter(partner => 
        partner.type.toLowerCase() === type.toLowerCase()
      )
    }

    // Filter by tier (based on commission rate) if specified
    if (tier) {
      const tierThresholds = {
        bronze: { min: 0.05, max: 0.06 },
        silver: { min: 0.04, max: 0.05 },
        gold: { min: 0.035, max: 0.04 },
        platinum: { min: 0.03, max: 0.035 },
        diamond: { min: 0, max: 0.03 }
      }

      const threshold = tierThresholds[tier as keyof typeof tierThresholds]
      if (threshold) {
        filteredPartners = filteredPartners.filter(partner => 
          partner.partnershipTerms.commission >= threshold.min && 
          partner.partnershipTerms.commission < threshold.max
        )
      }
    }

    // Sort by partnership terms (commission rate descending)
    filteredPartners.sort((a, b) => b.partnershipTerms.commission - a.partnershipTerms.commission)

    return NextResponse.json({
      partners: filteredPartners,
      total: filteredPartners.length,
      categories: {
        banks: NIGERIAN_BANKS.length,
        telecoms: NIGERIAN_TELECOMS.length,
        retail: NIGERIAN_RETAIL.length,
        entertainment: NIGERIAN_ENTERTAINMENT.length
      }
    })
  } catch (error) {
    console.error('Error fetching available partners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available partners' },
      { status: 500 }
    )
  }
}