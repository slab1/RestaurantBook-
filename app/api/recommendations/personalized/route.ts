import { NextRequest, NextResponse } from 'next/server';
import { mlRecommendationEngine } from '@/lib/ml-recommendation-engine';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract parameters
    const userId = searchParams.get('userId') || undefined;
    const latitude = searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined;
    const longitude = searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined;
    const cuisine = searchParams.get('cuisine')?.split(',') || undefined;
    const priceRange = searchParams.get('priceRange') || undefined;
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;
    const timeOfDay = searchParams.get('timeOfDay') as any || undefined;
    const dayOfWeek = searchParams.get('dayOfWeek') || undefined;
    const partySize = searchParams.get('partySize') ? parseInt(searchParams.get('partySize')!) : undefined;
    const occasion = searchParams.get('occasion') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    logger.info('Personalized recommendations request', {
      userId,
      latitude,
      longitude,
      cuisine,
      limit,
    });

    // Get personalized recommendations
    const recommendations = await mlRecommendationEngine.getPersonalizedRecommendations({
      userId,
      latitude,
      longitude,
      cuisine,
      priceRange,
      rating,
      timeOfDay,
      dayOfWeek,
      partySize,
      occasion,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      metadata: {
        personalized: !!userId,
        hasLocation: !!(latitude && longitude),
        filters: {
          cuisine: cuisine?.length || 0,
          priceRange: !!priceRange,
          rating: !!rating,
        },
      },
    });
  } catch (error) {
    logger.error('Error in personalized recommendations API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      latitude,
      longitude,
      cuisine,
      priceRange,
      rating,
      timeOfDay,
      dayOfWeek,
      partySize,
      occasion,
      limit = 10,
    } = body;

    logger.info('Personalized recommendations POST request', { userId, body });

    const recommendations = await mlRecommendationEngine.getPersonalizedRecommendations({
      userId,
      latitude,
      longitude,
      cuisine,
      priceRange,
      rating,
      timeOfDay,
      dayOfWeek,
      partySize,
      occasion,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    logger.error('Error in personalized recommendations POST API', { error });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recommendations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
