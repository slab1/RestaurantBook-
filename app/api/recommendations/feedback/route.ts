import { NextRequest, NextResponse } from 'next/server';
import { mlRecommendationEngine } from '@/lib/ml-recommendation-engine';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      restaurantId,
      feedbackType,
      action,
      rating,
      recommendationId,
      context,
    } = body;

    // Validation
    if (!userId || !restaurantId || !feedbackType || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, restaurantId, feedbackType, action',
        },
        { status: 400 }
      );
    }

    if (!['positive', 'negative', 'neutral'].includes(feedbackType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid feedbackType. Must be: positive, negative, or neutral',
        },
        { status: 400 }
      );
    }

    logger.info('Recommendation feedback received', {
      userId,
      restaurantId,
      feedbackType,
      action,
    });

    // Track the feedback
    await mlRecommendationEngine.trackRecommendationFeedback(
      userId,
      restaurantId,
      feedbackType as 'positive' | 'negative' | 'neutral',
      action,
      rating
    );

    // If there's a recommendation log ID, update it with the feedback
    if (recommendationId) {
      const { prisma } = await import('@/lib/prisma');
      await prisma.recommendationLog.update({
        where: { id: recommendationId },
        data: {
          userInteraction: action,
          interactionTime: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      data: {
        userId,
        restaurantId,
        feedbackType,
        action,
      },
    });
  } catch (error) {
    logger.error('Error in recommendation feedback API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record feedback',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Get user's feedback history
    const { prisma } = await import('@/lib/prisma');
    const feedbackHistory = await prisma.recommendationFeedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Aggregate statistics
    const stats = {
      total: feedbackHistory.length,
      positive: feedbackHistory.filter(f => f.feedbackType === 'positive').length,
      negative: feedbackHistory.filter(f => f.feedbackType === 'negative').length,
      neutral: feedbackHistory.filter(f => f.feedbackType === 'neutral').length,
      actions: {
        clicked: feedbackHistory.filter(f => f.action === 'clicked').length,
        booked: feedbackHistory.filter(f => f.action === 'booked').length,
        reviewed: feedbackHistory.filter(f => f.action === 'reviewed').length,
        dismissed: feedbackHistory.filter(f => f.action === 'dismissed').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: feedbackHistory,
      stats,
    });
  } catch (error) {
    logger.error('Error getting feedback history', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get feedback history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
