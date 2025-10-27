import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse, authenticateToken, withCache } from '@/lib/middleware';
import { logger } from '@/lib/logger';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// GET /api/analytics/dashboard - Get comprehensive dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const period = searchParams.get('period') || '30d'; // 1d, 7d, 30d, 90d
    const comparison = searchParams.get('comparison') === 'true';
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    // Verify access permissions
    if (restaurantId) {
      if (auth.user.role === 'RESTAURANT_OWNER') {
        const restaurant = await prisma.restaurant.findFirst({
          where: { id: restaurantId, ownerId: auth.user.userId },
        });
        if (!restaurant) {
          return errorResponse('Unauthorized', 403);
        }
      } else if (auth.user.role !== 'ADMIN') {
        return errorResponse('Unauthorized', 403);
      }
    }
    
    // Calculate date ranges
    const { currentStart, currentEnd, previousStart, previousEnd } = getDateRanges(period);
    
    // Build base where clause
    const baseWhere: any = {
      ...(restaurantId && { restaurantId }),
    };
    
    const cacheKey = `dashboard:${restaurantId || 'all'}:${period}:${currentStart.toISOString()}`;
    
    const analytics = await withCache(cacheKey, 600, async () => {
      // Get current period data
      const currentData = await getAnalyticsData({
        ...baseWhere,
        createdAt: {
          gte: currentStart,
          lte: currentEnd,
        },
      });
      
      let previousData = null;
      if (comparison) {
        // Get previous period data for comparison
        previousData = await getAnalyticsData({
          ...baseWhere,
          createdAt: {
            gte: previousStart,
            lte: previousEnd,
          },
        });
      }
      
      return {
        current: currentData,
        previous: previousData,
        comparison: comparison ? calculateComparison(currentData, previousData) : null,
        period,
        dateRange: {
          start: currentStart,
          end: currentEnd,
        },
      };
    });
    
    return apiResponse(analytics);
    
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    return errorResponse('Failed to get analytics', 500, error);
  }
}

// Helper function to get date ranges based on period
function getDateRanges(period: string) {
  const now = new Date();
  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
  
  switch (period) {
    case '1d':
      currentStart = startOfDay(now);
      currentEnd = endOfDay(now);
      previousStart = startOfDay(subDays(now, 1));
      previousEnd = endOfDay(subDays(now, 1));
      break;
      
    case '7d':
      currentStart = startOfWeek(now);
      currentEnd = endOfWeek(now);
      previousStart = startOfWeek(subDays(now, 7));
      previousEnd = endOfWeek(subDays(now, 7));
      break;
      
    case '30d':
      currentStart = startOfMonth(now);
      currentEnd = endOfMonth(now);
      previousStart = startOfMonth(subDays(now, 30));
      previousEnd = endOfMonth(subDays(now, 30));
      break;
      
    case '90d':
    default:
      currentStart = subDays(now, 90);
      currentEnd = now;
      previousStart = subDays(now, 180);
      previousEnd = subDays(now, 90);
      break;
  }
  
  return { currentStart, currentEnd, previousStart, previousEnd };
}

// Get comprehensive analytics data
async function getAnalyticsData(whereClause: any) {
  // Bookings analytics
  const [bookingStats, revenueStats, customerStats, tableStats, popularTimes, topCustomers] = await Promise.all([
    getBookingStats(whereClause),
    getRevenueStats(whereClause),
    getCustomerStats(whereClause),
    getTableUtilizationStats(whereClause),
    getPopularTimesStats(whereClause),
    getTopCustomersStats(whereClause),
  ]);
  
  return {
    bookings: bookingStats,
    revenue: revenueStats,
    customers: customerStats,
    tables: tableStats,
    popularTimes,
    topCustomers,
  };
}

// Booking statistics
async function getBookingStats(whereClause: any) {
  const [totalBookings, statusBreakdown, avgPartySize, completionRate] = await Promise.all([
    // Total bookings
    prisma.booking.count({ where: whereClause }),
    
    // Status breakdown
    prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),
    
    // Average party size
    prisma.booking.aggregate({
      where: whereClause,
      _avg: { partySize: true },
    }),
    
    // Completion rate
    prisma.booking.findMany({
      where: whereClause,
      select: { status: true },
    }).then((bookings: { status: string }[]) => {
      const completed = bookings.filter(b => b.status === 'COMPLETED').length;
      return bookings.length > 0 ? (completed / bookings.length) * 100 : 0;
    }),
  ]);
  
  return {
    total: totalBookings,
    statusBreakdown: statusBreakdown.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as any),
    avgPartySize: Math.round((avgPartySize._avg.partySize || 0) * 100) / 100,
    completionRate: Math.round(completionRate * 100) / 100,
  };
}

// Revenue statistics
async function getRevenueStats(whereClause: any) {
  const payments = await prisma.payment.findMany({
    where: {
      ...whereClause,
      status: 'COMPLETED',
    },
    include: {
      booking: {
        select: {
          partySize: true,
          bookingTime: true,
        }
      }
    }
  });
  
  const totalRevenue = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
  const avgOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0;
  const revenuePerGuest = payments.reduce((sum: number, payment: any) => {
    return sum + (payment.amount / payment.booking.partySize);
  }, 0) / payments.length || 0;
  
  // Daily revenue breakdown
  const dailyRevenue = payments.reduce((acc: Record<string, number>, payment: any) => {
    const date = payment.booking.bookingTime.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + payment.amount;
    return acc;
  }, {} as any);
  
  return {
    total: Math.round(totalRevenue * 100) / 100,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    revenuePerGuest: Math.round(revenuePerGuest * 100) / 100,
    dailyBreakdown: dailyRevenue,
    transactionCount: payments.length,
  };
}

// Customer statistics
async function getCustomerStats(whereClause: any) {
  const bookings = await prisma.booking.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
        }
      }
    }
  });
  
  const uniqueCustomers = new Set(bookings.map((b: any) => b.user.id)).size;
  const newCustomers = bookings.filter((b: any) => {
    const customerFirstBooking = bookings
      .filter((booking: any) => booking.user.id === b.user.id)
      .sort((a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime())[0];
    return customerFirstBooking.id === b.id;
  }).length;
  
  const returningCustomers = uniqueCustomers - newCustomers;
  const customerRetentionRate = uniqueCustomers > 0 ? (returningCustomers / uniqueCustomers) * 100 : 0;
  
  return {
    unique: uniqueCustomers,
    new: newCustomers,
    returning: returningCustomers,
    retentionRate: Math.round(customerRetentionRate * 100) / 100,
  };
}

// Table utilization statistics
async function getTableUtilizationStats(whereClause: any) {
  const [bookings, tables] = await Promise.all([
    prisma.booking.findMany({
      where: {
        ...whereClause,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
      },
      include: {
        table: {
          select: {
            id: true,
            capacity: true,
          }
        }
      }
    }),
    prisma.table.findMany({
      where: {
        restaurant: {
          ...(whereClause.restaurantId && { id: whereClause.restaurantId }),
        }
      }
    })
  ]);
  
  const tableUtilization = tables.map((table: any) => {
    const tableBookings = bookings.filter((b: any) => b.table.id === table.id);
    const utilizationRate = tableBookings.length;
    const avgOccupancy = tableBookings.reduce((sum: number, booking: any) => {
      return sum + (booking.partySize / table.capacity);
    }, 0) / tableBookings.length || 0;
    
    return {
      tableId: table.id,
      tableNumber: table.number,
      capacity: table.capacity,
      bookingCount: tableBookings.length,
      avgOccupancy: Math.round(avgOccupancy * 100),
    };
  });
  
  const overallUtilization = bookings.length / tables.length;
  
  return {
    overall: Math.round(overallUtilization * 100) / 100,
    byTable: tableUtilization,
    totalTables: tables.length,
  };
}

// Popular times statistics
async function getPopularTimesStats(whereClause: any) {
  const bookings = await prisma.booking.findMany({
    where: whereClause,
    select: {
      bookingTime: true,
      partySize: true,
    }
  });
  
  // Group by hour
  const hourlyBreakdown = bookings.reduce((acc: Record<number, number>, booking: any) => {
    const hour = booking.bookingTime.getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as any);
  
  // Group by day of week
  const dayOfWeekBreakdown = bookings.reduce((acc: Record<number, number>, booking: any) => {
    const dayOfWeek = booking.bookingTime.getDay();
    acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
    return acc;
  }, {} as any);
  
  return {
    hourly: hourlyBreakdown,
    dayOfWeek: dayOfWeekBreakdown,
  };
}

// Top customers statistics
async function getTopCustomersStats(whereClause: any) {
  const topCustomers = await prisma.booking.groupBy({
    by: ['userId'],
    where: whereClause,
    _count: true,
    _sum: {
      partySize: true,
    },
    orderBy: {
      _count: {
        userId: 'desc',
      }
    },
    take: 10,
  });
  
  const customersWithDetails = await Promise.all(
    topCustomers.map(async (customer: any) => {
      const user = await prisma.user.findUnique({
        where: { id: customer.userId },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          totalSpent: true,
        }
      });
      
      return {
        ...customer,
        user,
      };
    })
  );
  
  return customersWithDetails;
}

// Calculate comparison metrics
function calculateComparison(current: any, previous: any) {
  if (!previous) return null;
  
  const calculateChange = (currentVal: number, previousVal: number) => {
    if (previousVal === 0) return currentVal > 0 ? 100 : 0;
    return Math.round(((currentVal - previousVal) / previousVal) * 100 * 100) / 100;
  };
  
  return {
    bookings: {
      total: calculateChange(current.bookings.total, previous.bookings.total),
      completionRate: calculateChange(current.bookings.completionRate, previous.bookings.completionRate),
    },
    revenue: {
      total: calculateChange(current.revenue.total, previous.revenue.total),
      avgOrderValue: calculateChange(current.revenue.avgOrderValue, previous.revenue.avgOrderValue),
    },
    customers: {
      unique: calculateChange(current.customers.unique, previous.customers.unique),
      new: calculateChange(current.customers.new, previous.customers.new),
      retentionRate: calculateChange(current.customers.retentionRate, previous.customers.retentionRate),
    },
  };
}
