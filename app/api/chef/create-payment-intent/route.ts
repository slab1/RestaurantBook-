import { NextRequest, NextResponse } from 'next/server'

// POST /api/chef/create-payment-intent - Create payment intent (DEMO MODE)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount, currency = 'ngn' } = body

    // DEMO MODE: Return mock payment intent
    // In production, this would use Stripe API
    const mockPaymentIntent = {
      id: `pi_demo_${Date.now()}`,
      client_secret: `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(amount * 100), // Convert to kobo
      currency: currency.toLowerCase(),
      status: 'requires_payment_method',
      metadata: {
        bookingId,
        type: 'chef_booking_deposit',
      },
    }

    return NextResponse.json({
      success: true,
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
      demoMode: true,
      message: 'This is a demo payment intent. In production, this would connect to Stripe.',
    })
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
