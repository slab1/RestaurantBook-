import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateToken } from '@/lib/middleware';
import { abTestingService } from '@/lib/ab-testing';
import { logger } from '@/lib/logger';

// Social share tracking API
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    
    if (!authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platform, bookingId, restaurantId, shareType, metadata } = body;

    // Validate required fields
    if (!platform || !shareType) {
      return NextResponse.json(
        { success: false, error: 'Platform and shareType are required' },
        { status: 400 }
      );
    }

    const userId = authResult.user!.userId;

    // Store social share event
    await prisma.socialShare.create({
      data: {
        userId,
        platform: platform.toUpperCase(),
        shareType,
        bookingId,
        restaurantId,
        metadata: metadata || {},
        sharedAt: new Date(),
      },
    });

    // Award referral points for social shares (if eligible)
    await awardSocialSharePoints(userId, platform);

    // Track in user interactions for analytics
    await prisma.userInteraction.create({
      data: {
        userId,
        type: 'SOCIAL_SHARE',
        metadata: {
          platform,
          shareType,
          bookingId,
          restaurantId,
        },
      },
    });

    // Update user statistics
    await updateUserShareStats(userId, platform);

    logger.info('Social share recorded', {
      userId,
      platform,
      shareType,
      bookingId,
    });

    return NextResponse.json({
      success: true,
      message: 'Social share recorded successfully',
      data: {
        pointsAwarded: await getSharePoints(platform),
        totalShares: await getUserTotalShares(userId),
      },
    });

  } catch (error) {
    logger.error('Failed to record social share:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get social share statistics
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

    // Get social share statistics
    const stats = await getSocialShareStats(userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    logger.error('Failed to get social share stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
async function awardSocialSharePoints(userId: string, platform: string): Promise<void> {
  const pointsConfig = {
    FACEBOOK: 5,
    TWITTER: 5,
    INSTAGRAM: 5,
    WHATSAPP: 3,
    EMAIL: 3,
    LINKEDIN: 5,
    TIKTOK: 10,
    OTHER: 1,
  };

  const points = pointsConfig[platform.toUpperCase()] || 1;

  // Update user loyalty points
  await prisma.user.update({
    where: { id: userId },
    data: {
      loyaltyPoints: { increment: points },
    },
  });

  // Record loyalty transaction
  await prisma.loyaltyTransaction.create({
    data: {
      userId,
      type: 'EARNED',
      points,
      description: `Social share on ${platform}`,
      source: 'SOCIAL_SHARE',
    },
  });
}

async function getSharePoints(platform: string): Promise<number> {
  const pointsConfig = {
    FACEBOOK: 5,
    TWITTER: 5,
    INSTAGRAM: 5,
    WHATSAPP: 3,
    EMAIL: 3,
    LINKEDIN: 5,
    TIKTOK: 10,
    OTHER: 1,
  };

  return pointsConfig[platform.toUpperCase()] || 1;
}

async function getUserTotalShares(userId: string): Promise<number> {
  const count = await prisma.socialShare.count({
    where: { userId },
  });

  return count;
}

async function updateUserShareStats(userId: string, platform: string): Promise<void> {
  // Update or create social stats record
  await prisma.socialShareStat.upsert({
    where: {
      userId_platform: {
        userId,
        platform: platform.toUpperCase(),
      },
    },
    update: {
      shareCount: { increment: 1 },
      lastSharedAt: new Date(),
    },
    create: {
      userId,
      platform: platform.toUpperCase(),
      shareCount: 1,
      lastSharedAt: new Date(),
    },
  });
}

async function getSocialShareStats(userId: string) {
  // Get platform-wise share counts
  const platformStats = await prisma.socialShareStat.findMany({
    where: { userId },
    orderBy: { shareCount: 'desc' },
  });

  // Get recent shares
  const recentShares = await prisma.socialShare.findMany({
    where: { userId },
    include: {
      booking: {
        select: {
          id: true,
          confirmationCode: true,
          restaurant: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { sharedAt: 'desc' },
    take: 10,
  });

  // Calculate total points earned from shares
  const totalPoints = await prisma.loyaltyTransaction.aggregate({
    where: {
      userId,
      source: 'SOCIAL_SHARE',
    },
    _sum: {
      points: true,
    },
  });

  return {
    platformStats,
    recentShares,
    totalShares: platformStats.reduce((sum, stat) => sum + stat.shareCount, 0),
    totalPointsEarned: totalPoints._sum.points || 0,
    shareRank: await getUserShareRank(userId),
  };
}

async function getUserShareRank(userId: string): Promise<number> {
  const userShares = await prisma.socialShare.count({
    where: { userId },
  });

  const higherRankedUsers = await prisma.socialShare.count({
    where: {
      userId: { not: userId },
    },
    distinct: ['userId'],
  });

  // This is a simplified ranking - in production you'd want a more sophisticated system
  return higherRankedUsers + 1;
}
