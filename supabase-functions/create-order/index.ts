// Supabase Edge Function: Create Order
// Description: Handles order creation from cart items with Stripe payment processing
// Features: Cart validation, order creation, payment processing, inventory management

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
      cart_items,
      order_type = 'dine_in',
      special_instructions,
      delivery_address,
      tip_amount = 0,
      payment_method_id
    } = requestData

    // Validate required fields
    if (!restaurant_id || !cart_items || !Array.isArray(cart_items) || cart_items.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'MISSING_FIELDS', 
            message: 'Restaurant ID and cart items are required' 
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

    // Validate restaurant exists and is active
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

    // Validate and fetch menu items
    const menuItemIds = cart_items.map(item => item.menu_item_id)
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .in('id', menuItemIds)
      .eq('restaurant_id', restaurant_id)
      .eq('is_available', true)

    if (menuError || !menuItems || menuItems.length !== cart_items.length) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'INVALID_MENU_ITEMS', 
            message: 'Some menu items are invalid or unavailable' 
          } 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate order totals
    let subtotal = 0
    const orderItems = []
    const taxRate = 0.08 // 8% tax rate
    
    for (const cartItem of cart_items) {
      const menuItem = menuItems.find(mi => mi.id === cartItem.menu_item_id)
      if (!menuItem) {
        return new Response(
          JSON.stringify({ 
            error: { 
              code: 'MENU_ITEM_NOT_FOUND', 
              message: `Menu item ${cartItem.menu_item_id} not found` 
            } 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const quantity = parseInt(cartItem.quantity) || 1
      const unitPrice = parseFloat(menuItem.price)
      const totalPrice = unitPrice * quantity
      
      subtotal += totalPrice
      
      orderItems.push({
        menu_item_id: menuItem.id,
        quantity: quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        special_instructions: cartItem.special_instructions || null
      })
    }

    // Calculate additional fees
    const taxAmount = subtotal * taxRate
    const serviceFee = subtotal * 0.035 // 3.5% service fee
    const deliveryFee = order_type === 'delivery' ? 5.00 : 0 // $5 delivery fee
    const totalAmount = subtotal + taxAmount + serviceFee + parseFloat(tip_amount) + deliveryFee

    // Validate order amount (minimum $5.00)
    if (totalAmount < 5.00) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'MINIMUM_ORDER_NOT_MET', 
            message: 'Minimum order amount is $5.00' 
          } 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Estimate preparation time
    const maxPrepTime = Math.max(...orderItems.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id)
      return menuItem?.preparation_time || 20 // Default 20 minutes
    }))
    const estimatedPrepTime = maxPrepTime + (order_type === 'delivery' ? 15 : 0) // Add 15 min for delivery

    // Check rate limiting (max 5 orders per hour per user)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())

    if (recentOrders && recentOrders.length >= 5) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'Too many orders. Please wait before placing another order.' 
          } 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Create order in pending status
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        restaurant_id: restaurant_id,
        order_type: order_type,
        subtotal: subtotal,
        tax_amount: taxAmount,
        service_fee: serviceFee,
        tip_amount: parseFloat(tip_amount),
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        special_instructions: special_instructions,
        estimated_prep_time: estimatedPrepTime,
        delivery_address: order_type === 'delivery' ? delivery_address : null,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError || !newOrder) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'ORDER_CREATION_FAILED', 
            message: 'Failed to create order' 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: newOrder.id
    }))

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId)

    if (orderItemsError) {
      // Clean up order if order items creation fails
      await supabase.from('orders').delete().eq('id', newOrder.id)
      
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'ORDER_ITEMS_CREATION_FAILED', 
            message: 'Failed to create order items' 
          } 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Stripe Payment Intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(totalAmount * 100).toString(), // Convert to cents
        currency: 'usd',
        customer: user.id,
        'metadata[order_id]': newOrder.id,
        'metadata[restaurant_name]': restaurant.name,
        'metadata[order_type]': order_type,
        'description': `Order from ${restaurant.name} - Order #${newOrder.order_number}`,
        'automatic_payment_methods[enabled]': 'true'
      })
    })

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text()
      console.error('Stripe payment intent creation failed:', error)
      
      // Clean up order if payment setup fails
      await supabase.from('order_items').delete().eq('order_id', newOrder.id)
      await supabase.from('orders').delete().eq('id', newOrder.id)
      
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
        order_id: newOrder.id,
        payment_intent_id: paymentIntent.id,
        amount: totalAmount,
        currency: 'USD',
        payment_type: 'order',
        status: 'pending',
        metadata: {
          restaurant_name: restaurant.name,
          order_type: order_type,
          subtotal: subtotal,
          tax_amount: taxAmount,
          service_fee: serviceFee,
          tip_amount: tip_amount,
          delivery_fee: deliveryFee
        }
      })

    if (paymentError) {
      console.error('Failed to record payment:', paymentError)
      // Continue anyway - payment intent was created
    }

    // Get menu item details for response
    const menuItemsForResponse = menuItems.map(menuItem => {
      const cartItem = cart_items.find(ci => ci.menu_item_id === menuItem.id)
      return {
        id: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        image_url: menuItem.image_url,
        quantity: parseInt(cartItem?.quantity) || 1,
        special_instructions: cartItem?.special_instructions || null
      }
    })

    // Return order details and payment client secret
    const response = {
      data: {
        order: {
          id: newOrder.id,
          order_number: newOrder.order_number,
          restaurant_name: restaurant.name,
          restaurant_image: restaurant.image_url,
          order_type: newOrder.order_type,
          status: newOrder.status,
          payment_status: newOrder.payment_status,
          items: menuItemsForResponse,
          totals: {
            subtotal: subtotal,
            tax_amount: taxAmount,
            service_fee: serviceFee,
            tip_amount: parseFloat(tip_amount),
            delivery_fee: deliveryFee,
            total_amount: totalAmount
          },
          estimated_prep_time: newOrder.estimated_prep_time,
          delivery_address: newOrder.delivery_address,
          special_instructions: newOrder.special_instructions,
          created_at: newOrder.created_at
        },
        payment: {
          client_secret: paymentIntent.client_secret,
          amount: totalAmount,
          currency: 'USD'
        },
        next_steps: {
          payment_required: true,
          confirmation_required: true,
          instructions: 'Please complete payment to confirm your order'
        }
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Order creation error:', error)
    
    const errorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating the order'
      }
    }

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})