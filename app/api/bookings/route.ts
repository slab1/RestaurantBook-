import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { bookingSchema } from '@/lib/validations'
import { NotificationService } from '@/lib/external-apis'
import { formatDate, formatTime, generateBookingConfirmationNumber } from '@/lib/utils'

// GET /api/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {
      customerId: user.id,
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            imageUrl: true,
          },
        },
        table: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        date: 'desc',
      },
    })

    const total = await prisma.booking.count({ where })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Check if restaurant exists and is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.restaurantId },
      include: {
        tables: true,
        operatingHours: true,
      },
    })

    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurant not found or not available' },
        { status: 404 }
      )
    }

    // Check if table exists and is available (if specified)
    if (validatedData.tableId) {
      const table = restaurant.tables.find(t => t.id === validatedData.tableId)
      if (!table || !table.isAvailable) {
        return NextResponse.json(
          { error: 'Table not found or not available' },
          { status: 400 }
        )
      }
    }

    // Check for existing booking conflicts
    const existingBooking = await prisma.booking.findFirst({
      where: {
        restaurantId: validatedData.restaurantId,
        tableId: validatedData.tableId,
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Time slot not available' },
        { status: 400 }
      )
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        customerId: user.id,
        status: 'PENDING',
      },
      include: {
        restaurant: {
          select: {
            name: true,
            address: true,
            phone: true,
          },
        },
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        table: {
          select: {
            name: true,
            capacity: true,
          },
        },
      },
    })

    // Send confirmation notifications
    await sendBookingNotifications(booking, 'created')

    return NextResponse.json({
      booking,
      message: 'Booking created successfully',
    })
  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function sendBookingNotifications(booking: any, action: 'created' | 'updated' | 'cancelled') {
  try {
    const confirmationNumber = generateBookingConfirmationNumber()
    const bookingDate = formatDate(booking.date)
    const bookingTime = formatTime(booking.time)
    
    const emailSubject = `Booking ${action === 'created' ? 'Confirmation' : action === 'updated' ? 'Updated' : 'Cancelled'}`
    
    const emailContent = `
      <h2>${emailSubject}</h2>
      <p>Dear ${booking.customer.firstName} ${booking.customer.lastName},</p>
      <p>Your booking has been ${action}:</p>
      <ul>
        <li><strong>Restaurant:</strong> ${booking.restaurant.name}</li>
        <li><strong>Date:</strong> ${bookingDate}</li>
        <li><strong>Time:</strong> ${bookingTime}</li>
        <li><strong>Party Size:</strong> ${booking.partySize}</li>
        <li><strong>Table:</strong> ${booking.table?.name || 'To be assigned'}</li>
        <li><strong>Confirmation Number:</strong> ${confirmationNumber}</li>
      </ul>
      <p><strong>Restaurant Details:</strong></p>
      <ul>
        <li><strong>Address:</strong> ${booking.restaurant.address}</li>
        <li><strong>Phone:</strong> ${booking.restaurant.phone}</li>
      </ul>
      ${booking.specialNotes ? `<p><strong>Special Notes:</strong> ${booking.specialNotes}</p>` : ''}
    `
    
    const smsMessage = `Booking ${action} at ${booking.restaurant.name} on ${bookingDate} at ${bookingTime}. Confirmation: ${confirmationNumber}. Address: ${booking.restaurant.address}`

    // Send email
    await NotificationService.sendEmail({
      to: booking.customer.email,
      subject: emailSubject,
      html: emailContent,
    })

    // Send SMS if phone number is available
    if (booking.customer.phone) {
      await NotificationService.sendSMS({
        to: booking.customer.phone,
        message: smsMessage,
      })
    }
  } catch (error) {
    console.error('Notification sending error:', error)
    // Don't throw error as booking was successful
  }
}