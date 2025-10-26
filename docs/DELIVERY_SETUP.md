# Delivery Platform Integration - Installation Guide

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Existing Next.js 14 application with Prisma

## Step 1: Install Dependencies

```bash
# Socket.IO for real-time tracking
pnpm add socket.io socket.io-client

# Required for existing features (if not already installed)
pnpm add next-auth @prisma/client
pnpm add -D prisma

# Types
pnpm add -D @types/node
```

## Step 2: Update Prisma Schema

The delivery platform models have been added to your Prisma schema. Run the migration:

```bash
npx prisma migrate dev --name add_delivery_platform_integration
npx prisma generate
```

## Step 3: Seed Delivery Platforms

Create and run the seed script to populate delivery platforms:

```bash
node scripts/seed-delivery-platforms.js
```

## Step 4: Configure Environment Variables

Add these to your `.env` file:

```bash
# Uber Eats (Sandbox for testing)
UBER_EATS_API_KEY=your_api_key_here
UBER_EATS_CLIENT_ID=your_client_id_here
UBER_EATS_API_ENDPOINT=https://api.uber.com/v2/eats
UBER_EATS_WEBHOOK_SECRET=your_webhook_secret

# DoorDash (Sandbox for testing)
DOORDASH_DEVELOPER_ID=your_developer_id_here
DOORDASH_KEY_ID=your_key_id_here
DOORDASH_API_ENDPOINT=https://openapi.doordash.com
DOORDASH_WEBHOOK_SECRET=your_webhook_secret

# Grubhub (Sandbox for testing)
GRUBHUB_API_KEY=your_api_key_here
GRUBHUB_API_SECRET=your_api_secret_here
GRUBHUB_API_ENDPOINT=https://api.grubhub.com
GRUBHUB_WEBHOOK_SECRET=your_webhook_secret

# Payment Gateways (Nigerian)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 5: Initialize WebSocket Server

Update your `server.ts` or create a custom server file:

```typescript
// server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initializeWebSocket } from './lib/delivery/websocket-service';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket
  initializeWebSocket(server);

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
```

Update your `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node --project tsconfig.server.json server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node --project tsconfig.server.json server.ts"
  }
}
```

## Step 6: Test the Integration

### Test Order Creation

```bash
curl -X POST http://localhost:3000/api/delivery/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "restaurantId": "your_restaurant_id",
    "orderType": "delivery",
    "items": [
      {
        "menuItemId": "item_id",
        "name": "Jollof Rice",
        "quantity": 2,
        "price": 2500
      }
    ],
    "deliveryAddress": {
      "street": "123 Lagos Street",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001",
      "country": "NG"
    },
    "contactPhone": "+234 801 234 5678",
    "contactName": "John Doe",
    "autoSelectPlatform": true
  }'
```

### Test WebSocket Connection

```javascript
// test-websocket.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  path: '/api/socket',
});

socket.on('connect', () => {
  console.log('Connected to tracking service');
  
  socket.emit('track-order', {
    orderId: 'your_order_id',
    userId: 'your_user_id',
  });
});

socket.on('tracking-update', (data) => {
  console.log('Tracking update:', data);
});

socket.on('tracking-error', (error) => {
  console.error('Error:', error);
});
```

## Step 7: Access the Dashboards

### Restaurant Dashboard
Navigate to: `http://localhost:3000/dashboard/delivery`

Add this route to your app:
```tsx
// app/dashboard/delivery/page.tsx
import RestaurantDeliveryDashboard from '@/components/delivery/RestaurantDeliveryDashboard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DeliveryDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get user's restaurant
  const restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!restaurant) {
    return <div>No restaurant found</div>;
  }

  return <RestaurantDeliveryDashboard restaurantId={restaurant.id} />;
}
```

### Customer Tracking
Navigate to: `http://localhost:3000/orders/[orderId]/track`

Add this route:
```tsx
// app/orders/[orderId]/track/page.tsx
import CustomerDeliveryTracking from '@/components/delivery/CustomerDeliveryTracking';

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  return <CustomerDeliveryTracking orderId={params.orderId} />;
}
```

## Step 8: Connect to Delivery Platforms

### 1. Sign up for Platform APIs

- **Uber Eats**: https://developer.uber.com/
- **DoorDash**: https://developer.doordash.com/
- **Grubhub**: https://developer.grubhub.com/

### 2. Get API Credentials

Each platform will provide:
- API Key/Developer ID
- Client ID/Key ID
- Webhook Secret

### 3. Test in Sandbox Mode

All platforms provide sandbox environments for testing. Use sandbox credentials during development.

### 4. Connect Restaurant

Use the restaurant dashboard or API:

```bash
curl -X POST http://localhost:3000/api/delivery/platforms/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "restaurantId": "your_restaurant_id",
    "platformName": "uber_eats",
    "credentials": {
      "name": "My Restaurant",
      "address": "123 Street",
      "phone": "+234 801 234 5678",
      "cuisine": ["Nigerian"],
      "hours": {}
    }
  }'
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
npx prisma studio

# Reset database if needed
npx prisma migrate reset
```

### WebSocket Not Connecting
- Ensure custom server is running
- Check CORS configuration
- Verify port is not in use

### Payment Integration Issues
- Verify API keys are correct
- Check webhook URLs
- Test with sandbox credentials first

### Platform API Errors
- Check API credentials
- Verify endpoint URLs
- Review platform status pages
- Check rate limits

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Use production API credentials
3. Configure SSL certificates
4. Set up webhook endpoints with HTTPS
5. Configure database connection pooling

### Security Checklist

- [ ] All API keys stored as environment variables
- [ ] Webhook signatures validated
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Authentication on all routes
- [ ] Database backups configured

### Monitoring

Set up monitoring for:
- Order creation failures
- Payment processing errors
- WebSocket connection drops
- API rate limit warnings
- Database performance

## Support

For issues or questions:
1. Check the documentation: `/docs/DELIVERY_INTEGRATION.md`
2. Review API logs
3. Test with sandbox credentials
4. Contact platform support

## Next Steps

1. ✅ Complete installation
2. ✅ Test order creation
3. ✅ Test tracking
4. ✅ Test payments
5. ✅ Connect to platforms
6. ✅ Configure webhooks
7. ✅ Deploy to production
8. ✅ Monitor performance

Happy delivering! 🚀
