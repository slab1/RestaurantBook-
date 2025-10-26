import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const restaurantId = searchParams.get('restaurantId');
    const userId = searchParams.get('userId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    if (!restaurantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Restaurant ID is required',
        },
        { status: 400 }
      );
    }

    logger.info('Similar restaurants request', { restaurantId, userId, limit });

    // Get similar restaurants from pre-computed similarity matrix
    const similarRestaurants = await prisma.restaurantSimilarity.findMany({
      where: {
        restaurantId,
        similarityScore: { gte: 0.3 }, // Minimum similarity threshold
      },
      include: {
        similarRestaurant: {
          include: {
            reviews: { take: 5, orderBy: { createdAt: 'desc' } },
            _count: { select: { bookings: true, reviews: true } },
          },
        },
      },
      orderBy: { similarityScore: 'desc' },
      take: limit,
    });

    const recommendations = similarRestaurants.map(sim => ({
      restaurantId: sim.similarRestaurantId,
      score: Number(sim.similarityScore) * 100,
      confidence: 0.90,
      reasons: ['Similar to selected restaurant', ...(sim.featureOverlap as any)?.reasons || []],
      algorithm: sim.similarityType,
      restaurant: sim.similarRestaurant,
      similarityScore: Number(sim.similarityScore),
    }));

    // If no similar restaurants found, use content-based fallback
    if (recommendations.length === 0) {
      const baseRestaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
      });

      if (baseRestaurant) {
        // Find restaurants with similar cuisine and price range
        const fallbackRestaurants = await prisma.restaurant.findMany({
          where: {
            id: { not: restaurantId },
            isActive: true,
            isVerified: true,
            OR: [
              { cuisine: { hasSome: baseRestaurant.cuisine } },
              { priceRange: baseRestaurant.priceRange },
            ],
          },
          include: {
            reviews: { take: 5, orderBy: { createdAt: 'desc' } },
            _count: { select: { bookings: true, reviews: true } },
          },
          orderBy: { rating: 'desc' },
          take: limit,
        });

        return NextResponse.json({
          success: true,
          data: fallbackRestaurants.map(restaurant => ({
            restaurantId: restaurant.id,
            score: restaurant.rating * 20,
            confidence: 0.70,
            reasons: ['Similar cuisine or price range'],
            algorithm: 'content_based_fallback',
            restaurant,
          })),
          count: fallbackRestaurants.length,
          isFallback: true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      isFallback: false,
    });
  } catch (error) {
    logger.error('Error in similar restaurants API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get similar restaurants',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
