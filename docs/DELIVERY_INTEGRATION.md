# Delivery Platform Integration

Complete multi-platform delivery integration for restaurant booking system with real-time tracking, payment processing, and comprehensive management dashboards.

## 🚀 Features

### Multi-Platform Integration
- **Uber Eats**: Full API integration with order management and tracking
- **DoorDash**: DoorDash Drive API for delivery services
- **Grubhub**: Complete Grubhub API integration
- Smart platform selection based on cost and delivery time

### Real-time Tracking
- WebSocket-based live tracking
- Driver GPS location updates
- ETA calculations
- Interactive delivery progress

### Payment Integration
- **Paystack**: Nigerian payment gateway integration
- **Flutterwave**: Alternative payment processing
- Support for card, bank transfer, mobile money, USSD
- Automatic payment verification

### Restaurant Dashboard
- Real-time order management
- Multi-platform menu synchronization
- Order status updates
- Performance analytics
- Platform connection management

### Customer Experience
- Live delivery tracking
- Driver information
- Real-time status updates
- Order history
- Delivery feedback

## 📁 File Structure

```
/workspace
├── lib/delivery/
│   ├── types.ts                      # TypeScript interfaces and types
│   ├── base-platform-service.ts      # Abstract base class for platforms
│   ├── uber-eats-service.ts          # Uber Eats integration
│   ├── doordash-service.ts           # DoorDash integration
│   ├── grubhub-service.ts            # Grubhub integration
│   ├── unified-delivery-service.ts   # Multi-platform orchestration
│   ├── websocket-service.ts          # Real-time tracking service
│   └── index.ts                      # Main exports
│
├── app/api/delivery/
│   ├── orders/
│   │   ├── route.ts                  # Create/list orders
│   │   └── [id]/route.ts             # Get/update/cancel order
│   ├── tracking/
│   │   └── [orderId]/route.ts        # Real-time tracking data
│   ├── menu-sync/route.ts            # Menu synchronization
│   ├── platforms/route.ts            # Platform connections
│   ├── payment/route.ts              # Payment processing
│   └── analytics/route.ts            # Delivery analytics
│
├── components/delivery/
│   ├── RestaurantDeliveryDashboard.tsx  # Restaurant management UI
│   └── CustomerDeliveryTracking.tsx     # Customer tracking UI
│
└── prisma/schema.prisma              # Database models (8 new models)
```

## 🗄️ Database Models

### DeliveryPlatform
Stores delivery platform configurations (Uber Eats, DoorDash, Grubhub).

### RestaurantDeliveryPlatform
Manages restaurant connections to delivery platforms with sync status.

### DeliveryOrder
Complete order information with pricing, items, addresses, and status tracking.

### DeliveryTracking
Real-time tracking data including driver location, ETA, and status updates.

### DeliveryZone
Geographic delivery zones with pricing, distance limits, and time estimates.

### MenuSyncLog
Audit trail for menu synchronization operations across platforms.

### DeliveryFeedback
Customer ratings and feedback for delivery experience.

### DeliveryDriver
Driver information synchronized from delivery platforms.

## 🔌 API Endpoints

### Orders
```typescript
// Create new delivery order
POST /api/delivery/orders
Body: {
  restaurantId: string,
  platformType?: string,  // Optional, auto-selects if not provided
  orderType: 'pickup' | 'delivery',
  items: OrderItem[],
  deliveryAddress?: DeliveryAddress,
  tip?: number,
  autoSelectPlatform?: boolean
}

// Get user's delivery orders
GET /api/delivery/orders?restaurantId={id}&status={status}

// Get specific order
GET /api/delivery/orders/{id}

// Update order status (restaurant only)
PATCH /api/delivery/orders/{id}
Body: { status: string }

// Cancel order
DELETE /api/delivery/orders/{id}?reason={reason}
```

### Tracking
```typescript
// Get real-time tracking information
GET /api/delivery/tracking/{orderId}

// Returns: TrackingInfo with driver location, ETA, status
```

### Menu Synchronization
```typescript
// Sync menu to platforms
POST /api/delivery/menu-sync
Body: {
  restaurantId: string,
  platforms?: string[]  // Optional, syncs to all if not provided
}

// Get sync history
GET /api/delivery/menu-sync?restaurantId={id}
```

### Platform Management
```typescript
// Get available platforms
GET /api/delivery/platforms?restaurantId={id}

// Connect restaurant to platform
POST /api/delivery/platforms/connect
Body: {
  restaurantId: string,
  platformName: string,
  credentials: object
}
```

### Payment
```typescript
// Initiate payment
POST /api/delivery/payment
Body: {
  orderId: string,
  paymentMethod: string,
  provider: 'paystack' | 'flutterwave'
}

// Verify payment
PUT /api/delivery/payment
Body: {
  reference: string,
  provider: string
}
```

### Analytics
```typescript
// Get delivery analytics
GET /api/delivery/analytics?restaurantId={id}&startDate={date}&endDate={date}

// Returns comprehensive metrics including:
// - Total/active/completed orders
// - Revenue statistics
// - Platform breakdown
// - Status distribution
// - Daily trends
// - Customer satisfaction scores
```

## 🔧 Environment Variables

```bash
# Uber Eats
UBER_EATS_API_KEY=your_uber_eats_api_key
UBER_EATS_CLIENT_ID=your_client_id
UBER_EATS_API_ENDPOINT=https://api.uber.com/v2/eats
UBER_EATS_WEBHOOK_SECRET=your_webhook_secret

# DoorDash
DOORDASH_DEVELOPER_ID=your_developer_id
DOORDASH_KEY_ID=your_key_id
DOORDASH_API_ENDPOINT=https://openapi.doordash.com
DOORDASH_WEBHOOK_SECRET=your_webhook_secret

# Grubhub
GRUBHUB_API_KEY=your_api_key
GRUBHUB_API_SECRET=your_api_secret
GRUBHUB_API_ENDPOINT=https://api.grubhub.com
GRUBHUB_WEBHOOK_SECRET=your_webhook_secret

# Payment Gateways
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📱 Usage Examples

### Creating an Order
```typescript
import { createUnifiedDeliveryService } from '@/lib/delivery';

const deliveryService = createUnifiedDeliveryService();

// Smart platform selection
const { order, platform } = await deliveryService.createOrderSmart(
  {
    restaurantId: 'rest_123',
    userId: 'user_456',
    orderType: 'delivery',
    items: [
      {
        menuItemId: 'item_789',
        name: 'Jollof Rice',
        quantity: 2,
        price: 2500,
      },
    ],
    deliveryAddress: {
      street: '123 Lagos Street',
      city: 'Lagos',
      state: 'Lagos',
      zipCode: '100001',
      country: 'NG',
    },
    contactPhone: '+234 801 234 5678',
    contactName: 'John Doe',
  },
  ['uber_eats', 'doordash', 'grubhub']
);
```

### Real-time Tracking
```typescript
import { io } from 'socket.io-client';

const socket = io({ path: '/api/socket' });

socket.on('connect', () => {
  socket.emit('track-order', {
    orderId: 'order_123',
    userId: 'user_456',
  });
});

socket.on('tracking-update', (data) => {
  console.log('Location:', data.tracking.currentLocation);
  console.log('ETA:', data.tracking.estimatedArrival);
  console.log('Driver:', data.tracking.driver);
});
```

### Menu Synchronization
```typescript
// Sync to all connected platforms
const results = await deliveryService.syncMenuToAllPlatforms(
  restaurantId,
  menuCategories
);

// Sync to specific platforms
const results = await deliveryService.syncMenuToAllPlatforms(
  restaurantId,
  menuCategories,
  ['uber_eats', 'grubhub']
);
```

## 🎨 UI Components

### Restaurant Dashboard
```tsx
import RestaurantDeliveryDashboard from '@/components/delivery/RestaurantDeliveryDashboard';

<RestaurantDeliveryDashboard restaurantId="rest_123" />
```

Features:
- Live order monitoring
- Status update controls
- Platform connection status
- Performance metrics
- Menu sync controls

### Customer Tracking
```tsx
import CustomerDeliveryTracking from '@/components/delivery/CustomerDeliveryTracking';

<CustomerDeliveryTracking orderId="order_123" />
```

Features:
- Real-time delivery progress
- Driver information
- Live ETA updates
- Interactive status timeline
- Order details

## 🚦 Order Status Flow

```
pending → confirmed → preparing → ready → out_for_delivery → delivered
                                                          ↘ cancelled
```

## 📊 Analytics Metrics

- **Total Orders**: All-time order count
- **Active Orders**: Currently in progress
- **Completed Today**: Delivered today
- **Revenue**: Daily and total revenue
- **Average Order Value**: Mean order amount
- **Average Delivery Time**: Mean time from order to delivery
- **Cancellation Rate**: Percentage of cancelled orders
- **Platform Performance**: Orders and revenue by platform
- **Status Distribution**: Orders by current status
- **Daily Trends**: 7-day order volume
- **Customer Satisfaction**: Ratings from feedback
- **Peak Hours**: Busiest ordering times

## 🔐 Security

- All API routes protected with NextAuth authentication
- Restaurant ownership verification for management operations
- User authorization for order access
- Webhook signature validation
- Encrypted API credentials storage
- Secure payment processing with Nigerian gateways

## 🌍 Nigerian Payment Support

The integration includes full support for Nigerian payment methods:

### Paystack
- Credit/Debit cards
- Bank transfers
- USSD
- Mobile money
- QR code payments

### Flutterwave
- Cards (Naira and international)
- Bank accounts
- Mobile money (MTN, Airtel, etc.)
- USSD
- Bank transfers

## 🎯 Next Steps

1. **Deploy Database Migration**:
   ```bash
   npx prisma migrate dev --name add_delivery_platform_integration
   ```

2. **Configure Environment Variables**: Add all platform API credentials

3. **Initialize WebSocket**: Set up WebSocket server in your Next.js app

4. **Test Integration**: Test order creation and tracking with sandbox credentials

5. **Connect Platforms**: Use the dashboard to connect restaurants to delivery platforms

## 📖 Additional Resources

- [Uber Eats API Documentation](https://developer.uber.com/docs/eats)
- [DoorDash Drive API](https://developer.doordash.com/en-US/docs/drive/reference/introduction/)
- [Grubhub API Documentation](https://developer.grubhub.com/)
- [Paystack Documentation](https://paystack.com/docs)
- [Flutterwave Documentation](https://developer.flutterwave.com/)

## 🐛 Troubleshooting

### WebSocket Connection Issues
- Ensure Socket.IO server is initialized
- Check CORS configuration
- Verify `/api/socket` path is accessible

### Payment Failures
- Verify API keys are correct
- Check webhook URLs are publicly accessible
- Ensure callback URLs match environment

### Menu Sync Errors
- Verify platform connection status
- Check menu item formatting
- Review sync logs in database

## 📄 License

Part of the Restaurant Booking System - All rights reserved.
