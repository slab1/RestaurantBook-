/**
 * Delivery Analytics API
 * Generate delivery performance analytics and insights
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/delivery/analytics - Get delivery analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID required' },
        { status: 400 }
      );
    }

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

    const whereClause: any = { restaurantId };

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Get basic stats
    const [
      totalOrders,
      activeOrders,
      completedToday,
      cancelledOrders,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      prisma.deliveryOrder.count({ where: whereClause }),
      prisma.deliveryOrder.count({
        where: {
          ...whereClause,
          status: {
            in: ['confirmed', 'preparing', 'ready', 'out_for_delivery'],
          },
        },
      }),
      prisma.deliveryOrder.count({
        where: {
          ...whereClause,
          status: 'delivered',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.deliveryOrder.count({
        where: {
          ...whereClause,
          status: 'cancelled',
        },
      }),
      prisma.deliveryOrder.aggregate({
        where: {
          ...whereClause,
          status: 'delivered',
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.deliveryOrder.aggregate({
        where: whereClause,
        _avg: {
          totalAmount: true,
        },
      }),
    ]);

    // Revenue today
    const revenueToday = await prisma.deliveryOrder.aggregate({
      where: {
        ...whereClause,
        status: 'delivered',
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Platform breakdown
    const platformStats = await prisma.deliveryOrder.groupBy({
      by: ['platformId'],
      where: whereClause,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const platformsData = await Promise.all(
      platformStats.map(async (stat) => {
        const platform = await prisma.deliveryPlatform.findUnique({
          where: { id: stat.platformId },
          select: { name: true, displayName: true },
        });
        return {
          platform: platform?.displayName || 'Unknown',
          orders: stat._count.id,
          revenue: stat._sum.totalAmount || 0,
        };
      })
    );

    // Orders by status
    const statusBreakdown = await prisma.deliveryOrder.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true,
      },
    });

    // Daily orders trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const dailyOrders = await Promise.all(
      last7Days.map(async (date) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const count = await prisma.deliveryOrder.count({
          where: {
            restaurantId,
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        return {
          date: date.toISOString().split('T')[0],
          orders: count,
        };
      })
    );

    // Average delivery time
    const deliveredOrders = await prisma.deliveryOrder.findMany({
      where: {
        ...whereClause,
        status: 'delivered',
        actualDeliveryTime: { not: null },
      },
      select: {
        createdAt: true,
        actualDeliveryTime: true,
      },
      take: 100,
    });

    const avgDeliveryTime =
      deliveredOrders.reduce((sum, order) => {
        if (order.actualDeliveryTime) {
          const diff =
            order.actualDeliveryTime.getTime() - order.createdAt.getTime();
          return sum + diff / 60000; // Convert to minutes
        }
        return sum;
      }, 0) / (deliveredOrders.length || 1);

    // Customer satisfaction (from feedback)
    const feedbackStats = await prisma.deliveryFeedback.aggregate({
      where: {
        restaurantId,
      },
      _avg: {
        rating: true,
        foodQuality: true,
        deliverySpeed: true,
        packaging: true,
      },
      _count: {
        id: true,
      },
    });

    // Top performing hours
    const ordersByHour = await prisma.$queryRaw`
      SELECT 
        EXTRACT(HOUR FROM "createdAt") as hour,
        COUNT(*) as count
      FROM "delivery_orders"
      WHERE "restaurantId" = ${restaurantId}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 5
    `;

    return NextResponse.json({
      stats: {
        totalOrders,
        activeOrders,
        completedToday,
        cancelledOrders,
        revenue: revenueToday._sum.totalAmount || 0,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        averageDeliveryTime: Math.round(avgDeliveryTime),
        cancellationRate: totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0,
      },
      platforms: platformsData,
      statusBreakdown: statusBreakdown.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      dailyTrend: dailyOrders,
      feedback: {
        averageRating: feedbackStats._avg.rating || 0,
        foodQuality: feedbackStats._avg.foodQuality || 0,
        deliverySpeed: feedbackStats._avg.deliverySpeed || 0,
        packaging: feedbackStats._avg.packaging || 0,
        totalReviews: feedbackStats._count.id,
      },
      peakHours: ordersByHour,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
