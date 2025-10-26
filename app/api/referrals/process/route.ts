import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import { referralService } from '@/lib/referral';
import { logger } from '@/lib/logger';

// Process referral endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, metadata } = body;

    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // For this endpoint, we need the new user ID from authentication
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const newUserId = authResult.user!.userId;
    const result = await referralService.processReferral(referralCode, newUserId, metadata);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          message: result.message,
          pointsAwarded: result.pointsAwarded,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 400 });
    }

  } catch (error) {
    logger.error('Failed to process referral:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get referral stats endpoint
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = authResult.user!.userId;
    const stats = await referralService.getUserReferralStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Failed to get referral stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
