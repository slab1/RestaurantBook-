import { NextRequest, NextResponse } from 'next/server'
import { partnerIntegrationService } from '@/lib/partner-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    partnerId: string
  }
}

// GET /api/partners/[partnerId] - Get specific partner details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params

    // Mock partner data - in real implementation, fetch from database
    const allPartners = [
      ...NIGERIAN_BANKS,
      ...NIGERIAN_TELECOMS,
      ...NIGERIAN_RETAIL,
      ...NIGERIAN_ENTERTAINMENT
    ]

    const partner = allPartners.find(p => p.id === partnerId)

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    return NextResponse.json({ partner })
  } catch (error) {
    console.error('Error fetching partner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch partner details' },
      { status: 500 }
    )
  }
}

// PUT /api/partners/[partnerId] - Update partner
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params
    const body = await request.json()

    // Mock update - in real implementation, update in database
    return NextResponse.json({
      message: 'Partner updated successfully',
      partnerId,
      updatedData: body
    })
  } catch (error) {
    console.error('Error updating partner:', error)
    return NextResponse.json(
      { error: 'Failed to update partner' },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[partnerId] - Delete partner
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params

    // Mock delete - in real implementation, delete from database
    return NextResponse.json({
      message: 'Partner deleted successfully',
      partnerId
    })
  } catch (error) {
    console.error('Error deleting partner:', error)
    return NextResponse.json(
      { error: 'Failed to delete partner' },
      { status: 500 }
    )
  }
}

// POST /api/partners/[partnerId]/approve - Approve partner onboarding
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'PARTNER_MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = params
    const body = await request.json()
    const { notes } = body

    const success = await partnerIntegrationService.approveOnboarding(
      partnerId,
      session.user.id,
      notes
    )

    if (success) {
      return NextResponse.json({
        message: 'Partner approved successfully',
        partnerId
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to approve partner' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error approving partner:', error)
    return NextResponse.json(
      { error: 'Failed to approve partner' },
      { status: 500 }
    )
  }
}

import { NIGERIAN_BANKS, NIGERIAN_TELECOMS, NIGERIAN_RETAIL, NIGERIAN_ENTERTAINMENT } from '@/lib/partner-integration'