// Track Delivery Edge Function
// Provides real-time tracking updates for delivery orders (Demo Mode)

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
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'Order ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate mock driver location (Lagos, Nigeria coordinates)
    const baseLat = 6.5244;
    const baseLng = 3.3792;
    const randomOffset = () => (Math.random() - 0.5) * 0.05; // ~5km radius

    // Mock tracking data
    const trackingData = {
      orderId,
      status: 'in_transit',
      driver: {
        name: 'Chukwudi Okafor',
        phone: '+234-xxx-xxxx',
        photo: 'https://ui-avatars.com/api/?name=Chukwudi+Okafor',
        rating: 4.8,
        vehicleType: 'motorcycle',
        vehiclePlate: 'LAG-123-AB'
      },
      currentLocation: {
        lat: baseLat + randomOffset(),
        lng: baseLng + randomOffset(),
        heading: Math.random() * 360,
        timestamp: new Date().toISOString()
      },
      estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
      distanceRemaining: 2.5, // km
      statusHistory: [
        {
          status: 'confirmed',
          timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          message: 'Restaurant confirmed your order'
        },
        {
          status: 'preparing',
          timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          message: 'Restaurant is preparing your food'
        },
        {
          status: 'ready_for_pickup',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          message: 'Order is ready for pickup'
        },
        {
          status: 'picked_up',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          message: 'Driver picked up your order'
        },
        {
          status: 'in_transit',
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          message: 'Driver is on the way to your location'
        }
      ],
      lastUpdate: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({ 
        success: true,
        tracking: trackingData,
        message: 'Demo Mode - Simulated tracking data'
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
