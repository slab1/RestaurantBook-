// Restaurant Order Creation with Stripe Payment
// Handles cart conversion to order with full payment processing

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
            orderType,
            cartItems,
            specialInstructions,
            deliveryAddress,
            deliveryPhone,
            tipAmount = 0
        } = await req.json();

        console.log('[Order] Request received:', { restaurantId, orderType, itemCount: cartItems?.length });

        // Validate required fields
        if (!restaurantId || !orderType || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Missing required order fields');
        }

        if (!['dine_in', 'takeout', 'delivery'].includes(orderType)) {
            throw new Error('Invalid order type');
        }

        if (orderType === 'delivery' && (!deliveryAddress || !deliveryPhone)) {
            throw new Error('Delivery address and phone required for delivery orders');
        }

        // Validate cart items
        for (const item of cartItems) {
            if (!item.menuItemId || !item.quantity || !item.price || !item.name) {
                throw new Error('Invalid cart item structure');
            }
            if (item.quantity <= 0) {
                throw new Error('Cart item quantity must be positive');
            }
        }

        // Get environment variables
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        if (!stripeSecretKey) {
            throw new Error('Stripe configuration missing');
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
        const userEmail = userData.email;
        console.log('[Order] User authenticated:', userId);

        // Verify restaurant exists
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
        console.log('[Order] Restaurant validated:', restaurant.name);

        // Verify all menu items exist and are available
        const menuItemIds = cartItems.map(item => item.menuItemId);
        const menuItemsResponse = await fetch(
            `${supabaseUrl}/rest/v1/menu_items?id=in.(${menuItemIds.join(',')})&restaurant_id=eq.${restaurantId}&is_available=eq.true&select=*`,
            {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            }
        );

        const menuItems = await menuItemsResponse.json();
        if (!menuItems || menuItems.length !== cartItems.length) {
            throw new Error('Some menu items are not available');
        }

        // Create menu item lookup map
        const menuItemMap = {};
        menuItems.forEach(item => {
            menuItemMap[item.id] = item;
        });

        console.log('[Order] Menu items validated');

        // Calculate order totals
        let subtotal = 0;
        for (const cartItem of cartItems) {
            const menuItem = menuItemMap[cartItem.menuItemId];
            if (!menuItem) {
                throw new Error(`Menu item ${cartItem.menuItemId} not found`);
            }
            // Verify price matches (prevent client-side tampering)
            if (Math.abs(menuItem.price - cartItem.price) > 0.01) {
                throw new Error('Price mismatch detected');
            }
            subtotal += menuItem.price * cartItem.quantity;
        }

        const taxRate = 0.08; // 8% tax
        const taxAmount = subtotal * taxRate;
        const deliveryFee = orderType === 'delivery' ? 5.00 : 0;
        const totalAmount = subtotal + taxAmount + deliveryFee + tipAmount;

        console.log('[Order] Calculated totals:', { subtotal, taxAmount, deliveryFee, tipAmount, totalAmount });

        // Generate order number
        const orderNumber = `ORD${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Create Stripe payment intent
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(totalAmount * 100).toString());
        stripeParams.append('currency', 'usd');
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[order_number]', orderNumber);
        stripeParams.append('metadata[restaurant_name]', restaurant.name);
        stripeParams.append('metadata[user_email]', userEmail);
        stripeParams.append('metadata[order_type]', orderType);
        stripeParams.append('metadata[item_count]', cartItems.length.toString());

        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        if (!stripeResponse.ok) {
            const errorText = await stripeResponse.text();
            console.error('[Order] Stripe error:', errorText);
            throw new Error(`Stripe payment creation failed: ${errorText}`);
        }

        const paymentIntent = await stripeResponse.json();
        console.log('[Order] Payment intent created:', paymentIntent.id);

        // Create order record
        const estimatedReadyTime = new Date();
        estimatedReadyTime.setMinutes(estimatedReadyTime.getMinutes() + (orderType === 'dine_in' ? 30 : 45));

        const orderData = {
            order_number: orderNumber,
            user_id: userId,
            restaurant_id: restaurantId,
            order_type: orderType,
            status: 'pending',
            subtotal: subtotal,
            tax_amount: taxAmount,
            delivery_fee: deliveryFee,
            tip_amount: tipAmount,
            total_amount: totalAmount,
            payment_method: 'card',
            payment_status: 'pending',
            payment_id: paymentIntent.id,
            special_instructions: specialInstructions,
            delivery_address: deliveryAddress,
            delivery_phone: deliveryPhone,
            estimated_ready_time: estimatedReadyTime.toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error('[Order] Failed to create order:', errorText);
            
            // Cancel payment intent if order creation fails
            try {
                await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log('[Order] Payment intent cancelled');
            } catch (cancelError) {
                console.error('[Order] Failed to cancel payment intent:', cancelError);
            }
            
            throw new Error(`Failed to create order: ${errorText}`);
        }

        const orders = await orderResponse.json();
        const order = orders[0];
        console.log('[Order] Order created:', order.id);

        // Create order items
        const orderItems = cartItems.map(item => {
            const menuItem = menuItemMap[item.menuItemId];
            return {
                order_id: order.id,
                menu_item_id: item.menuItemId,
                quantity: item.quantity,
                unit_price: menuItem.price,
                subtotal: menuItem.price * item.quantity,
                special_instructions: item.specialInstructions || null,
                created_at: new Date().toISOString()
            };
        });

        const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderItems)
        });

        if (!orderItemsResponse.ok) {
            const errorText = await orderItemsResponse.text();
            console.error('[Order] Failed to create order items:', errorText);
        } else {
            console.log('[Order] Order items created');
        }

        // Create payment record
        const paymentData = {
            user_id: userId,
            restaurant_id: restaurantId,
            order_id: order.id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: totalAmount,
            currency: 'usd',
            payment_type: 'order',
            status: 'pending',
            payment_method: 'card',
            metadata: {
                order_number: orderNumber,
                order_type: orderType,
                item_count: cartItems.length
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        console.log('[Order] Payment record created');

        // Create notification
        const notificationData = {
            user_id: userId,
            type: 'order_status',
            title: 'Order Received',
            message: `Your order from ${restaurant.name} has been received and is pending payment.`,
            link: `/orders/${order.id}`,
            read: false,
            email_sent: false,
            metadata: {
                order_id: order.id,
                order_number: orderNumber,
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

        console.log('[Order] Notification created');

        // Update user statistics
        await fetch(`${supabaseUrl}/rest/v1/user_statistics?user_id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                total_orders: 1,
                last_order_date: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
        });

        const result = {
            data: {
                order: {
                    id: order.id,
                    orderNumber: orderNumber,
                    status: order.status,
                    totalAmount: totalAmount,
                    restaurantName: restaurant.name,
                    estimatedReadyTime: estimatedReadyTime.toISOString()
                },
                payment: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    amount: totalAmount
                }
            }
        };

        console.log('[Order] Success');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Order] Error:', error);

        const errorResponse = {
            error: {
                code: 'ORDER_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
