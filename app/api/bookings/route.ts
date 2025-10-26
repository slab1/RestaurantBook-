import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, BookingStatus, UserRole } from '@prisma/client'
import { AuthService, RoleService } from '@/lib/auth'
import { validateSchema, BookingCreateSchema, BookingSearchSchema } from '@/lib/validation'
import { logger, loggers } from '@/lib/logger'
import { NotificationService } from '@/lib/external-apis'
import { cookies } from 'next/headers'
import { addMinutes, format } from 'date-fns'

const prisma = new PrismaClient()

// Generate unique confirmation code
function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Calculate loyalty points earned
function calculateLoyaltyPoints(amount: number, rate: number = 0.01): number {
  return Math.floor(amount * rate * 100) // Convert to points
}

// Get authenticated user
async function getAuthenticatedUser(request: NextRequest) {
  const cookieStore = cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) {
    throw new Error('Authentication required')
  }

  const payload = AuthService.verifyToken(accessToken)
  if (!payload) {
    throw new Error('Invalid or expired token')
  }

  return payload
}

// CREATE booking
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    // Get request body
    const body = await request.json()

    // Validate input
    const validatedData = validateSchema(BookingCreateSchema, body)

    // Check permissions
    RoleService.requirePermission(user.role, 'booking:write')

    // Get restaurant details
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.restaurantId },
      include: {
        tables: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    if (!restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurant is currently not accepting bookings' },
        { status: 400 }
      )
    }

    // Check if restaurant is open at requested time
    const bookingDay = format(validatedData.bookingTime, 'EEEE').toLowerCase()
    const operatingHours = restaurant.operatingHours as any
    const dayHours = operatingHours[bookingDay]

    if (dayHours?.closed) {
      return NextResponse.json(
        { error: 'Restaurant is closed on the requested day' },
        { status: 400 }
      )
    }

    // Find available table if not specified
    let tableId = validatedData.tableId
    if (!tableId) {
      const availableTables = restaurant.tables.filter(table => 
        table.capacity >= validatedData.partySize &&
        table.isActive &&
        (!table.maxCapacity || validatedData.partySize <= table.maxCapacity)
      )

      if (availableTables.length === 0) {
        return NextResponse.json(
          { error: 'No available tables for the requested party size' },
          { status: 400 }
        )
      }

      // Check table availability at requested time
      const bookingStart = validatedData.bookingTime
      const bookingEnd = addMinutes(bookingStart, validatedData.estimatedDuration || restaurant.averageSeatingTime)

      for (const table of availableTables) {
        const conflictingBookings = await prisma.booking.findMany({
          where: {
            tableId: table.id,
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
            },
            AND: [
              {
                bookingTime: {
                  lt: bookingEnd,
                }
              },
              {
                bookingTime: {
                  gte: addMinutes(bookingStart, -(validatedData.estimatedDuration || restaurant.averageSeatingTime)),
                }
              }
            ]
          },
        })

        if (conflictingBookings.length === 0) {
          tableId = table.id
          break
        }
      }

      if (!tableId) {
        // Add to waitlist instead
        const waitlistEntry = await prisma.waitlistEntry.create({
          data: {
            userId: user.userId,
            restaurantId: validatedData.restaurantId,
            partySize: validatedData.partySize,
            preferredTime: validatedData.bookingTime,
            notes: validatedData.specialRequests,
          },
        })

        return NextResponse.json({
          success: false,
          message: 'No tables available at the requested time. You have been added to the waitlist.',
          waitlistEntry: {
            id: waitlistEntry.id,
            estimatedWait: 30, // Default estimate
          },
        }, { status: 200 })
      }
    }

    // Verify table exists and is available
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    })

    if (!table || !table.isActive) {
      return NextResponse.json(
        { error: 'Selected table is not available' },
        { status: 400 }
      )
    }

    if (table.capacity < validatedData.partySize) {
      return NextResponse.json(
        { error: 'Selected table cannot accommodate the party size' },
        { status: 400 }
      )
    }

    // Check user's loyalty points if they want to use them
    if (validatedData.loyaltyPointsToUse > 0) {
      const userProfile = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { loyaltyPoints: true },
      })

      if (!userProfile || userProfile.loyaltyPoints < validatedData.loyaltyPointsToUse) {
        return NextResponse.json(
          { error: 'Insufficient loyalty points' },
          { status: 400 }
        )
      }
    }

    // Create booking
    const confirmationCode = generateConfirmationCode()
    const loyaltyPointsEarned = restaurant.loyaltyProgram ? 
      calculateLoyaltyPoints(restaurant.depositAmount || 0, restaurant.loyaltyRate) : 0

    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        restaurantId: validatedData.restaurantId,
        tableId: tableId,
        bookingTime: validatedData.bookingTime,
        partySize: validatedData.partySize,
        specialRequests: validatedData.specialRequests,
        notes: validatedData.notes,
        eventType: validatedData.eventType,
        dietaryRestrictions: validatedData.dietaryRestrictions || [],
        seatingPreference: validatedData.seatingPreference,
        isRecurring: validatedData.isRecurring,
        recurringPattern: validatedData.recurringPattern || null,
        confirmationCode,
        estimatedDuration: validatedData.estimatedDuration || restaurant.averageSeatingTime,
        loyaltyPointsUsed: validatedData.loyaltyPointsToUse,
        loyaltyPointsEarned,
        status: restaurant.depositRequired ? BookingStatus.PENDING : BookingStatus.CONFIRMED,
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        table: {
          select: {
            number: true,
            capacity: true,
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    // Update user loyalty points
    if (validatedData.loyaltyPointsToUse > 0 || loyaltyPointsEarned > 0) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          loyaltyPoints: {
            increment: loyaltyPointsEarned - validatedData.loyaltyPointsToUse,
          },
        },
      })

      // Create loyalty transactions
      if (validatedData.loyaltyPointsToUse > 0) {
        await prisma.loyaltyTransaction.create({
          data: {
            userId: user.userId,
            type: 'REDEEMED',
            points: -validatedData.loyaltyPointsToUse,
            description: `Redeemed for booking ${confirmationCode}`,
          },
        })
      }

      if (loyaltyPointsEarned > 0) {
        await prisma.loyaltyTransaction.create({
          data: {
            userId: user.userId,
            type: 'EARNED',
            points: loyaltyPointsEarned,
            description: `Earned from booking ${confirmationCode}`,
          },
        })
      }
    }

    // Create recurring bookings if needed
    let recurringBookings: any[] = []
    if (validatedData.isRecurring && validatedData.recurringPattern) {
      // Implementation for recurring bookings would go here
      // This is complex and would need careful scheduling logic
    }

    // Send confirmation notification
    try {
      await NotificationService.sendEmail({
        to: booking.user.email,
        subject: `Booking Confirmation - ${booking.restaurant.name}`,
        templateId: 'booking_confirmation',
        templateData: {
          customerName: `${booking.user.firstName} ${booking.user.lastName}`,
          restaurantName: booking.restaurant.name,
          bookingDate: format(booking.bookingTime, 'EEEE, MMMM do, yyyy'),
          bookingTime: format(booking.bookingTime, 'h:mm a'),
          partySize: booking.partySize,
          tableNumber: booking.table.number,
          confirmationCode: booking.confirmationCode,
          restaurantAddress: booking.restaurant.address,
          restaurantPhone: booking.restaurant.phone,
          specialRequests: booking.specialRequests,
        },
      })

      // Send SMS if phone number is available
      if (booking.user.phone) {
        await NotificationService.sendSMS({
          to: booking.user.phone,
          message: `Booking confirmed at ${booking.restaurant.name} for ${format(booking.bookingTime, 'MMM do, h:mm a')}. Party of ${booking.partySize}. Confirmation: ${booking.confirmationCode}`,
        })
      }
    } catch (notificationError) {
      logger.warn('Notification sending failed', {
        bookingId: booking.id,
        error: notificationError,
      })
    }

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        event: 'booking_created',
        properties: {
          restaurant_id: booking.restaurantId,
          table_id: booking.tableId,
          party_size: booking.partySize,
          booking_time: booking.bookingTime.toISOString(),
          event_type: booking.eventType,
          loyalty_points_used: booking.loyaltyPointsUsed,
          loyalty_points_earned: booking.loyaltyPointsEarned,
          is_recurring: booking.isRecurring,
        },
        userId: user.userId,
        restaurantId: booking.restaurantId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    loggers.booking.created(booking.id, user.userId, booking.restaurantId)

    return NextResponse.json({
      success: true,
      message: restaurant.depositRequired ? 
        'Booking created! Please complete payment to confirm.' : 
        'Booking confirmed successfully!',
      booking: {
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        status: booking.status,
        bookingTime: booking.bookingTime,
        partySize: booking.partySize,
        estimatedDuration: booking.estimatedDuration,
        restaurant: {
          name: booking.restaurant.name,
          address: booking.restaurant.address,
        },
        table: {
          number: booking.table.number,
          capacity: booking.table.capacity,
        },
        loyaltyPointsUsed: booking.loyaltyPointsUsed,
        loyaltyPointsEarned: booking.loyaltyPointsEarned,
        requiresPayment: restaurant.depositRequired,
        depositAmount: restaurant.depositAmount,
      },
      recurringBookings,
    }, { status: 201 })

  } catch (error: any) {
    logger.error('Booking creation error', {
      error: error.message,
      stack: error.stack,
      userId: (request as any).user?.userId,
    })

    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Booking creation failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// GET bookings (search/list)
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    // Parse dates if present
    if (queryParams.startDate) {
      queryParams.startDate = new Date(queryParams.startDate)
    }
    if (queryParams.endDate) {
      queryParams.endDate = new Date(queryParams.endDate)
    }

    // Validate search parameters
    const validatedParams = validateSchema(BookingSearchSchema, queryParams)

    // Check permissions
    RoleService.requirePermission(user.role, 'booking:read')

    // Build where clause based on user role and filters
    let whereClause: any = {}

    // Role-based filtering
    if (user.role === UserRole.CUSTOMER) {
      whereClause.userId = user.userId
    } else if (user.role === UserRole.RESTAURANT_OWNER) {
      // Get restaurants owned by this user
      const ownedRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: user.userId },
        select: { id: true },
      })
      
      if (ownedRestaurants.length > 0) {
        whereClause.restaurantId = {
          in: ownedRestaurants.map(r => r.id),
        }
      } else {
        // No restaurants owned, return empty result
        return NextResponse.json({
          success: true,
          bookings: [],
          pagination: {
            page: validatedParams.page,
            limit: validatedParams.limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }
    // ADMIN can see all bookings (no additional filtering)

    // Apply search filters
    if (validatedParams.restaurantId) {
      whereClause.restaurantId = validatedParams.restaurantId
    }

    if (validatedParams.userId) {
      whereClause.userId = validatedParams.userId
    }

    if (validatedParams.status && validatedParams.status.length > 0) {
      whereClause.status = {
        in: validatedParams.status,
      }
    }

    if (validatedParams.dateRange) {
      whereClause.bookingTime = {
        gte: validatedParams.dateRange.startDate,
        lte: validatedParams.dateRange.endDate,
      }
    }

    if (validatedParams.eventType) {
      whereClause.eventType = validatedParams.eventType
    }

    // Calculate pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Get total count
    const total = await prisma.booking.count({ where: whereClause })

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            coverImage: true,
            cuisine: true,
            priceRange: true,
            rating: true,
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
            shape: true,
            isOutdoor: true,
            hasView: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
      skip,
      take: validatedParams.limit,
      orderBy: {
        [validatedParams.sortBy || 'bookingTime']: validatedParams.sortOrder,
      },
    })

    const totalPages = Math.ceil(total / validatedParams.limit)

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total,
        totalPages,
        hasNext: validatedParams.page < totalPages,
        hasPrev: validatedParams.page > 1,
      },
    })

  } catch (error: any) {
    logger.error('Booking search error', {
      error: error.message,
      stack: error.stack,
    })

    if (error.message.includes('Authentication required') || 
        error.message.includes('Invalid or expired token')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (error.message.includes('Insufficient permissions')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.issues 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Booking search failed',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use /api/bookings/[id] for updates.' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use /api/bookings/[id] for deletion.' },
    { status: 405 }
  )
}
