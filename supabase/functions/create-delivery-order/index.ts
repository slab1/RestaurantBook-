// Create Delivery Order Edge Function
// Simulates delivery order creation with mock platform integration

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { restaurantId, items, deliveryAddress, userId, platform } = await req.json();

    // Validate required fields
    if (!restaurantId || !items || !deliveryAddress || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate order totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    const deliveryFee = 5.00; // Mock delivery fee
    const tax = subtotal * 0.075; // 7.5% VAT (Nigerian rate)
    const platformFee = subtotal * 0.05; // 5% platform fee
    const totalAmount = subtotal + deliveryFee + tax + platformFee;

    // Generate order number
    const orderNumber = `DLV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create mock order object
    const order = {
      id: crypto.randomUUID(),
      orderNumber,
      userId,
      restaurantId,
      platform: platform || 'uber_eats',
      platformOrderId: `MOCK-${crypto.randomUUID()}`,
      orderType: 'delivery',
      deliveryAddress,
      items,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      tax: tax.toFixed(2),
      platformFee: platformFee.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      status: 'pending',
      estimatedPreparationTime: 20, // 20 minutes
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes from now
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
      tracking: {
        status: 'waiting_for_restaurant',
        estimatedArrival: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      }
    };

    // In a real implementation, this would save to database
    // For demo, we return the mock order
    
    return new Response(
      JSON.stringify({ 
        success: true,
        order,
        message: 'Order created successfully (Demo Mode - No real delivery platform integration)'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
