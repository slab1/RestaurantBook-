/**
 * Single Delivery Order API
 * Handle individual order operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUnifiedDeliveryService } from '@/lib/delivery';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const deliveryService = createUnifiedDeliveryService();

// GET /api/delivery/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.deliveryOrder.findUnique({
      where: { id: params.id },
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
        feedback: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization
    if (order.userId !== session.user.id) {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          id: order.restaurantId,
          ownerId: session.user.id,
        },
      });

      if (!restaurant) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/delivery/orders/[id] - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, metadata } = body;

    const order = await prisma.deliveryOrder.findUnique({
      where: { id: params.id },
      include: { platform: true, restaurant: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only restaurant owner can update order status
    if (order.restaurant.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update status on platform
    const updatedOrder = await deliveryService.updateOrderStatus(
      order.platform.name as any,
      order.platformOrderId || order.id,
      status,
      metadata
    );

    // Update in database
    const dbOrder = await prisma.deliveryOrder.update({
      where: { id: params.id },
      data: {
        status: updatedOrder.status,
        ...(status === 'preparing' && { preparationCompletedAt: null }),
        ...(status === 'ready' && { preparationCompletedAt: new Date() }),
        ...(status === 'delivered' && { actualDeliveryTime: new Date() }),
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
        tracking: true,
      },
    });

    return NextResponse.json({
      order: dbOrder,
      message: 'Order status updated',
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/delivery/orders/[id] - Cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Customer requested cancellation';

    const order = await prisma.deliveryOrder.findUnique({
      where: { id: params.id },
      include: { platform: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only order creator can cancel
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cannot cancel already delivered or cancelled orders
    if (['delivered', 'cancelled'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Cannot cancel this order' },
        { status: 400 }
      );
    }

    // Cancel on platform
    await deliveryService.cancelOrder(
      order.platform.name as any,
      order.platformOrderId || order.id,
      reason
    );

    // Update in database
    const cancelledOrder = await prisma.deliveryOrder.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: 'customer',
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
      order: cancelledOrder,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
