// List Delivery Orders Edge Function
// Returns list of delivery orders for a user (Demo Mode)

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const restaurantId = url.searchParams.get('restaurantId');
    const status = url.searchParams.get('status');

    // Generate mock orders
    const mockOrders = [
      {
        id: crypto.randomUUID(),
        orderNumber: 'DLV-1730009890-ABC123',
        userId: userId || 'user-123',
        restaurantId: restaurantId || 'rest-001',
        platform: 'uber_eats',
        platformOrderId: 'UBER-789456',
        orderType: 'delivery',
        deliveryAddress: {
          street: '15 Admiralty Way',
          city: 'Lekki',
          state: 'Lagos',
          country: 'Nigeria',
          postcode: '101245'
        },
        items: [
          { name: 'Jollof Rice with Chicken', price: 3500, quantity: 2 },
          { name: 'Moi Moi', price: 500, quantity: 1 }
        ],
        subtotal: 7500,
        deliveryFee: 1000,
        tax: 562.50,
        platformFee: 375,
        totalAmount: 9437.50,
        status: 'delivered',
        estimatedDeliveryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actualDeliveryTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        orderNumber: 'DLV-1730009891-XYZ456',
        userId: userId || 'user-123',
        restaurantId: restaurantId || 'rest-002',
        platform: 'doordash',
        platformOrderId: 'DD-456789',
        orderType: 'delivery',
        deliveryAddress: {
          street: '42 Adeola Odeku Street',
          city: 'Victoria Island',
          state: 'Lagos',
          country: 'Nigeria',
          postcode: '101241'
        },
        items: [
          { name: 'Fried Rice & Turkey', price: 4500, quantity: 1 },
          { name: 'Chapman', price: 800, quantity: 2 }
        ],
        subtotal: 6100,
        deliveryFee: 800,
        tax: 457.50,
        platformFee: 305,
        totalAmount: 7662.50,
        status: 'in_transit',
        estimatedDeliveryTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        actualDeliveryTime: null,
        paymentStatus: 'paid',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: crypto.randomUUID(),
        orderNumber: 'DLV-1730009892-LMN789',
        userId: userId || 'user-123',
        restaurantId: restaurantId || 'rest-003',
        platform: 'grubhub',
        platformOrderId: 'GH-123456',
        orderType: 'delivery',
        deliveryAddress: {
          street: '28 Ogba Road',
          city: 'Ikeja',
          state: 'Lagos',
          country: 'Nigeria',
          postcode: '100271'
        },
        items: [
          { name: 'Pepper Soup (Goat Meat)', price: 5000, quantity: 1 },
          { name: 'Agege Bread', price: 400, quantity: 1 }
        ],
        subtotal: 5400,
        deliveryFee: 1200,
        tax: 405,
        platformFee: 270,
        totalAmount: 7275,
        status: 'pending',
        estimatedDeliveryTime: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
        actualDeliveryTime: null,
        paymentStatus: 'pending',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];

    // Filter by status if provided
    let filteredOrders = mockOrders;
    if (status) {
      filteredOrders = mockOrders.filter(order => order.status === status);
    }

    // Filter by restaurantId if provided
    if (restaurantId) {
      filteredOrders = filteredOrders.filter(order => order.restaurantId === restaurantId);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        orders: filteredOrders,
        total: filteredOrders.length,
        message: 'Demo Mode - Showing mock delivery orders'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
