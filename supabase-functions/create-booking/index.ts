// Supabase Edge Function: Create Booking
// Description: Handles restaurant booking creation with deposit payment
// Features: Table availability checking, booking creation, Stripe payment initiation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
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

    // Parse request body
    const requestData = await req.json()
    const {
      restaurant_id,
      booking_date,
      booking_time,
      party_size,
      special_requests,
      payment_method_id
    } = requestData

    // Validate required fields
    if (!restaurant_id || !booking_date || !booking_time || !party_size) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'MISSING_FIELDS', 
            message: 'Missing required booking fields' 
          } 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'No authorization header provided' 
          } 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'Invalid or expired token' 
          } 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check restaurant exists and is active
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurant_id)
      .eq('is_active', true)
      .single()

    if (restaurantError || !restaurant) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'RESTAURANT_NOT_FOUND', 
            message: 'Restaurant not found or inactive' 
          } 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check table availability for the requested time slot
    const { data: availableTables, error: tableError } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .eq('is_available', true)
      .gte('capacity', party_size)
      .order('capacity', { ascending: true })

    if (tableError || !availableTables || availableTables.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'NO_TABLES_AVAILABLE', 
            message: 'No tables available for the requested party size' 
          } 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for existing bookings at the same time
    const { data: existingBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('restaurant_id', restaurant_id)
      .eq('booking_date', booking_date)
      .eq('booking_time', booking_time)
      .eq('status', 'confirmed')

    if (bookingError) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'BOOKING_CHECK_FAILED', 
            message: 'Failed to check existing bookings' 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find available table (first fit)
    const bookedTableIds = existingBookings.map(b => b.table_id)
    const availableTable = availableTables.find(t => !bookedTableIds.includes(t.id))

    if (!availableTable) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'TIME_SLOT_UNAVAILABLE', 
            message: 'No tables available at the requested time' 
          } 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user already has a booking for this time
    const { data: userBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .eq('booking_date', booking_date)
      .eq('booking_time', booking_time)
      .eq('status', 'confirmed')

    if (userBookings && userBookings.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'DUPLICATE_BOOKING', 
            message: 'You already have a booking at this time' 
          } 
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'STRIPE_NOT_CONFIGURED', 
            message: 'Payment processing not available' 
          } 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create booking in pending status
    const { data: newBooking, error: createError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        restaurant_id: restaurant_id,
        table_id: availableTable.id,
        booking_date: booking_date,
        booking_time: booking_time,
        party_size: party_size,
        special_requests: special_requests,
        status: 'pending',
        deposit_amount: 20.00,
        deposit_status: 'pending'
      })
      .select()
      .single()

    if (createError || !newBooking) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'BOOKING_CREATION_FAILED', 
            message: 'Failed to create booking' 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Payment Intent for deposit
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: '2000', // $20.00 in cents
        currency: 'usd',
        customer: user.id, // Use user ID as customer
        'metadata[booking_id]': newBooking.id,
        'metadata[restaurant_name]': restaurant.name,
        'metadata[booking_date]': booking_date,
        'metadata[booking_time]': booking_time,
        'metadata[party_size]': party_size.toString(),
        'description': `Booking deposit for ${restaurant.name} on ${booking_date} at ${booking_time} for ${party_size} people`,
        'automatic_payment_methods[enabled]': 'true'
      })
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      console.error('Stripe payment intent creation failed:', error)
      
      // Delete the pending booking if payment setup fails
      await supabase.from('bookings').delete().eq('id', newBooking.id)
      
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'PAYMENT_SETUP_FAILED', 
            message: 'Failed to setup payment' 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripeResponse.json()

    // Record payment in database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        booking_id: newBooking.id,
        payment_intent_id: paymentIntent.id,
        amount: 20.00,
        currency: 'USD',
        payment_type: 'booking_deposit',
        status: 'pending',
        metadata: {
          restaurant_name: restaurant.name,
          booking_date: booking_date,
          booking_time: booking_time,
          party_size: party_size
        }
      })

    if (paymentError) {
      console.error('Failed to record payment:', paymentError)
      // Continue anyway - payment intent was created
    }

    // Return booking details and payment client secret
    const response = {
      data: {
        booking: {
          id: newBooking.id,
          booking_reference: newBooking.booking_reference,
          restaurant_name: restaurant.name,
          restaurant_image: restaurant.image_url,
          booking_date: newBooking.booking_date,
          booking_time: newBooking.booking_time,
          party_size: newBooking.party_size,
          special_requests: newBooking.special_requests,
          status: newBooking.status,
          deposit_amount: newBooking.deposit_amount,
          deposit_status: newBooking.deposit_status,
          table_info: {
            table_number: availableTable.table_number,
            capacity: availableTable.capacity,
            location: availableTable.location
          }
        },
        payment: {
          client_secret: paymentIntent.client_secret,
          amount: 20.00,
          currency: 'USD'
        },
        next_steps: {
          payment_required: true,
          confirmation_required: true,
          instructions: 'Please complete the deposit payment to confirm your booking'
        }
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    
    const errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating the booking'
      }
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})