import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import { referralService } from '@/lib/referral';
import { logger } from '@/lib/logger';

// Generate referral code endpoint
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = authResult.user!.userId;
    const referralCode = await referralService.generateReferralCode(userId);

    return NextResponse.json({
      success: true,
      data: { referralCode },
      message: 'Referral code generated successfully',
    });

  } catch (error) {
    logger.error('Failed to generate referral code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validate referral code endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Referral code is required' },
        { status: 400 }
      );
    }

    const validation = await referralService.validateReferralCode(code);

    return NextResponse.json({
      success: true,
      data: validation,
    });

  } catch (error) {
    logger.error('Failed to validate referral code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
