import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location') || 'all';
    const timeWindow = searchParams.get('timeWindow') || 'weekly';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    logger.info('Trending restaurants request', { location, timeWindow, limit });

    // Calculate trending score based on recent activity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Determine date range based on time window
    let dateFilter: Date;
    switch (timeWindow) {
      case 'daily':
        dateFilter = oneDayAgo;
        break;
      case 'weekly':
        dateFilter = sevenDaysAgo;
        break;
      case 'monthly':
        dateFilter = thirtyDaysAgo;
        break;
      default:
        dateFilter = sevenDaysAgo;
    }

    // Get restaurants with most activity in the time window
    const trendingData = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        isVerified: true,
        ...(location !== 'all' ? { city: location } : {}),
      },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                createdAt: { gte: dateFilter },
                status: { in: ['CONFIRMED', 'COMPLETED'] },
              },
            },
            reviews: {
              where: {
                createdAt: { gte: dateFilter },
              },
            },
          },
        },
        reviews: {
          where: { createdAt: { gte: dateFilter } },
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Calculate trend scores
    const trendingRestaurants = trendingData
      .map(restaurant => {
        const bookingCount = restaurant._count.bookings;
        const reviewCount = restaurant._count.reviews;
        
        // Trend score formula: weighted combination of bookings, reviews, and rating
        const trendScore = (
          bookingCount * 10 +
          reviewCount * 5 +
          restaurant.rating * 15
        );

        return {
          restaurantId: restaurant.id,
          score: trendScore,
          confidence: 0.85,
          reasons: [
            bookingCount > 10 ? `${bookingCount} bookings in ${timeWindow}` : null,
            reviewCount > 5 ? `${reviewCount} new reviews` : null,
            restaurant.rating >= 4.5 ? 'Highly rated' : null,
          ].filter(Boolean) as string[],
          algorithm: 'trending',
          restaurant,
          metrics: {
            bookingCount,
            reviewCount,
            rating: restaurant.rating,
            trendScore,
          },
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Store trending data for future reference
    for (const item of trendingRestaurants.slice(0, 10)) {
      try {
        await prisma.trendingRestaurant.upsert({
          where: {
            restaurantId_location_timeWindow_date: {
              restaurantId: item.restaurantId,
              location,
              timeWindow,
              date: new Date(new Date().toDateString()), // Normalize to start of day
            },
          },
          create: {
            restaurantId: item.restaurantId,
            location,
            trendScore: item.score,
            bookingCount: item.metrics.bookingCount,
            viewCount: 0, // Would need analytics data
            shareCount: 0, // Would need social sharing data
            timeWindow,
            date: new Date(new Date().toDateString()),
          },
          update: {
            trendScore: item.score,
            bookingCount: item.metrics.bookingCount,
            updatedAt: new Date(),
          },
        });
      } catch (error) {
        logger.error('Error storing trending restaurant data', { error, restaurantId: item.restaurantId });
      }
    }

    return NextResponse.json({
      success: true,
      data: trendingRestaurants,
      count: trendingRestaurants.length,
      metadata: {
        location,
        timeWindow,
        dateRange: {
          from: dateFilter.toISOString(),
          to: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error('Error in trending restaurants API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get trending restaurants',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
