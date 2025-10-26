import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse, authenticateToken } from '@/lib/middleware';
import { notificationService } from '@/lib/notifications';
import { socketManager } from '@/lib/socket';
import { cacheService } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { addHours, isAfter, isBefore, format } from 'date-fns';

const createBookingSchema = z.object({
  restaurantId: z.string().cuid(),
  tableId: z.string().cuid(),
  bookingTime: z.string().datetime(),
  partySize: z.number().min(1).max(20),
  specialRequests: z.string().optional(),
  eventType: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'BUSINESS_MEETING', 'DATE_NIGHT', 'CELEBRATION', 'CASUAL_DINING']).optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  seatingPreference: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.object({
    frequency: z.enum(['WEEKLY', 'MONTHLY']),
    days: z.array(z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'])),
    endDate: z.string().datetime(),
  }).optional(),
  loyaltyPointsToUse: z.number().min(0).default(0),
});

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'WAITLISTED']).optional(),
  specialRequests: z.string().optional(),
  notes: z.string().optional(),
  actualPartySize: z.number().min(1).max(20).optional(),
  checkInTime: z.string().datetime().optional(),
  checkOutTime: z.string().datetime().optional(),
  noShowReason: z.string().optional(),
});

// GET /api/bookings/enhanced - Get enhanced bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeAnalytics = searchParams.get('analytics') === 'true';
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    // Build where clause based on user role and parameters
    const whereClause: any = {};
    
    if (auth.user.role === 'CUSTOMER') {
      whereClause.userId = auth.user.userId;
    } else if (auth.user.role === 'RESTAURANT_OWNER') {
      // Get restaurants owned by user
      const ownedRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: auth.user.userId },
        select: { id: true },
      });
      whereClause.restaurantId = {
        in: ownedRestaurants.map(r => r.id),
      };
    }
    
    // Apply filters
    if (restaurantId) {
      // Verify access to restaurant
      if (auth.user.role === 'RESTAURANT_OWNER') {
        const restaurant = await prisma.restaurant.findFirst({
          where: { id: restaurantId, ownerId: auth.user.userId },
        });
        if (!restaurant && auth.user.role !== 'ADMIN') {
          return errorResponse('Unauthorized', 403);
        }
      }
      whereClause.restaurantId = restaurantId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.bookingTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }
    
    if (userId && auth.user.role === 'ADMIN') {
      whereClause.userId = userId;
    }
    
    // Get bookings with related data
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              loyaltyPoints: true,
            }
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              cuisine: true,
            }
          },
          table: {
            select: {
              id: true,
              number: true,
              capacity: true,
              position: true,
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              currency: true,
            }
          },
          childBookings: {
            select: {
              id: true,
              bookingTime: true,
              status: true,
            }
          }
        },
        orderBy: { bookingTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where: whereClause })
    ]);
    
    let analytics = null;
    
    // Add analytics if requested
    if (includeAnalytics && (auth.user.role === 'RESTAURANT_OWNER' || auth.user.role === 'ADMIN')) {
      analytics = await getBookingAnalytics(whereClause);
    }
    
    return apiResponse({
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      analytics,
    });
    
  } catch (error) {
    logger.error('Get enhanced bookings error:', error);
    return errorResponse('Failed to get bookings', 500, error);
  }
}

// POST /api/bookings/enhanced - Create enhanced booking with smart features
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    const body = await request.json();
    const data = createBookingSchema.parse(body);
    
    // Validate restaurant and table
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: data.restaurantId,
        isActive: true,
      },
      include: {
        tables: {
          where: { id: data.tableId },
        }
      }
    });
    
    if (!restaurant || restaurant.tables.length === 0) {
      return errorResponse('Restaurant or table not found', 404);
    }
    
    const table = restaurant.tables[0];
    const bookingTime = new Date(data.bookingTime);
    
    // Validate party size
    if (data.partySize > table.capacity) {
      return errorResponse('Party size exceeds table capacity', 400);
    }
    
    // Check table availability
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        tableId: data.tableId,
        status: { in: ['PENDING', 'CONFIRMED'] },
        bookingTime: {
          gte: addHours(bookingTime, -2),
          lte: addHours(bookingTime, 2),
        },
      },
    });
    
    if (conflictingBooking) {
      return errorResponse('Table not available at the requested time', 409);
    }
    
    // Validate loyalty points usage
    let loyaltyPointsUsed = 0;
    if (data.loyaltyPointsToUse > 0) {
      const user = await prisma.user.findUnique({
        where: { id: auth.user.userId },
      });
      
      if (!user || user.loyaltyPoints < data.loyaltyPointsToUse) {
        return errorResponse('Insufficient loyalty points', 400);
      }
      
      loyaltyPointsUsed = data.loyaltyPointsToUse;
    }
    
    // Generate confirmation code
    const confirmationCode = generateConfirmationCode();
    
    // Calculate estimated duration based on party size and restaurant settings
    const estimatedDuration = Math.max(60, data.partySize * 30); // 30 min per person, min 1 hour
    
    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: auth.user.userId,
        restaurantId: data.restaurantId,
        tableId: data.tableId,
        bookingTime,
        partySize: data.partySize,
        specialRequests: data.specialRequests,
        eventType: data.eventType,
        dietaryRestrictions: data.dietaryRestrictions,
        seatingPreference: data.seatingPreference,
        isRecurring: data.isRecurring,
        recurringPattern: data.recurringPattern,
        confirmationCode,
        estimatedDuration,
        loyaltyPointsUsed,
        loyaltyPointsEarned: Math.floor(data.partySize * 10), // 10 points per person
        status: restaurant.depositRequired ? 'PENDING' : 'CONFIRMED',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        restaurant: {
          select: {
            name: true,
            address: true,
            phone: true,
          }
        },
        table: {
          select: {
            number: true,
            capacity: true,
          }
        }
      }
    });
    
    // Deduct loyalty points if used
    if (loyaltyPointsUsed > 0) {
      await prisma.user.update({
        where: { id: auth.user.userId },
        data: {
          loyaltyPoints: {
            decrement: loyaltyPointsUsed,
          }
        }
      });
      
      // Record loyalty transaction
      await prisma.loyaltyTransaction.create({
        data: {
          userId: auth.user.userId,
          type: 'REDEEMED',
          points: -loyaltyPointsUsed,
          description: `Used for booking at ${restaurant.name}`,
        }
      });
    }
    
    // Create recurring bookings if specified
    if (data.isRecurring && data.recurringPattern) {
      await createRecurringBookings(booking.id, data.recurringPattern, bookingTime);
    }
    
    // Send confirmation notification
    await notificationService.sendBookingConfirmation(auth.user.userId, {
      confirmationCode,
      restaurantName: restaurant.name,
      bookingTime: format(bookingTime, 'PPP p'),
      partySize: data.partySize,
    });
    
    // Notify restaurant via Socket.IO
    socketManager.notifyRestaurant(data.restaurantId, 'booking:new', {
      booking,
      message: `New booking from ${booking.user.firstName} ${booking.user.lastName}`,
    });
    
    // Invalidate cache
    await cacheService.invalidatePattern(`restaurant:${data.restaurantId}*`);
    
    return apiResponse(booking, 201);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid request data', 400, error.errors);
    }
    
    logger.error('Create enhanced booking error:', error);
    return errorResponse('Failed to create booking', 500, error);
  }
}

// PUT /api/bookings/enhanced/[id] - Update booking with enhanced features
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');
    
    if (!bookingId) {
      return errorResponse('Booking ID required', 400);
    }
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    const body = await request.json();
    const data = updateBookingSchema.parse(body);
    
    // Get existing booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: true,
        restaurant: true,
        table: true,
      }
    });
    
    if (!booking) {
      return errorResponse('Booking not found', 404);
    }
    
    // Check permissions
    const canUpdate = 
      booking.userId === auth.user.userId || 
      booking.restaurant.ownerId === auth.user.userId ||
      auth.user.role === 'ADMIN';
    
    if (!canUpdate) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Handle status changes with business logic
    const updateData: any = { ...data };
    
    if (data.status && data.status !== booking.status) {
      switch (data.status) {
        case 'CONFIRMED':
          if (booking.status !== 'PENDING') {
            return errorResponse('Can only confirm pending bookings', 400);
          }
          break;
          
        case 'CANCELLED':
          if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
            return errorResponse('Cannot cancel this booking', 400);
          }
          // Refund loyalty points if used
          if (booking.loyaltyPointsUsed > 0) {
            await prisma.user.update({
              where: { id: booking.userId },
              data: {
                loyaltyPoints: {
                  increment: booking.loyaltyPointsUsed,
                }
              }
            });
          }
          break;
          
        case 'COMPLETED':
          if (booking.status !== 'CONFIRMED') {
            return errorResponse('Can only complete confirmed bookings', 400);
          }
          // Award loyalty points
          if (booking.loyaltyPointsEarned > 0) {
            await prisma.user.update({
              where: { id: booking.userId },
              data: {
                loyaltyPoints: {
                  increment: booking.loyaltyPointsEarned,
                },
                totalSpent: {
                  increment: data.actualPartySize ? data.actualPartySize * 50 : booking.partySize * 50,
                }
              }
            });
            
            // Record loyalty transaction
            await prisma.loyaltyTransaction.create({
              data: {
                userId: booking.userId,
                type: 'EARNED',
                points: booking.loyaltyPointsEarned,
                description: `Earned from booking at ${booking.restaurant.name}`,
              }
            });
          }
          break;
          
        case 'NO_SHOW':
          updateData.noShowReason = data.noShowReason || 'Customer did not arrive';
          break;
      }
    }
    
    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        restaurant: {
          select: {
            name: true,
          }
        }
      }
    });
    
    // Send status change notifications
    if (data.status && data.status !== booking.status) {
      await sendStatusChangeNotification(updatedBooking, data.status);
    }
    
    // Invalidate cache
    await cacheService.invalidatePattern(`restaurant:${booking.restaurantId}*`);
    
    return apiResponse(updatedBooking);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid request data', 400, error.errors);
    }
    
    logger.error('Update enhanced booking error:', error);
    return errorResponse('Failed to update booking', 500, error);
  }
}

// Helper functions
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function createRecurringBookings(
  parentBookingId: string,
  pattern: any,
  startDate: Date
): Promise<void> {
  const endDate = new Date(pattern.endDate);
  const bookings: any[] = [];
  
  let currentDate = new Date(startDate);
  
  while (isBefore(currentDate, endDate)) {
    if (pattern.frequency === 'WEEKLY') {
      currentDate = addHours(currentDate, 7 * 24);
    } else if (pattern.frequency === 'MONTHLY') {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    }
    
    if (isBefore(currentDate, endDate)) {
      // This would create child bookings - simplified for now
      // In a real implementation, you'd need to check availability and create actual bookings
    }
  }
}

async function getBookingAnalytics(whereClause: any): Promise<any> {
  const [statusCounts, revenueData, popularTimes] = await Promise.all([
    prisma.booking.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
    }),
    prisma.booking.findMany({
      where: {
        ...whereClause,
        status: 'COMPLETED',
      },
      include: {
        payments: {
          where: { status: 'COMPLETED' },
        }
      }
    }),
    prisma.booking.findMany({
      where: whereClause,
      select: {
        bookingTime: true,
        partySize: true,
      }
    })
  ]);
  
  const totalRevenue = revenueData.reduce((sum, booking) => {
    return sum + booking.payments.reduce((paymentSum, payment) => paymentSum + payment.amount, 0);
  }, 0);
  
  const avgPartySize = popularTimes.reduce((sum, booking) => sum + booking.partySize, 0) / popularTimes.length;
  
  return {
    statusCounts,
    totalRevenue,
    avgPartySize: Math.round(avgPartySize * 100) / 100,
    totalBookings: popularTimes.length,
  };
}

async function sendStatusChangeNotification(booking: any, newStatus: string): Promise<void> {
  let message = '';
  
  switch (newStatus) {
    case 'CONFIRMED':
      message = `Your booking at ${booking.restaurant.name} has been confirmed.`;
      break;
    case 'CANCELLED':
      message = `Your booking at ${booking.restaurant.name} has been cancelled.`;
      break;
    case 'COMPLETED':
      message = `Thank you for dining at ${booking.restaurant.name}! We hope you enjoyed your experience.`;
      break;
    case 'NO_SHOW':
      message = `We noticed you didn't make it to your reservation at ${booking.restaurant.name}.`;
      break;
    default:
      return;
  }
  
  await notificationService.sendNotification({
    userId: booking.userId,
    type: newStatus === 'CONFIRMED' ? 'BOOKING_CONFIRMATION' : 'BOOKING_CANCELLED',
    title: `Booking ${newStatus}`,
    message,
    channel: 'all',
    metadata: {
      bookingId: booking.id,
      restaurantName: booking.restaurant.name,
      status: newStatus,
    }
  });
  
  // Also send real-time notification
  socketManager.notifyUser(booking.userId, 'booking:status_updated', {
    bookingId: booking.id,
    status: newStatus,
    message,
  });
}
