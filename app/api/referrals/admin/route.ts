import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import { referralService } from '@/lib/referral';
import { logger } from '@/lib/logger';

// Get global referral stats endpoint (admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated || authResult.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const stats = await referralService.getGlobalReferralStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Failed to get global referral stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup expired referral codes endpoint (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated || authResult.user!.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const cleanedCount = await referralService.cleanupExpiredCodes();

    return NextResponse.json({
      success: true,
      data: { cleanedCount },
      message: `Cleaned up ${cleanedCount} expired referral codes`,
    });

  } catch (error) {
    logger.error('Failed to cleanup referral codes:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
