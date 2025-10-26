/**
 * Platform Connection API
 * Connect/disconnect restaurants to delivery platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedDeliveryService } from '@/lib/delivery';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const deliveryService = createUnifiedDeliveryService();

// GET /api/delivery/platforms - Get available platforms
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    const platforms = await prisma.deliveryPlatform.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        displayName: true,
        commissionRate: true,
        supportedCountries: true,
      },
    });

    if (restaurantId) {
      // Get connection status for this restaurant
      const connections = await prisma.restaurantDeliveryPlatform.findMany({
        where: { restaurantId },
        include: { platform: true },
      });

      const platformsWithStatus = platforms.map((platform) => {
        const connection = connections.find((c) => c.platformId === platform.id);
        return {
          ...platform,
          isConnected: connection?.isConnected || false,
          syncStatus: connection?.syncStatus || 'not_connected',
          lastSyncAt: connection?.lastSyncAt,
        };
      });

      return NextResponse.json({ platforms: platformsWithStatus });
    }

    return NextResponse.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch platforms' },
      { status: 500 }
    );
  }
}

// POST /api/delivery/platforms/connect - Connect restaurant to platform
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, platformName, credentials } = body;

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: session.user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or unauthorized' },
        { status: 404 }
      );
    }

    const platform = await prisma.deliveryPlatform.findUnique({
      where: { name: platformName },
    });

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found' },
        { status: 404 }
      );
    }

    // Connect to platform
    const connection = await deliveryService.connectRestaurant(
      platformName as any,
      restaurantId,
      credentials
    );

    // Save connection to database
    const dbConnection = await prisma.restaurantDeliveryPlatform.upsert({
      where: {
        restaurantId_platformId: {
          restaurantId,
          platformId: platform.id,
        },
      },
      create: {
        restaurantId,
        platformId: platform.id,
        platformRestaurantId: connection.platformRestaurantId,
        isConnected: true,
        syncStatus: 'pending',
        configuration: connection.configuration,
      },
      update: {
        platformRestaurantId: connection.platformRestaurantId,
        isConnected: true,
        syncStatus: 'pending',
        configuration: connection.configuration,
      },
      include: {
        platform: true,
      },
    });

    return NextResponse.json({
      connection: dbConnection,
      message: `Successfully connected to ${platform.displayName}`,
    });
  } catch (error) {
    console.error('Error connecting platform:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to connect to platform',
      },
      { status: 500 }
    );
  }
}
