/**
 * Rate Limit Monitoring API
 * 
 * GET /api/admin/rate-limits - Get all rate limit usage
 * GET /api/admin/rate-limits/warnings - Get services approaching limits
 */

import { NextResponse } from 'next/server'
import { rateLimiter } from '@/lib/rate-limiter'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view')

    if (view === 'warnings') {
      const threshold = parseInt(searchParams.get('threshold') || '80', 10)
      const warnings = await rateLimiter.getWarnings(threshold)
      
      return NextResponse.json({
        warnings,
        count: warnings.length,
      })
    }

    // Default: return all usage
    const allUsage = await rateLimiter.getAllUsage()
    
    // Calculate summary statistics
    const summary = {
      totalServices: Object.keys(allUsage).length,
      warningCount: 0,
      criticalCount: 0,
    }

    for (const actions of Object.values(allUsage)) {
      for (const usage of Object.values(actions) as any[]) {
        if (usage.percentage >= 90) summary.criticalCount++
        else if (usage.percentage >= 80) summary.warningCount++
      }
    }

    return NextResponse.json({
      usage: allUsage,
      summary,
    })
  } catch (error) {
    console.error('Error fetching rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rate limit data' },
      { status: 500 }
    )
  }
}
