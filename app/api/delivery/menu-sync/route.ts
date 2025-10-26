/**
 * Menu Synchronization API
 * Sync restaurant menus to delivery platforms
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedDeliveryService } from '@/lib/delivery';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const deliveryService = createUnifiedDeliveryService();

// POST /api/delivery/menu-sync - Sync menu to platforms
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurantId, platforms } = body;

    // Verify restaurant ownership
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId: session.user.id,
      },
      include: {
        menuCategories: {
          include: {
            items: true,
          },
          where: { isActive: true },
        },
        deliveryPlatforms: {
          where: { isConnected: true },
          include: { platform: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or unauthorized' },
        { status: 404 }
      );
    }

    // Convert menu to sync format
    const menuCategories = restaurant.menuCategories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      sortOrder: category.sortOrder,
      items: category.items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: category.name,
        images: item.images,
        allergens: item.allergens,
        dietaryTags: item.dietaryTags,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
      })),
    }));

    // Determine which platforms to sync
    const targetPlatforms = platforms
      ? platforms.filter((p: string) =>
          restaurant.deliveryPlatforms.some((dp) => dp.platform.name === p)
        )
      : restaurant.deliveryPlatforms.map((dp) => dp.platform.name);

    if (targetPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'No connected platforms to sync' },
        { status: 400 }
      );
    }

    // Sync to all platforms
    const syncResults = await deliveryService.syncMenuToAllPlatforms(
      restaurantId,
      menuCategories,
      targetPlatforms
    );

    // Save sync logs
    const syncLogs = await Promise.all(
      Object.entries(syncResults).map(async ([platformName, result]) => {
        const platform = await prisma.deliveryPlatform.findUnique({
          where: { name: platformName },
        });

        if (!platform) return null;

        return prisma.menuSyncLog.create({
          data: {
            restaurantId,
            platformId: platform.id,
            syncType: result.syncType,
            status: result.success ? 'success' : 'failed',
            itemsSynced: result.itemsSynced,
            itemsFailed: result.itemsFailed,
            syncData: result,
            errorMessage: result.errors?.join(', '),
            syncDuration: result.syncDuration,
            triggeredBy: 'manual',
          },
        });
      })
    );

    // Update last sync time for connected platforms
    await Promise.all(
      Object.keys(syncResults).map(async (platformName) => {
        const platform = await prisma.deliveryPlatform.findUnique({
          where: { name: platformName },
        });

        if (!platform) return;

        await prisma.restaurantDeliveryPlatform.updateMany({
          where: {
            restaurantId,
            platformId: platform.id,
          },
          data: {
            lastSyncAt: new Date(),
            syncStatus: syncResults[platformName].success ? 'synced' : 'error',
            isMenuSynced: syncResults[platformName].success,
          },
        });
      })
    );

    return NextResponse.json({
      results: syncResults,
      logs: syncLogs.filter(Boolean),
      message: 'Menu synchronization completed',
    });
  } catch (error) {
    console.error('Error syncing menu:', error);
    return NextResponse.json(
      { error: 'Failed to sync menu' },
      { status: 500 }
    );
  }
}

// GET /api/delivery/menu-sync - Get sync history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID required' },
        { status: 400 }
      );
    }

    // Verify ownership
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

    const syncLogs = await prisma.menuSyncLog.findMany({
      where: { restaurantId },
      include: {
        platform: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ syncLogs });
  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync logs' },
      { status: 500 }
    );
  }
}
