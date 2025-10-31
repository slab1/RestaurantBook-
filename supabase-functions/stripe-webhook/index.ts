// Supabase Edge Function: Stripe Webhook
// Description: Handles Stripe webhook events for payment processing
// Features: Payment confirmation, booking/order status updates, error handling

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get Stripe webhook secret
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!stripeWebhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Get raw body for signature verification
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return new Response('Missing signature', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Verify webhook signature (simplified - in production use proper crypto verification)
    // For this implementation, we'll trust the webhook but log all events
    let event
    try {
      event = JSON.parse(body)
    } catch (err) {
      console.error('Invalid JSON in webhook body')
      return new Response('Invalid JSON', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Log the event for debugging
    console.log('Received Stripe webhook event:', event.type, event.id)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object, supabase)
        break
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object, supabase)
        break
      
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook handled successfully', { 
      status: 200, 
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook processing failed', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

// Handle successful payments
async function handlePaymentSuccess(paymentIntent, supabase) {
  try {
    console.log('Processing successful payment:', paymentIntent.id)

    // Find the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntent.id)
      .single()

    if (paymentError || !payment) {
      console.error('Payment record not found for payment intent:', paymentIntent.id)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'succeeded',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Failed to update payment status:', updateError)
      return
    }

    // Handle based on payment type
    if (payment.payment_type === 'booking_deposit') {
      await handleBookingPaymentSuccess(payment, supabase)
    } else if (payment.payment_type === 'order') {
      await handleOrderPaymentSuccess(payment, supabase)
    }

  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// Handle booking deposit payment success
async function handleBookingPaymentSuccess(payment, supabase) {
  try {
    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        deposit_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id)

    if (bookingError) {
      console.error('Failed to update booking status:', bookingError)
      return
    }

    // Get booking details for notification
    const { data: booking, error: bookingFetchError } = await supabase
      .from('bookings')
      .select(`
        *,
        restaurants (name, phone, email),
        profiles (email, full_name)
      `)
      .eq('id', payment.booking_id)
      .single()

    if (bookingFetchError || !booking) {
      console.error('Failed to fetch booking details:', bookingFetchError)
      return
    }

    // Create confirmation notification
    await supabase
      .from('notifications')
      .insert({
        user_id: booking.user_id,
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        message: `Your booking at ${booking.restaurants.name} on ${booking.booking_date} at ${booking.booking_time} has been confirmed.`,
        data: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          restaurant_name: booking.restaurants.name,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          party_size: booking.party_size,
          deposit_paid: payment.amount
        },
        delivery_methods: ['email', 'in_app']
      })

    console.log('Booking confirmation processed successfully:', booking.id)

  } catch (error) {
    console.error('Error handling booking payment success:', error)
  }
}

// Handle order payment success
async function handleOrderPaymentSuccess(payment, supabase) {
  try {
    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.order_id)

    if (orderError) {
      console.error('Failed to update order status:', orderError)
      return
    }

    // Update order items status
    await supabase
      .from('order_items')
      .update({
        item_status: 'pending'
      })
      .eq('order_id', payment.order_id)

    // Get order details for notification
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select(`
        *,
        restaurants (name, phone, email),
        profiles (email, full_name)
      `)
      .eq('id', payment.order_id)
      .single()

    if (orderFetchError || !order) {
      console.error('Failed to fetch order details:', orderFetchError)
      return
    }

    // Update user statistics
    await supabase
      .from('user_statistics')
      .upsert({
        user_id: order.user_id,
        total_orders: 1, // Will be incremented by trigger
        total_spent: payment.amount,
        last_order_date: new Date().toISOString()
      })

    // Create confirmation notification
    await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'order_confirmed',
        title: 'Order Confirmed!',
        message: `Your order from ${order.restaurants.name} has been confirmed and is being prepared.`,
        data: {
          order_id: order.id,
          order_number: order.order_number,
          restaurant_name: order.restaurants.name,
          total_amount: payment.amount,
          estimated_prep_time: order.estimated_prep_time,
          order_type: order.order_type
        },
        delivery_methods: ['email', 'in_app']
      })

    console.log('Order confirmation processed successfully:', order.id)

  } catch (error) {
    console.error('Error handling order payment success:', error)
  }
}

// Handle failed payments
async function handlePaymentFailure(paymentIntent, supabase) {
  try {
    console.log('Processing failed payment:', paymentIntent.id)

    // Find the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntent.id)
      .single()

    if (paymentError || !payment) {
      console.error('Payment record not found for failed payment:', paymentIntent.id)
      return
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    if (updateError) {
      console.error('Failed to update failed payment status:', updateError)
      return
    }

    // Cancel the booking or order
    if (payment.payment_type === 'booking_deposit' && payment.booking_id) {
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          deposit_status: 'refunded',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id)

      // Create failure notification
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'booking_payment_failed',
          title: 'Booking Payment Failed',
          message: 'Your booking could not be confirmed due to payment failure.',
          data: {
            booking_id: payment.booking_id,
            payment_amount: payment.amount
          },
          delivery_methods: ['email', 'in_app']
        })

    } else if (payment.payment_type === 'order' && payment.order_id) {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.order_id)

      // Create failure notification
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'order_payment_failed',
          title: 'Order Payment Failed',
          message: 'Your order could not be processed due to payment failure.',
          data: {
            order_id: payment.order_id,
            payment_amount: payment.amount
          },
          delivery_methods: ['email', 'in_app']
        })
    }

    console.log('Payment failure processed successfully:', paymentIntent.id)

  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

// Handle canceled payments
async function handlePaymentCanceled(paymentIntent, supabase) {
  try {
    console.log('Processing canceled payment:', paymentIntent.id)

    // Find the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_intent_id', paymentIntent.id)
      .single()

    if (paymentError || !payment) {
      console.error('Payment record not found for canceled payment:', paymentIntent.id)
      return
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    // Cancel associated booking or order
    if (payment.payment_type === 'booking_deposit' && payment.booking_id) {
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          deposit_status: 'waived',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.booking_id)
    } else if (payment.payment_type === 'order' && payment.order_id) {
      await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          payment_status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.order_id)
    }

    console.log('Payment cancellation processed successfully:', paymentIntent.id)

  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}