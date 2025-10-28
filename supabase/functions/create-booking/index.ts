// Restaurant Booking Creation with Stripe Payment
// Handles booking creation, table assignment, and deposit payment

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const {
            restaurantId,
            bookingDate,
            bookingTime,
            partySize,
            tablePreference,
            specialOccasion,
            specialRequests,
            guestName,
            guestEmail,
            guestPhone,
            dietaryRequirements,
            accessibilityNeeds,
            requiresDeposit = false
        } = await req.json();

        console.log('[Booking] Request received:', { restaurantId, bookingDate, partySize, requiresDeposit });

        // Validate required fields
        if (!restaurantId || !bookingDate || !bookingTime || !partySize || !guestName || !guestEmail || !guestPhone) {
            throw new Error('Missing required booking fields');
        }

        if (partySize < 1 || partySize > 20) {
            throw new Error('Party size must be between 1 and 20');
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('Authorization required');
        }

        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authentication token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        console.log('[Booking] User authenticated:', userId);

        // Check restaurant exists and is active
        const restaurantResponse = await fetch(
            `${supabaseUrl}/rest/v1/restaurants?id=eq.${restaurantId}&status=eq.active&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const restaurants = await restaurantResponse.json();
        if (!restaurants || restaurants.length === 0) {
            throw new Error('Restaurant not found or inactive');
        }

        const restaurant = restaurants[0];
        console.log('[Booking] Restaurant validated:', restaurant.name);

        // Check availability for the requested date/time
        const slotResponse = await fetch(
            `${supabaseUrl}/rest/v1/booking_slots?restaurant_id=eq.${restaurantId}&slot_date=eq.${bookingDate}&slot_time=eq.${bookingTime}&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const slots = await slotResponse.json();
        const slot = slots && slots.length > 0 ? slots[0] : null;

        if (!slot || slot.status === 'full' || slot.status === 'blocked') {
            throw new Error('Selected time slot is not available');
        }

        if (slot.available_capacity - slot.booked_capacity < partySize) {
            throw new Error('Not enough capacity for party size');
        }

        console.log('[Booking] Availability confirmed');

        // Generate booking reference
        const bookingReference = `BK${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Calculate deposit if required (large parties 8+, or special occasions)
        let depositAmount = 0;
        if (requiresDeposit || partySize >= 8 || specialOccasion) {
            if (partySize >= 12) {
                depositAmount = 200;
            } else if (partySize >= 8) {
                depositAmount = 100;
            } else if (specialOccasion) {
                depositAmount = 50;
            }
        }

        console.log('[Booking] Deposit calculated:', depositAmount);

        // Create booking record
        const bookingData = {
            booking_reference: bookingReference,
            user_id: userId,
            restaurant_id: restaurantId,
            booking_date: bookingDate,
            booking_time: bookingTime,
            party_size: partySize,
            table_preference: tablePreference,
            special_occasion: specialOccasion,
            special_requests: specialRequests,
            guest_name: guestName,
            guest_email: guestEmail,
            guest_phone: guestPhone,
            dietary_requirements: dietaryRequirements,
            accessibility_needs: accessibilityNeeds,
            status: depositAmount > 0 ? 'pending' : 'confirmed',
            deposit_amount: depositAmount,
            deposit_paid: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const bookingResponse = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(bookingData)
        });

        if (!bookingResponse.ok) {
            const errorText = await bookingResponse.text();
            console.error('[Booking] Failed to create booking:', errorText);
            throw new Error(`Failed to create booking: ${errorText}`);
        }

        const bookings = await bookingResponse.json();
        const booking = bookings[0];
        console.log('[Booking] Booking created:', booking.id);

        // Update booking slot capacity
        const updatedBookedCapacity = slot.booked_capacity + partySize;
        const updatedStatus = updatedBookedCapacity >= slot.available_capacity ? 'full' : 
                             updatedBookedCapacity > slot.available_capacity * 0.8 ? 'limited' : 'available';

        await fetch(`${supabaseUrl}/rest/v1/booking_slots?id=eq.${slot.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                booked_capacity: updatedBookedCapacity,
                status: updatedStatus,
                updated_at: new Date().toISOString()
            })
        });

        console.log('[Booking] Slot capacity updated');

        // Create Stripe payment intent if deposit required
        let paymentIntent = null;
        if (depositAmount > 0 && stripeSecretKey) {
            const stripeParams = new URLSearchParams();
            stripeParams.append('amount', Math.round(depositAmount * 100).toString());
            stripeParams.append('currency', 'usd');
            stripeParams.append('payment_method_types[]', 'card');
            stripeParams.append('metadata[booking_id]', booking.id);
            stripeParams.append('metadata[booking_reference]', bookingReference);
            stripeParams.append('metadata[restaurant_name]', restaurant.name);
            stripeParams.append('metadata[guest_email]', guestEmail);
            stripeParams.append('metadata[party_size]', partySize.toString());
            stripeParams.append('metadata[booking_date]', bookingDate);
            stripeParams.append('metadata[booking_time]', bookingTime);

            const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stripeSecretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: stripeParams.toString()
            });

            if (stripeResponse.ok) {
                paymentIntent = await stripeResponse.json();
                console.log('[Booking] Payment intent created:', paymentIntent.id);

                // Update booking with payment intent
                await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${booking.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        payment_id: paymentIntent.id
                    })
                });
            } else {
                console.error('[Booking] Failed to create payment intent');
            }
        }

        // Create confirmation notification
        const notificationData = {
            user_id: userId,
            type: 'booking_confirmation',
            title: 'Booking Confirmation',
            message: `Your reservation at ${restaurant.name} for ${partySize} guests on ${bookingDate} at ${bookingTime} has been ${depositAmount > 0 ? 'reserved pending deposit payment' : 'confirmed'}.`,
            link: `/bookings/${booking.id}`,
            read: false,
            email_sent: false,
            metadata: {
                booking_id: booking.id,
                booking_reference: bookingReference,
                restaurant_name: restaurant.name
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

        console.log('[Booking] Notification created');

        // Update user statistics
        await fetch(`${supabaseUrl}/rest/v1/user_statistics?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                total_bookings: 1,
                last_booking_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        const result = {
            data: {
                booking: {
                    id: booking.id,
                    reference: bookingReference,
                    status: booking.status,
                    depositAmount: depositAmount,
                    restaurantName: restaurant.name
                },
                payment: paymentIntent ? {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    amount: depositAmount
                } : null
            }
        };

        console.log('[Booking] Success');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Booking] Error:', error);

        const errorResponse = {
            error: {
                code: 'BOOKING_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
