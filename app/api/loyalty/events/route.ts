import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { AuthService } from '@/lib/auth'
import { validateSchema, CuidSchema, PaginationSchema } from '@/lib/validation'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
const EventQuerySchema = PaginationSchema.extend({
  type: z.string().optional(),
  isActive: z.boolean().optional(),
  upcoming: z.boolean().optional(), // Only upcoming events
  dateRange: z.object({
    start: z.coerce.date(),
    end: z.coerce.date(),
  }).optional(),
})

const EventCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  type: z.enum([
    'BIRTHDAY',
    'ANNIVERSARY',
    'FESTIVAL',
    'HOLIDAY',
    'SPECIAL_PROMOTION',
    'NIGERIAN_CULTURAL',
    'SEASONAL',
  ]),
  date: z.coerce.date().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.object({
    frequency: z.enum(['YEARLY', 'MONTHLY', 'WEEKLY']),
    dayOfWeek: z.number().min(0).max(6).optional(),
    dayOfMonth: z.number().min(1).max(31).optional(),
    month: z.number().min(1).max(12).optional(),
  }).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  bonusPoints: z.number().int().min(0).max(10000).default(0),
  discount: z.number().min(0).max(100).optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
})

const EventUpdateSchema = EventCreateSchema.partial()

const UserEventParticipationSchema = z.object({
  eventId: z.string(),
  userId: z.string().optional(), // If not provided, uses authenticated user
  metadata: z.record(z.any()).optional(),
})

// Nigerian cultural events and holidays
const NIGERIAN_CULTURAL_EVENTS = [
  {
    name: 'Nigeria Independence Day',
    description: 'Celebrate Nigeria\'s independence with special rewards',
    type: 'NIGERIAN_CULTURAL',
    date: '10-01',
    isRecurring: true,
    bonusPoints: 2000,
    discount: 20,
    nigeriaSpecific: {
      culturalSignificance: 'Commemorating Nigeria\'s independence from British rule',
      traditionalActivities: ['Flag raising ceremonies', 'Cultural performances', 'Community gatherings'],
      foodSpecials: ['Jollof rice', 'Fried rice', 'Suya', 'Puff-puff'],
    },
  },
  {
    name: 'Eid al-Fitr Celebration',
    description: 'Celebrate the end of Ramadan with special rewards',
    type: 'FESTIVAL',
    isRecurring: true,
    bonusPoints: 1500,
    discount: 15,
    nigeriaSpecific: {
      culturalSignificance: 'Marks the end of Ramadan fasting',
      traditionalActivities: ['Community prayers', 'Feasting', 'Family gatherings'],
      foodSpecials: ['Tuwo shinkafa', 'Dawawa', 'Custard', 'Masa'],
    },
  },
  {
    name: 'Eid al-Adha Celebration',
    description: 'Celebrate the festival of sacrifice',
    type: 'FESTIVAL',
    isRecurring: true,
    bonusPoints: 1500,
    discount: 15,
    nigeriaSpecific: {
      culturalSignificance: 'Commemorates Ibrahim\'s willingness to sacrifice his son',
      traditionalActivities: ['Community prayers', 'Animal sacrifice', 'Charity'],
      foodSpecials: ['Tuwo masara', 'Tuwo shinkafa', 'Rice and stew'],
    },
  },
  {
    name: 'Christmas Celebration',
    description: 'Celebrate Christmas with Nigerian traditions',
    type: 'HOLIDAY',
    date: '12-25',
    isRecurring: true,
    bonusPoints: 2500,
    discount: 25,
    nigeriaSpecific: {
      culturalSignificance: 'Celebration of the birth of Jesus Christ',
      traditionalActivities: ['Carol singing', 'Family feasts', 'Gift exchange'],
      foodSpecials: ['Jollof rice', 'Fried rice', 'Chicken', 'Turkey', 'Fish pie'],
    },
  },
  {
    name: 'New Year Celebration',
    description: 'Start the new year with special rewards',
    type: 'HOLIDAY',
    date: '01-01',
    isRecurring: true,
    bonusPoints: 3000,
    discount: 30,
    nigeriaSpecific: {
      culturalSignificance: 'Beginning of a new Gregorian year',
      traditionalActivities: ['Countdown parties', 'Fireworks', 'Resolutions'],
      foodSpecials: ['Pepper soup', 'Small chops', 'Champagne', 'Wine'],
    },
  },
  {
    name: 'Children\'s Day',
    description: 'Celebrate Nigerian children',
    type: 'NIGERIAN_CULTURAL',
    date: '05-27',
    isRecurring: true,
    bonusPoints: 1000,
    discount: 10,
    nigeriaSpecific: {
      culturalSignificance: 'Dedicated to Nigerian children',
      traditionalActivities: ['School parades', 'Cultural displays', 'Games'],
      foodSpecials: ['Cakes', 'Ice cream', 'Snacks', 'Juices'],
    },
  },
  {
    name: ' Democracy Day',
    description: 'Celebrate Nigeria\'s democratic governance',
    type: 'NIGERIAN_CULTURAL',
    date: '06-12',
    isRecurring: true,
    bonusPoints: 1000,
    discount: 10,
    nigeriaSpecific: {
      culturalSignificance: 'Commemorates Nigeria\'s return to democratic rule',
      traditionalActivities: ['Ceremonies', 'Speeches', 'Cultural programs'],
      foodSpecials: ['Traditional Nigerian dishes'],
    },
  },
]

// GET /api/loyalty/events - Get loyalty events
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user (optional for browsing events)
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    let authPayload = null
    
    if (token) {
      authPayload = AuthService.verifyToken(token)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const queryData = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = validateSchema(EventQuerySchema, {
      ...queryData,
      page: queryData.page ? parseInt(queryData.page) : 1,
      limit: queryData.limit ? parseInt(queryData.limit) : 20,
    })

    // Build where clause
    const where: any = {}
    
    if (validatedQuery.type) {
      where.type = validatedQuery.type
    }
    
    if (validatedQuery.isActive !== undefined) {
      where.isActive = validatedQuery.isActive
    }
    
    if (validatedQuery.upcoming) {
      const now = new Date()
      where.OR = [
        { 
          AND: [
            { startDate: { lte: now } },
            { endDate: { gte: now } },
          ]
        },
        { 
          AND: [
            { startDate: null },
            { endDate: null },
          ]
        },
        {
          date: { gte: now }
        }
      ]
    }
    
    if (validatedQuery.dateRange) {
      where.OR = [
        {
          AND: [
            { startDate: { gte: validatedQuery.dateRange.start } },
            { startDate: { lte: validatedQuery.dateRange.end } },
          ]
        },
        {
          AND: [
            { endDate: { gte: validatedQuery.dateRange.start } },
            { endDate: { lte: validatedQuery.dateRange.end } },
          ]
        },
        {
          date: { gte: validatedQuery.dateRange.start }
        }
      ]
    }

    // Get events from database
    const [events, totalCount] = await Promise.all([
      prisma.loyaltyEvent.findMany({
        where,
        orderBy: [
          { startDate: 'asc' },
          { date: 'asc' },
        ],
        skip: (validatedQuery.page - 1) * validatedQuery.limit,
        take: validatedQuery.limit,
      }),
      prisma.loyaltyEvent.count({ where }),
    ])

    // Add Nigerian cultural context and user participation if authenticated
    const eventsWithContext = await Promise.all(events.map(async (event) => {
      let nigeriaContext = {}
      let userParticipation = null

      // Add Nigerian cultural context
      const culturalEvent = NIGERIAN_CULTURAL_EVENTS.find(
        ce => ce.name === event.name || ce.date === event.date?.toISOString().slice(5, 10)
      )
      
      if (culturalEvent) {
        nigeriaContext = {
          culturalSignificance: culturalEvent.nigeriaSpecific?.culturalSignificance,
          traditionalActivities: culturalEvent.nigeriaSpecific?.traditionalActivities,
          foodSpecials: culturalEvent.nigeriaSpecific?.foodSpecials,
          regionalCelebrations: [
            'Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Kaduna'
          ],
        }
      }

      // Get user participation if authenticated
      if (authPayload) {
        userParticipation = await getUserEventParticipation(authPayload.userId, event.id)
      }

      return {
        ...event,
        nigeriaContext,
        userParticipation,
        isActive: event.isActive,
        isCurrentlyActive: isEventCurrentlyActive(event),
        daysUntil: event.date ? Math.ceil((event.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null,
      }
    }))

    const pagination = {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      totalCount,
      totalPages: Math.ceil(totalCount / validatedQuery.limit),
      hasNext: validatedQuery.page < Math.ceil(totalCount / validatedQuery.limit),
      hasPrev: validatedQuery.page > 1,
    }

    logger.info('Loyalty events retrieved', {
      userId: authPayload?.userId,
      count: events.length,
      filters: validatedQuery,
    })

    return NextResponse.json({
      success: true,
      data: {
        events: eventsWithContext,
        pagination,
        nigeriaCulturalEvents: NIGERIAN_CULTURAL_EVENTS,
        eventTypes: [...new Set(NIGERIAN_CULTURAL_EVENTS.map(e => e.type))],
        upcomingCount: eventsWithContext.filter(e => e.daysUntil !== null && e.daysUntil > 0 && e.daysUntil <= 30).length,
      },
    })

  } catch (error: any) {
    logger.error('Error retrieving loyalty events', {
      error: error.message,
      stack: error.stack,
    })

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
        error: 'Failed to retrieve loyalty events',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// POST /api/loyalty/events - Create new event (Admin only) or participate in event
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const authPayload = AuthService.verifyToken(token)
    if (!authPayload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()
    
    // Check if this is participating in an event
    if (body.eventId) {
      return await participateInEvent(body, authPayload)
    }

    // Create new event (Admin only)
    if (authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    return await createEvent(body, authPayload)

  } catch (error: any) {
    logger.error('Error creating event or participating', {
      error: error.message,
      stack: error.stack,
    })

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
        error: 'Failed to process event request',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// Create new event
async function createEvent(body: any, authPayload: any) {
  const validatedData = validateSchema(EventCreateSchema, body)

  // Validate date range
  if (validatedData.startDate && validatedData.endDate && validatedData.startDate >= validatedData.endDate) {
    return NextResponse.json(
      { error: 'End date must be after start date' },
      { status: 400 }
    )
  }

  // Create event
  const event = await prisma.loyaltyEvent.create({
    data: {
      ...validatedData,
      date: validatedData.date || null,
    },
  })

  logger.info('Loyalty event created', {
    eventId: event.id,
    eventName: event.name,
    adminUserId: authPayload.userId,
  })

  return NextResponse.json({
    success: true,
    data: event,
    message: 'Loyalty event created successfully',
  }, { status: 201 })
}

// Participate in event
async function participateInEvent(body: any, authPayload: any) {
  const validatedData = validateSchema(UserEventParticipationSchema, body)
  const userId = validatedData.userId || authPayload.userId

  // Verify user has permission to participate (their own events or admin)
  if (userId !== authPayload.userId && authPayload.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }

  // Verify event exists
  const event = await prisma.loyaltyEvent.findUnique({
    where: { id: validatedData.eventId },
  })

  if (!event) {
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    )
  }

  // Check if event is currently active
  if (!isEventCurrentlyActive(event)) {
    return NextResponse.json(
      { error: 'Event is not currently active' },
      { status: 400 }
    )
  }

  // Check if user has already participated in this event
  const existingParticipation = await prisma.analyticsEvent.findFirst({
    where: {
      event: 'event_participation',
      userId: userId,
      properties: {
        path: ['eventId'],
        equals: validatedData.eventId,
      },
    },
  })

  if (existingParticipation) {
    return NextResponse.json(
      { error: 'Already participated in this event' },
      { status: 409 }
    )
  }

  // Award points and record participation atomically
  const result = await prisma.$transaction(async (tx) => {
    // Record participation
    const participation = await tx.analyticsEvent.create({
      data: {
        event: 'event_participation',
        userId: userId,
        properties: {
          eventId: validatedData.eventId,
          eventName: event.name,
          eventType: event.type,
          ...validatedData.metadata,
        },
        ipAddress: '0.0.0.0', // This should come from request in real implementation
        userAgent: 'loyalty-system',
      },
    })

    // Award bonus points if applicable
    let pointsAwarded = 0
    if (event.bonusPoints > 0) {
      // Create loyalty transaction
      await tx.loyaltyTransaction.create({
        data: {
          userId: userId,
          type: 'BONUS',
          points: event.bonusPoints,
          description: `Event participation: ${event.name}`,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        },
      })

      // Update user points
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: event.bonusPoints },
        },
      })

      pointsAwarded = event.bonusPoints
    }

    return { participation, pointsAwarded }
  })

  logger.info('User participated in event', {
    userId: userId,
    eventId: validatedData.eventId,
    eventName: event.name,
    pointsAwarded: result.pointsAwarded,
  })

  return NextResponse.json({
    success: true,
    data: {
      eventId: event.id,
      eventName: event.name,
      pointsAwarded: result.pointsAwarded,
      discountAvailable: event.discount,
      participationRecorded: true,
      nigeriaContext: {
        culturalCelebration: true,
        communityParticipation: true,
      },
    },
    message: `Successfully participated in ${event.name}! ${result.pointsAwarded > 0 ? `${result.pointsAwarded} points awarded.` : ''}`,
  }, { status: 201 })
}

// Helper functions
function isEventCurrentlyActive(event: any): boolean {
  const now = new Date()
  
  // Check if event has date-specific activation
  if (event.date) {
    const eventDate = new Date(event.date)
    eventDate.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return eventDate.getTime() === today.getTime() && event.isActive
  }
  
  // Check if event has date range activation
  if (event.startDate && event.endDate) {
    return now >= event.startDate && now <= event.endDate && event.isActive
  }
  
  // Event is always active if no specific dates
  return event.isActive
}

async function getUserEventParticipation(userId: string, eventId: string) {
  const participation = await prisma.analyticsEvent.findFirst({
    where: {
      event: 'event_participation',
      userId: userId,
      properties: {
        path: ['eventId'],
        equals: eventId,
      },
    },
  })

  return participation ? {
    participated: true,
    participatedAt: participation.createdAt,
  } : null
}

// Handle other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
