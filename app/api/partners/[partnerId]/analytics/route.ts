import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AnalyticsPeriod } from '@/lib/partner-integration'

interface RouteParams {
  params: {
    partnerId: string
  }
}

// GET /api/partners/[partnerId]/analytics - Get partner analytics
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') as AnalyticsPeriod || AnalyticsPeriod.MONTHLY

    // Verify access - partner can only view their own analytics
    if (session.user.role === 'PARTNER' && session.user.partnerId !== partnerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const analytics = await partnerIntegrationService.getMerchantAnalytics(partnerId, period)

    return NextResponse.json({
      analytics,
      period,
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

import { AnalyticsPeriod } from '@/lib/partner-integration'