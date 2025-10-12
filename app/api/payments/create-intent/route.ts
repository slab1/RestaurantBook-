import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { StripeService } from '@/lib/external-apis'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const body = await request.json()
    const { bookingId, amount } = body

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: 'Booking ID and amount are required' },
        { status: 400 }
      )
    }

    // Verify booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        restaurant: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
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

    if (booking.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized for this booking' },
        { status: 403 }
      )
    }

    // Create Stripe customer if needed
    const customer = await StripeService.createCustomer({
      email: booking.customer.email,
      name: `${booking.customer.firstName} ${booking.customer.lastName}`,
    })

    // Create payment intent
    const paymentIntent = await StripeService.createPaymentIntent({
      amount,
      customerId: customer.id,
      metadata: {
        bookingId,
        restaurantName: booking.restaurant.name,
      },
    })

    // Create payment record
    await prisma.payment.create({
      data: {
        amount,
        stripePaymentId: paymentIntent.id,
        bookingId,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Create payment intent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}