/**
 * Feature Status API Endpoint
 * 
 * Returns current feature flag status for admin dashboard
 * GET /api/admin/features/status
 */

import { NextResponse } from 'next/server'
import {
  getFeatureStatus,
  isProductionReady,
  checkFeatureCompatibility,
  getFeatureRecommendations,
} from '@/lib/feature-flags'

export async function GET() {
  try {
    const status = getFeatureStatus()
    const productionReady = isProductionReady()
    const compatibility = checkFeatureCompatibility()
    const recommendations = getFeatureRecommendations()

    return NextResponse.json({
      status,
      productionReady,
      compatibility,
      recommendations,
    })
  } catch (error) {
    console.error('Error fetching feature status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature status' },
      { status: 500 }
    )
  }
}
