/**
 * Delivery Orders API
 * Handle delivery order creation and management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedDeliveryService } from '@/lib/delivery';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const deliveryService = createUnifiedDeliveryService();

// GET /api/delivery/orders - Get user's delivery orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      userId: session.user.id,
    };

    if (restaurantId) {
      where.restaurantId = restaurantId;
    }

    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.deliveryOrder.findMany({
        where,
        include: {
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              images: true,
            },
          },
          platform: {
            select: {
              name: true,
              displayName: true,
            },
          },
          tracking: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.deliveryOrder.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/delivery/orders - Create new delivery order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      restaurantId,
      platformType,
      orderType,
      items,
      deliveryAddress,
      contactPhone,
      contactName,
      specialInstructions,
      scheduledFor,
      tip,
      autoSelectPlatform,
    } = body;

    // Validate required fields
    if (!restaurantId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address required for delivery orders' },
        { status: 400 }
      );
    }

    // Get restaurant's connected platforms
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        deliveryPlatforms: {
          where: { isConnected: true },
          include: { platform: true },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }

    const connectedPlatforms = restaurant.deliveryPlatforms.map(
      (dp) => dp.platform.name as any
    );

    if (connectedPlatforms.length === 0) {
      return NextResponse.json(
        { error: 'Restaurant not connected to any delivery platform' },
        { status: 400 }
      );
    }

    // Create order request
    const orderRequest = {
      restaurantId,
      userId: session.user.id,
      items,
      orderType,
      deliveryAddress,
      contactPhone: contactPhone || session.user.phone,
      contactName: contactName || `${session.user.firstName} ${session.user.lastName}`,
      specialInstructions,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      tip: tip || 0,
    };

    let orderDetails;
    let selectedPlatform;

    // Smart platform selection or use specified platform
    if (autoSelectPlatform) {
      const result = await deliveryService.createOrderSmart(
        orderRequest,
        connectedPlatforms
      );
      orderDetails = result.order;
      selectedPlatform = result.platform;
    } else {
      if (!platformType || !connectedPlatforms.includes(platformType)) {
        return NextResponse.json(
          { error: 'Invalid or disconnected platform' },
          { status: 400 }
        );
      }
      selectedPlatform = platformType;
      orderDetails = await deliveryService.createOrder(
        platformType,
        orderRequest
      );
    }

    // Get platform ID
    const platform = await prisma.deliveryPlatform.findUnique({
      where: { name: selectedPlatform },
    });

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform not found in database' },
        { status: 500 }
      );
    }

    // Save order to database
    const deliveryOrder = await prisma.deliveryOrder.create({
      data: {
        userId: session.user.id,
        restaurantId,
        platformId: platform.id,
        platformOrderId: orderDetails.platformOrderId,
        orderNumber: orderDetails.orderNumber,
        orderType,
        deliveryAddress: deliveryAddress || null,
        specialInstructions,
        contactPhone: orderRequest.contactPhone,
        contactName: orderRequest.contactName,
        subtotal: orderDetails.subtotal,
        deliveryFee: orderDetails.deliveryFee,
        tip: orderDetails.tip,
        tax: orderDetails.tax,
        platformFee: orderDetails.platformFee,
        discount: orderDetails.discount,
        totalAmount: orderDetails.totalAmount,
        currency: orderDetails.currency,
        status: orderDetails.status,
        estimatedDeliveryTime: orderDetails.estimatedDeliveryTime,
        items: items,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        paymentStatus: 'pending',
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            images: true,
          },
        },
        platform: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      order: deliveryOrder,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Error creating delivery order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create order' },
      { status: 500 }
    );
  }
}
