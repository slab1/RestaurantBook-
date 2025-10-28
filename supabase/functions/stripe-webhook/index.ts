// Stripe Webhook Handler
// Processes Stripe payment events and updates order/booking status

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const signature = req.headers.get('stripe-signature');
        const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // For webhook verification in production, implement signature validation
        // For now, we process the event directly
        const event = await req.json();

        console.log('[Webhook] Event received:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            case 'payment_intent.canceled':
                await handlePaymentCanceled(event.data.object, supabaseUrl, serviceRoleKey);
                break;
            
            default:
                console.log('[Webhook] Unhandled event type:', event.type);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Webhook] Error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'WEBHOOK_ERROR',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

async function handlePaymentSuccess(paymentIntent, supabaseUrl, serviceRoleKey) {
    console.log('[Webhook] Processing payment success:', paymentIntent.id);

    // Check if this is for an order or booking
    const metadata = paymentIntent.metadata;
    const isBooking = metadata.booking_id || metadata.booking_reference;
    const isOrder = metadata.order_number;

    if (isOrder) {
        // Update order payment status
        const ordersResponse = await fetch(
            `${supabaseUrl}/rest/v1/orders?payment_id=eq.${paymentIntent.id}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const orders = await ordersResponse.json();
        if (orders && orders.length > 0) {
            const order = orders[0];

            await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    payment_status: 'completed',
                    status: 'confirmed',
                    updated_at: new Date().toISOString()
                })
            });

            // Update payment record
            await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'succeeded',
                    receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
                    updated_at: new Date().toISOString()
                })
            });

            // Update user statistics
            await fetch(`${supabaseUrl}/rest/v1/user_statistics?user_id=eq.${order.user_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    total_spent: order.total_amount,
                    updated_at: new Date().toISOString()
                })
            });

            // Create payment confirmation notification
            const notificationData = {
                user_id: order.user_id,
                type: 'payment_confirmation',
                title: 'Payment Confirmed',
                message: `Your payment of $${order.total_amount.toFixed(2)} has been successfully processed. Your order is being prepared.`,
                link: `/orders/${order.id}`,
                read: false,
                email_sent: false,
                metadata: {
                    order_id: order.id,
                    order_number: order.order_number,
                    amount: order.total_amount
                },
                created_at: new Date().toISOString()
            };

            await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });

            console.log('[Webhook] Order payment processed successfully');
        }
    } else if (isBooking) {
        // Update booking deposit status
        const bookingId = metadata.booking_id;
        
        await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deposit_paid: true,
                status: 'confirmed',
                confirmed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        // Update payment record
        await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'succeeded',
                receipt_url: paymentIntent.charges?.data?.[0]?.receipt_url || null,
                updated_at: new Date().toISOString()
            })
        });

        // Get booking details for notification
        const bookingsResponse = await fetch(
            `${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const bookings = await bookingsResponse.json();
        if (bookings && bookings.length > 0) {
            const booking = bookings[0];

            // Create confirmation notification
            const notificationData = {
                user_id: booking.user_id,
                type: 'booking_confirmation',
                title: 'Booking Confirmed',
                message: `Your deposit payment has been processed. Your reservation for ${booking.party_size} guests on ${booking.booking_date} at ${booking.booking_time} is confirmed.`,
                link: `/bookings/${booking.id}`,
                read: false,
                email_sent: false,
                metadata: {
                    booking_id: booking.id,
                    booking_reference: booking.booking_reference
                },
                created_at: new Date().toISOString()
            };

            await fetch(`${supabaseUrl}/rest/v1/notifications`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notificationData)
            });
        }

        console.log('[Webhook] Booking deposit processed successfully');
    }
}

async function handlePaymentFailure(paymentIntent, supabaseUrl, serviceRoleKey) {
    console.log('[Webhook] Processing payment failure:', paymentIntent.id);

    // Update payment record
    await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'failed',
            updated_at: new Date().toISOString()
        })
    });

    // Update order status if applicable
    const ordersResponse = await fetch(
        `${supabaseUrl}/rest/v1/orders?payment_id=eq.${paymentIntent.id}&select=*`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    const orders = await ordersResponse.json();
    if (orders && orders.length > 0) {
        const order = orders[0];

        await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${order.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                payment_status: 'failed',
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
        });
    }
}

async function handlePaymentCanceled(paymentIntent, supabaseUrl, serviceRoleKey) {
    console.log('[Webhook] Processing payment cancellation:', paymentIntent.id);

    // Update payment record
    await fetch(`${supabaseUrl}/rest/v1/payments?stripe_payment_intent_id=eq.${paymentIntent.id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            status: 'cancelled',
            updated_at: new Date().toISOString()
        })
    });
}
