/**
 * Delivery Tracking API
 * Real-time delivery tracking information
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedDeliveryService } from '@/lib/delivery';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const deliveryService = createUnifiedDeliveryService();

// GET /api/delivery/tracking/[orderId] - Get tracking info
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.deliveryOrder.findUnique({
      where: { id: params.orderId },
      include: {
        platform: true,
        tracking: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization
    if (order.userId !== session.user.id && order.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get real-time tracking from platform
    const trackingInfo = await deliveryService.getTracking(
      order.platform.name as any,
      order.platformOrderId || order.id
    );

    // Update tracking in database
    if (trackingInfo) {
      const trackingData = await prisma.deliveryTracking.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          driverName: trackingInfo.driver?.name,
          driverPhone: trackingInfo.driver?.phone,
          driverPhoto: trackingInfo.driver?.photo,
          driverRating: trackingInfo.driver?.rating,
          vehicleType: trackingInfo.driver?.vehicleType,
          vehicleNumber: trackingInfo.driver?.vehicleNumber,
          driverLocation: trackingInfo.driver?.location || null,
          currentStatus: trackingInfo.status,
          estimatedArrival: trackingInfo.estimatedArrival,
          lastLocationUpdate: trackingInfo.driver?.location?.timestamp,
          lastStatusUpdate: new Date(),
          pickupLocation: trackingInfo.pickupLocation || null,
          deliveryLocation: trackingInfo.deliveryLocation || null,
          distance: trackingInfo.distance,
          distanceRemaining: trackingInfo.distanceRemaining,
          trackingUpdates: [],
        },
        update: {
          driverName: trackingInfo.driver?.name,
          driverPhone: trackingInfo.driver?.phone,
          driverPhoto: trackingInfo.driver?.photo,
          driverRating: trackingInfo.driver?.rating,
          vehicleType: trackingInfo.driver?.vehicleType,
          driverLocation: trackingInfo.driver?.location || null,
          currentStatus: trackingInfo.status,
          estimatedArrival: trackingInfo.estimatedArrival,
          lastLocationUpdate: trackingInfo.driver?.location?.timestamp,
          lastStatusUpdate: new Date(),
          distance: trackingInfo.distance,
          distanceRemaining: trackingInfo.distanceRemaining,
        },
      });

      return NextResponse.json({
        tracking: trackingData,
        platformData: trackingInfo,
      });
    }

    // Return database tracking if platform tracking unavailable
    return NextResponse.json({
      tracking: order.tracking,
      platformData: null,
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}
