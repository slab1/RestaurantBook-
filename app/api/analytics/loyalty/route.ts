import { NextRequest, NextResponse } from 'next/server';
import { createLoyaltyAnalytics } from '@/lib/loyalty-analytics';
import { subDays } from 'date-fns';

// GET /api/analytics/loyalty
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const restaurantId = searchParams.get('restaurantId') || undefined;
    const state = searchParams.get('state') || undefined;
    const language = searchParams.get('language') || undefined;
    
    // Calculate date range
    const endDate = new Date();
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const startDate = subDays(endDate, days);
    
    // Create analytics instance
    const analytics = createLoyaltyAnalytics({
      dateRange: { start: startDate, end: endDate },
      restaurantId,
      state: state as any,
      language: language as any
    });
    
    // Generate comprehensive analytics
    const analyticsData = await analytics.generateComprehensiveAnalytics();
    
    // Also get summary for quick dashboard widgets
    const { getLoyaltyAnalyticsSummary } = await import('@/lib/loyalty-analytics');
    const summaryData = await getLoyaltyAnalyticsSummary(
      { start: startDate, end: endDate },
      restaurantId
    );
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      summary: summaryData,
      metadata: {
        period,
        dateRange: { start: startDate.toISOString(), end: endDate.toISOString() },
        restaurantId,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error generating loyalty analytics:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate analytics'
      }
    }, { status: 500 });
  }
}

// POST /api/analytics/loyalty/summary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dateRange, restaurantId, state, language, includeComparison } = body;
    
    // Create analytics instance with custom config
    const analytics = createLoyaltyAnalytics({
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      },
      restaurantId,
      state,
      language
    });
    
    // Get specific analytics based on request
    if (body.metric === 'program') {
      const programMetrics = await analytics.calculateProgramPerformanceMetrics();
      return NextResponse.json({
        success: true,
        data: programMetrics
      });
    }
    
    if (body.metric === 'engagement') {
      const engagement = await analytics.calculateUserEngagementTracking();
      return NextResponse.json({
        success: true,
        data: engagement
      });
    }
    
    if (body.metric === 'tiers') {
      const tiers = await analytics.calculateTierDistributionAnalytics();
      return NextResponse.json({
        success: true,
        data: tiers
      });
    }
    
    if (body.metric === 'points') {
      const points = await analytics.calculatePointsFlowAnalysis();
      return NextResponse.json({
        success: true,
        data: points
      });
    }
    
    if (body.metric === 'roi') {
      const roi = await analytics.calculateROICalculations();
      return NextResponse.json({
        success: true,
        data: roi
      });
    }
    
    if (body.metric === 'nigerian-market') {
      const nigerianMarket = await analytics.calculateNigerianMarketInsights();
      return NextResponse.json({
        success: true,
        data: nigerianMarket
      });
    }
    
    // Default: return full analytics
    const analyticsData = await analytics.generateComprehensiveAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analyticsData
    });
    
  } catch (error) {
    console.error('Error in loyalty analytics POST:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'ANALYTICS_REQUEST_ERROR',
        message: error instanceof Error ? error.message : 'Failed to process analytics request'
      }
    }, { status: 500 });
  }
}