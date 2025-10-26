import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse, withCache } from '@/lib/middleware';
import { cacheService } from '@/lib/redis';
import { recommendationEngine } from '@/lib/recommendation';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location');
    const cuisine = searchParams.get('cuisine')?.split(',') || [];
    const priceRange = searchParams.get('priceRange');
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
    const latitude = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
    const longitude = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const userId = searchParams.get('userId'); // For personalized results
    
    // Create cache key
    const cacheKey = `search:${JSON.stringify({
      query, location, cuisine, priceRange, rating, latitude, longitude, sortBy, page, limit
    })}`;
    
    const results = await withCache(cacheKey, 900, async () => {
      // Build search filters
      const whereClause: any = {
        isActive: true,
        isVerified: true,
      };
      
      // Text search
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { cuisine: { hasSome: [query] } },
          { features: { hasSome: [query] } },
        ];
      }
      
      // Location search
      if (location) {
        whereClause.OR = [
          ...(whereClause.OR || []),
          { city: { contains: location, mode: 'insensitive' } },
          { address: { contains: location, mode: 'insensitive' } },
        ];
      }
      
      // Cuisine filter
      if (cuisine.length > 0) {
        whereClause.cuisine = { hasSome: cuisine };
      }
      
      // Price range filter
      if (priceRange) {
        whereClause.priceRange = priceRange;
      }
      
      // Rating filter
      if (rating) {
        whereClause.rating = { gte: rating };
      }
      
      // Build order clause
      let orderBy: any = [];
      
      switch (sortBy) {
        case 'rating':
          orderBy = [{ rating: 'desc' }, { totalReviews: 'desc' }];
          break;
        case 'price_low':
          orderBy = [{ priceRange: 'asc' }];
          break;
        case 'price_high':
          orderBy = [{ priceRange: 'desc' }];
          break;
        case 'newest':
          orderBy = [{ createdAt: 'desc' }];
          break;
        case 'popular':
          orderBy = [{ totalReviews: 'desc' }, { rating: 'desc' }];
          break;
        default: // relevance
          orderBy = [{ rating: 'desc' }, { totalReviews: 'desc' }];
      }
      
      // Get restaurants
      const [restaurants, total] = await Promise.all([
        prisma.restaurant.findMany({
          where: whereClause,
          include: {
            reviews: {
              take: 3,
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            },
            _count: {
              select: { bookings: true, reviews: true }
            }
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.restaurant.count({ where: whereClause })
      ]);
      
      // Add distance calculation if coordinates provided
      const restaurantsWithDistance = restaurants.map(restaurant => {
        let distance = null;
        if (latitude && longitude && restaurant.latitude && restaurant.longitude) {
          distance = calculateDistance(
            latitude,
            longitude,
            restaurant.latitude,
            restaurant.longitude
          );
        }
        
        return {
          ...restaurant,
          distance,
          // Add availability status (simplified)
          isAvailable: true, // This would be calculated based on current bookings
        };
      });
      
      return {
        restaurants: restaurantsWithDistance,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          availableCuisines: await getAvailableCuisines(whereClause),
          priceRanges: ['$', '$$', '$$$', '$$$$'],
          avgRating: await getAverageRating(whereClause),
        }
      };
    });
    
    // Get personalized recommendations if user is provided
    let recommendations = [];
    if (userId) {
      recommendations = await recommendationEngine.getPersonalizedRecommendations({
        userId,
        latitude,
        longitude,
        cuisine,
        priceRange,
        rating,
        limit: 5,
      });
    }
    
    return apiResponse({
      ...results,
      recommendations,
      searchMetadata: {
        query,
        location,
        cuisine,
        priceRange,
        rating,
        sortBy,
        executionTime: Date.now(),
      }
    });
    
  } catch (error) {
    logger.error('Search API error:', error);
    return errorResponse('Search failed', 500, error);
  }
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

async function getAvailableCuisines(whereClause: any): Promise<string[]> {
  const restaurants = await prisma.restaurant.findMany({
    where: whereClause,
    select: { cuisine: true },
  });
  
  const cuisines = new Set<string>();
  restaurants.forEach(restaurant => {
    restaurant.cuisine.forEach(c => cuisines.add(c));
  });
  
  return Array.from(cuisines).sort();
}

async function getAverageRating(whereClause: any): Promise<number> {
  const result = await prisma.restaurant.aggregate({
    where: whereClause,
    _avg: { rating: true },
  });
  
  return result._avg.rating || 0;
}
