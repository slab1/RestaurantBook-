import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiResponse, errorResponse, authenticateToken } from '@/lib/middleware';
import { notificationService } from '@/lib/notifications';
import { socketManager } from '@/lib/socket';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createWaitlistSchema = z.object({
  restaurantId: z.string().cuid(),
  partySize: z.number().min(1).max(20),
  preferredTime: z.string().datetime(),
  notes: z.string().optional(),
  notifyByPhone: z.boolean().default(true),
  notifyByEmail: z.boolean().default(true),
});

const updateWaitlistSchema = z.object({
  status: z.enum(['WAITING', 'SEATED', 'CANCELLED', 'EXPIRED']),
  estimatedWait: z.number().optional(),
  notes: z.string().optional(),
});

// GET /api/waitlist - Get user's waitlist entries or restaurant's waitlist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    const whereClause: any = {};
    
    if (restaurantId) {
      // Check if user owns the restaurant
      const restaurant = await prisma.restaurant.findFirst({
        where: { id: restaurantId, ownerId: auth.user.userId },
      });
      
      if (!restaurant && auth.user.role !== 'ADMIN') {
        return errorResponse('Unauthorized', 403);
      }
      
      whereClause.restaurantId = restaurantId;
    } else {
      // Get user's own waitlist entries
      whereClause.userId = auth.user.userId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const [entries, total] = await Promise.all([
      prisma.waitlistEntry.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          },
          restaurant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.waitlistEntry.count({ where: whereClause })
    ]);
    
    // Add position in queue for each entry
    const entriesWithPosition = entries.map((entry, index) => ({
      ...entry,
      position: (page - 1) * limit + index + 1,
    }));
    
    return apiResponse({
      entries: entriesWithPosition,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
    
  } catch (error) {
    logger.error('Get waitlist error:', error);
    return errorResponse('Failed to get waitlist', 500, error);
  }
}

// POST /api/waitlist - Join waitlist
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    const body = await request.json();
    const data = createWaitlistSchema.parse(body);
    
    // Check if restaurant exists and is active
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        id: data.restaurantId,
        isActive: true,
      }
    });
    
    if (!restaurant) {
      return errorResponse('Restaurant not found or inactive', 404);
    }
    
    // Check if user is already on waitlist for this restaurant
    const existingEntry = await prisma.waitlistEntry.findFirst({
      where: {
        userId: auth.user.userId,
        restaurantId: data.restaurantId,
        status: 'WAITING',
      }
    });
    
    if (existingEntry) {
      return errorResponse('Already on waitlist for this restaurant', 400);
    }
    
    // Calculate estimated wait time
    const queueLength = await prisma.waitlistEntry.count({
      where: {
        restaurantId: data.restaurantId,
        status: 'WAITING',
      }
    });
    
    const estimatedWait = Math.max(15, queueLength * 20); // 20 minutes per party ahead
    
    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        userId: auth.user.userId,
        restaurantId: data.restaurantId,
        partySize: data.partySize,
        preferredTime: new Date(data.preferredTime),
        estimatedWait,
        notes: data.notes,
        notifyByPhone: data.notifyByPhone,
        notifyByEmail: data.notifyByEmail,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
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
          }
        }
      }
    });
    
    // Send confirmation notification
    await notificationService.sendNotification({
      userId: auth.user.userId,
      type: 'WAITLIST_AVAILABLE',
      title: 'Waitlist Confirmation',
      message: `You've been added to the waitlist at ${restaurant.name}. Estimated wait: ${estimatedWait} minutes.`,
      channel: 'all',
      metadata: {
        restaurantName: restaurant.name,
        estimatedWait,
        position: queueLength + 1,
      }
    });
    
    // Notify restaurant via Socket.IO
    socketManager.notifyRestaurant(data.restaurantId, 'waitlist:new', {
      entry,
      message: `New waitlist entry: ${entry.user.firstName} ${entry.user.lastName}`,
    });
    
    return apiResponse({
      entry,
      position: queueLength + 1,
      estimatedWait,
    }, 201);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid request data', 400, error.errors);
    }
    
    logger.error('Create waitlist entry error:', error);
    return errorResponse('Failed to join waitlist', 500, error);
  }
}

// PUT /api/waitlist/[id] - Update waitlist entry
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    
    if (!entryId) {
      return errorResponse('Entry ID required', 400);
    }
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    const body = await request.json();
    const data = updateWaitlistSchema.parse(body);
    
    // Get the entry
    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: {
        user: true,
        restaurant: true,
      }
    });
    
    if (!entry) {
      return errorResponse('Waitlist entry not found', 404);
    }
    
    // Check permissions
    const canUpdate = 
      entry.userId === auth.user.userId || 
      entry.restaurant.ownerId === auth.user.userId ||
      auth.user.role === 'ADMIN';
    
    if (!canUpdate) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Update entry
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id: entryId },
      data: {
        status: data.status,
        estimatedWait: data.estimatedWait,
        notes: data.notes,
        ...(data.status === 'SEATED' && { notifiedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            id: true,
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
    
    // Send notifications based on status change
    if (data.status === 'SEATED') {
      await notificationService.sendWaitlistNotification(
        entry.userId,
        {
          restaurantName: entry.restaurant.name,
          entryId: entry.id,
        }
      );
      
      // Notify user via Socket.IO
      socketManager.notifyUser(entry.userId, 'waitlist:table_available', {
        restaurantName: entry.restaurant.name,
        message: 'Your table is ready!',
      });
    }
    
    return apiResponse(updatedEntry);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Invalid request data', 400, error.errors);
    }
    
    logger.error('Update waitlist entry error:', error);
    return errorResponse('Failed to update waitlist entry', 500, error);
  }
}

// DELETE /api/waitlist/[id] - Remove from waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    
    if (!entryId) {
      return errorResponse('Entry ID required', 400);
    }
    
    const auth = await authenticateToken(request);
    if (!auth.authenticated) {
      return errorResponse('Authentication required', 401);
    }
    
    // Get the entry
    const entry = await prisma.waitlistEntry.findUnique({
      where: { id: entryId },
      include: { restaurant: true },
    });
    
    if (!entry) {
      return errorResponse('Waitlist entry not found', 404);
    }
    
    // Check permissions
    const canDelete = 
      entry.userId === auth.user.userId || 
      entry.restaurant.ownerId === auth.user.userId ||
      auth.user.role === 'ADMIN';
    
    if (!canDelete) {
      return errorResponse('Unauthorized', 403);
    }
    
    // Delete entry
    await prisma.waitlistEntry.delete({
      where: { id: entryId },
    });
    
    return apiResponse({ message: 'Removed from waitlist successfully' });
    
  } catch (error) {
    logger.error('Delete waitlist entry error:', error);
    return errorResponse('Failed to remove from waitlist', 500, error);
  }
}
