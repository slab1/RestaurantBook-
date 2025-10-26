// Seed Delivery Platforms Edge Function
// Initializes default delivery platform configurations

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const platforms = [
      {
        id: 'uber-eats-001',
        name: 'uber_eats',
        displayName: 'Uber Eats',
        type: 'UBER_EATS',
        apiEndpoint: 'https://api.uber.com/v1/eats',
        commissionRate: 15.0,
        supportedCountries: ['NG', 'US', 'GB', 'CA', 'AU'],
        isActive: true,
        description: 'Food delivery platform by Uber',
        features: ['real_time_tracking', 'scheduled_orders', 'contactless_delivery'],
        avgDeliveryTime: 35, // minutes
        coverageAreas: ['Lagos', 'Abuja', 'Port Harcourt'],
        config: {
          webhookUrl: '/api/webhooks/uber-eats',
          supportEmail: 'support@ubereats.com',
          apiVersion: 'v1'
        }
      },
      {
        id: 'doordash-001',
        name: 'doordash',
        displayName: 'DoorDash',
        type: 'DOORDASH',
        apiEndpoint: 'https://openapi.doordash.com/drive/v2',
        commissionRate: 18.0,
        supportedCountries: ['NG', 'US', 'CA'],
        isActive: true,
        description: 'On-demand local logistics platform',
        features: ['dasher_tracking', 'scheduled_delivery', 'bulk_orders'],
        avgDeliveryTime: 40, // minutes
        coverageAreas: ['Lagos', 'Abuja'],
        config: {
          webhookUrl: '/api/webhooks/doordash',
          supportEmail: 'support@doordash.com',
          apiVersion: 'v2'
        }
      },
      {
        id: 'grubhub-001',
        name: 'grubhub',
        displayName: 'Grubhub',
        type: 'GRUBHUB',
        apiEndpoint: 'https://api.grubhub.com/v1',
        commissionRate: 20.0,
        supportedCountries: ['NG', 'US'],
        isActive: true,
        description: 'Restaurant delivery and pickup service',
        features: ['group_ordering', 'scheduled_orders', 'corporate_accounts'],
        avgDeliveryTime: 38, // minutes
        coverageAreas: ['Lagos'],
        config: {
          webhookUrl: '/api/webhooks/grubhub',
          supportEmail: 'support@grubhub.com',
          apiVersion: 'v1'
        }
      }
    ];

    // In a real implementation, this would save to database
    // For demo, we return the platform configurations
    
    return new Response(
      JSON.stringify({ 
        success: true,
        platforms,
        message: 'Delivery platforms initialized (Demo Mode)',
        note: 'These are mock configurations. Real API integration requires valid credentials.'
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
