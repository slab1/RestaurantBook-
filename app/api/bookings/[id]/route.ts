import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { BookingStatus } from '@/lib/prisma'

// GET /api/bookings/[id] - Get booking details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
            stripePaymentId: true,
          },
        },
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check if user owns the booking or is restaurant owner/admin
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: booking.restaurantId },
      select: { ownerId: true },
    })

    const hasAccess = 
      booking.customerId === user.id ||
      restaurant?.ownerId === user.id ||
      user.role === 'ADMIN'

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Not authorized to view this booking' },
        { status: 403 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { status } = body

    if (!Object.values(BookingStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid booking status' },
        { status: 400 }
      )
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const canUpdate = 
      booking.customerId === user.id ||
      booking.restaurant.ownerId === user.id ||
      user.role === 'ADMIN'

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Not authorized to update this booking' },
        { status: 403 }
      )
    }

    // Customers can only cancel, restaurant owners can confirm/complete
    if (booking.customerId === user.id && status !== 'CANCELLED') {
      return NextResponse.json(
        { error: 'Customers can only cancel bookings' },
        { status: 403 }
      )
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
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

    return NextResponse.json({
      booking: updatedBooking,
      message: 'Booking updated successfully',
    })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth(request)

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        restaurant: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check authorization
    const canCancel = 
      booking.customerId === user.id ||
      booking.restaurant.ownerId === user.id ||
      user.role === 'ADMIN'

    if (!canCancel) {
      return NextResponse.json(
        { error: 'Not authorized to cancel this booking' },
        { status: 403 }
      )
    }

    await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({
      message: 'Booking cancelled successfully',
    })
  } catch (error) {
    console.error('Cancel booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}