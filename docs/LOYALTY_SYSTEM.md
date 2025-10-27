# Loyalty System Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [Tier System](#tier-system)
5. [Points System](#points-system)
6. [API Reference](#api-reference)
7. [Integration Guide](#integration-guide)
8. [Nigerian Market Considerations](#nigerian-market-considerations)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Checklist](#deployment-checklist)
13. [Monitoring and Analytics](#monitoring-and-analytics)
14. [Troubleshooting](#troubleshooting)

## Overview

The Loyalty System is a comprehensive rewards program designed to increase customer retention and engagement through a tiered point-based system. It supports multi-currency operations with special consideration for the Nigerian market.

### Key Features
- 5-tier loyalty system (Bronze, Silver, Gold, Platinum, Diamond)
- Points earning and redemption
- Tier-based benefits and discounts
- Achievement system
- Real-time tier progression
- Integration with booking and payment systems
- Support for NGN currency and Nigerian payment methods

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Loyalty System Architecture              │
├─────────────────────────────────────────────────────────────┤
│  Frontend Components                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Loyalty Dashboard│ │Tier Progress │ │Point History │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  API Layer                                                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  REST API Routes (Next.js API Routes)              │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Service Layer                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │LoyaltyService│  │TierService   │  │Achievement   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                 │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Prisma ORM)                           │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Core Models

#### User Model Enhancement
```typescript
model User {
  // ... existing fields
  loyaltyPoints     Int      @default(0)
  totalSpent        Float    @default(0)
  // Relations
  loyaltyTransactions LoyaltyTransaction[]
  // ... other relations
}
```

#### LoyaltyTransaction Model
```typescript
model LoyaltyTransaction {
  id          String                 @id @default(cuid())
  type        LoyaltyTransactionType
  points      Int
  description String
  expiresAt   DateTime?
  createdAt   DateTime               @default(now())

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("loyalty_transactions")
}
```

#### Restaurant Model Enhancement
```typescript
model Restaurant {
  // ... existing fields
  loyaltyProgram Boolean @default(false)
  loyaltyRate    Float   @default(0.01) // points per dollar
  // ... other fields
}
```

### Enums

```typescript
enum LoyaltyTransactionType {
  EARNED
  REDEEMED
  EXPIRED
  ADJUSTED
}
```

## Tier System

### Tier Definitions

| Tier      | Points Required | Lifetime Spend | Discount | Point Multiplier | Free Delivery Threshold |
|-----------|----------------|----------------|----------|------------------|------------------------|
| Bronze    | 0              | ₦0             | 0%       | 1.0x             | None                   |
| Silver    | 1,000          | ₦50,000        | 5%       | 1.2x             | ₦15,000                |
| Gold      | 3,000          | ₦150,000       | 8%       | 1.3x             | ₦20,000                |
| Platinum  | 5,000          | ₦300,000       | 12%      | 1.5x             | ₦25,000                |
| Diamond   | 10,000         | ₦600,000       | 15%      | 2.0x             | ₦30,000                |

### Tier Progression Logic

```typescript
class TierService {
  async calculateUserTier(userId: string): Promise<TierInfo> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const { currentTier, nextTier, pointsToNextTier } = this.determineTier(
      user.loyaltyPoints,
      user.totalSpent
    );

    return {
      currentTier,
      nextTier,
      pointsToNextTier,
      benefits: await this.getTierBenefits(currentTier),
    };
  }

  private determineTier(points: number, totalSpent: number): TierInfo {
    const tiers = [
      { name: 'DIAMOND', points: 10000, spend: 600000 },
      { name: 'PLATINUM', points: 5000, spend: 300000 },
      { name: 'GOLD', points: 3000, spend: 150000 },
      { name: 'SILVER', points: 1000, spend: 50000 },
      { name: 'BRONZE', points: 0, spend: 0 },
    ];

    for (const tier of tiers) {
      if (points >= tier.points || totalSpent >= tier.spend) {
        const currentIndex = tiers.findIndex(t => t.name === tier.name);
        const nextTier = currentIndex > 0 ? tiers[currentIndex - 1] : null;

        return {
          currentTier: tier.name,
          nextTier: nextTier?.name || null,
          pointsToNextTier: nextTier 
            ? Math.max(0, nextTier.points - points)
            : 0,
        };
      }
    }

    return {
      currentTier: 'BRONZE',
      nextTier: 'SILVER',
      pointsToNextTier: 1000,
    };
  }
}
```

## Points System

### Earning Points

Points are earned through various activities:

1. **Restaurant Bookings**: Points earned based on amount spent
   - Rate: 2 points per ₦1 spent (configurable per restaurant)
   - VIP Bonus: Additional 50% for Platinum+ tiers

2. **Social Sharing**: 50 points per valid share
3. **Reviews**: 100 points per review
4. **Referrals**: 500 points per successful referral
5. **Birthday Bonus**: 1,000 points on birthday month

### Redeeming Points

Points can be redeemed for:
- Discounts: 1 point = ₦0.10 discount
- Free delivery: Based on tier thresholds
- Special menu items: Tier-specific exclusives

### Point Expiration

- Points expire 12 months after earning
- Expiration is processed daily via cron job
- Users receive 30-day warning before expiration

## API Reference

### Earning Points

```typescript
POST /api/loyalty/earn
{
  "userId": "string",
  "points": "number",
  "description": "string",
  "referenceId": "string",
  "referenceType": "booking|review|social_share|referral"
}
```

### Redeeming Points

```typescript
POST /api/loyalty/redeem
{
  "userId": "string",
  "points": "number",
  "description": "string",
  "referenceId": "string",
  "referenceType": "booking|menu_item|promotion"
}
```

### Get User Loyalty Info

```typescript
GET /api/loyalty/user/:userId
// Response
{
  "userId": "string",
  "currentPoints": "number",
  "totalEarned": "number",
  "totalRedeemed": "number",
  "tier": {
    "name": "SILVER",
    "discountPercentage": 5,
    "pointMultiplier": 1.2,
    "benefits": {
      "priorityBooking": true,
      "freeDeliveryThreshold": 15000,
      "birthdayBonus": 500
    }
  },
  "recentTransactions": [
    {
      "id": "string",
      "type": "EARNED",
      "points": 100,
      "description": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### Get Tier Progression

```typescript
GET /api/loyalty/tier/:userId/progress
// Response
{
  "currentTier": "SILVER",
  "points": 1500,
  "nextTier": "GOLD",
  "pointsToNextTier": 1500,
  "progressPercentage": 50,
  "estimatedNextTierDate": "datetime"
}
```

### Get Available Rewards

```typescript
GET /api/loyalty/rewards
// Response
[
  {
    "id": "string",
    "name": "₦5,000 Discount",
    "pointsCost": 50000,
    "type": "discount",
    "tierRequired": "BRONZE",
    "expiryDate": "datetime"
  }
]
```

## Integration Guide

### Booking Integration

```typescript
// In booking completion handler
export async function handleBookingCompleted(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { 
      user: true,
      restaurant: true,
      payment: true 
    },
  });

  if (booking?.restaurant.loyaltyProgram && booking.payment?.status === 'COMPLETED') {
    const pointsEarned = calculatePoints(
      booking.payment.amount,
      booking.restaurant.loyaltyRate,
      booking.user.loyaltyPoints
    );

    await loyaltyService.earnPoints({
      userId: booking.userId,
      points: pointsEarned,
      description: `Points from booking ${booking.confirmationCode}`,
      referenceId: bookingId,
      referenceType: 'booking',
    });

    // Update booking with points earned
    await prisma.booking.update({
      where: { id: bookingId },
      data: { loyaltyPointsEarned: pointsEarned },
    });
  }
}

function calculatePoints(
  amount: number, 
  rate: number, 
  currentPoints: number
): number {
  const basePoints = Math.floor(amount * rate);
  
  // VIP bonus for high-tier users
  if (currentPoints >= 5000) {
    return Math.floor(basePoints * 1.5);
  } else if (currentPoints >= 3000) {
    return Math.floor(basePoints * 1.3);
  } else if (currentPoints >= 1000) {
    return Math.floor(basePoints * 1.2);
  }
  
  return basePoints;
}
```

### Payment Integration

```typescript
// In payment processing
export async function processLoyaltyPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { 
      user: true,
      booking: true,
    },
  });

  if (payment.loyaltyPointsUsed > 0) {
    // Verify user has sufficient points
    if (payment.user.loyaltyPoints < payment.loyaltyPointsUsed) {
      throw new Error('Insufficient loyalty points');
    }

    // Redeem points
    await loyaltyService.redeemPoints({
      userId: payment.userId,
      points: payment.loyaltyPointsUsed,
      description: `Points redeemed for payment ${paymentId}`,
      referenceId: paymentId,
      referenceType: 'payment',
    });
  }
}
```

### Real-time Updates

```typescript
// Using WebSocket for real-time tier updates
export class LoyaltyWebSocket {
  async notifyTierChange(userId: string, newTier: string) {
    io.to(`user:${userId}`).emit('tier_update', {
      userId,
      newTier,
      timestamp: new Date(),
    });
  }

  async notifyPointsEarned(userId: string, points: number) {
    io.to(`user:${userId}`).emit('points_earned', {
      userId,
      points,
      newBalance: await this.getCurrentPoints(userId),
      timestamp: new Date(),
    });
  }
}
```

## Nigerian Market Considerations

### Currency Support
- Primary currency: Nigerian Naira (NGN)
- Locale formatting: `₦123,456.78`
- Exchange rates for international users (future feature)

### Local Payment Methods
- Bank transfer
- Mobile money (Paga, Opay, Kuda)
- USSD codes
- Card payments (Visa, Mastercard, Verve)

### Regional Pricing
- Tier thresholds adjusted for Nigerian purchasing power
- Free delivery thresholds in NGN
- Local competitive analysis for point values

### Language Support
- English (primary)
- Hausa (ha)
- Yoruba (yo)
- Igbo (ig)

### Location-Based Features
```typescript
// Lagos-specific promotions
const lagosPromotions = await prisma.promotion.findMany({
  where: {
    targetAudience: { has: 'lagos_customers' },
    applicableCities: { has: 'Lagos' },
    isActive: true,
  },
});

// Multi-city delivery zones
const deliveryZones = await prisma.deliveryZone.findMany({
  where: {
    restaurantId: restaurantId,
    isActive: true,
  },
  orderBy: { priority: 'desc' },
});
```

## Performance Optimization

### Database Indexes
```sql
-- User loyalty points lookup
CREATE INDEX idx_users_loyalty_points ON users(loyalty_points DESC);

-- Transaction history queries
CREATE INDEX idx_loyalty_transactions_user_date ON loyalty_transactions(user_id, created_at DESC);

-- Point expiration queries
CREATE INDEX idx_loyalty_transactions_expires ON loyalty_transactions(expires_at) WHERE expires_at IS NOT NULL;

-- Tier progression queries
CREATE INDEX idx_users_total_spent ON users(total_spent DESC);
```

### Caching Strategy
```typescript
// Redis caching for frequent queries
export class LoyaltyCache {
  private redis: Redis;

  async getUserLoyaltyInfo(userId: string): Promise<UserLoyaltyInfo> {
    const cacheKey = `loyalty:${userId}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const info = await this.calculateUserLoyaltyInfo(userId);
    await this.redis.setex(cacheKey, 300, JSON.stringify(info)); // 5 min cache
    
    return info;
  }

  async invalidateUserCache(userId: string) {
    await this.redis.del(`loyalty:${userId}`);
    await this.redis.del(`tier:${userId}`);
  }
}
```

### Batch Processing
```typescript
// Daily point expiration job
export async function processPointExpiration() {
  const expiredTransactions = await prisma.loyaltyTransaction.findMany({
    where: {
      expiresAt: {
        lte: new Date(),
      },
      type: 'EARNED',
    },
  });

  const batchSize = 1000;
  
  for (let i = 0; i < expiredTransactions.length; i += batchSize) {
    const batch = expiredTransactions.slice(i, i + batchSize);
    
    await prisma.$transaction(async (tx) => {
      for (const transaction of batch) {
        await tx.loyaltyTransaction.create({
          data: {
            userId: transaction.userId,
            type: 'EXPIRED',
            points: transaction.points,
            description: 'Points expired after 12 months',
            referenceId: transaction.id,
            referenceType: 'expiration',
          },
        });
      }
    });
  }
}
```

## Security Considerations

### Point Manipulation Prevention
```typescript
// Server-side validation
export class LoyaltyValidator {
  validatePointsEarned(points: number, transactionType: string): boolean {
    // Reasonable limits based on transaction type
    const limits = {
      booking: 10000, // Max 10,000 points per booking
      review: 500,
      social_share: 100,
      referral: 5000,
    };

    return points <= (limits[transactionType] || 1000);
  }

  async detectFraudulentActivity(userId: string): Promise<boolean> {
    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    // Check for suspicious patterns
    const sameAmountCount = recentTransactions.reduce((acc, t) => {
      acc[t.points] = (acc[t.points] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Flag if same amount repeated >10 times
    return Object.values(sameAmountCount).some(count => count > 10);
  }
}
```

### Audit Logging
```typescript
export class LoyaltyAuditLog {
  async logPointsChange(
    userId: string,
    change: number,
    reason: string,
    performedBy: string
  ) {
    await prisma.loyaltyAuditLog.create({
      data: {
        userId,
        change,
        reason,
        performedBy,
        ipAddress: this.getClientIP(),
        userAgent: this.getUserAgent(),
        timestamp: new Date(),
      },
    });
  }
}
```

## Testing Strategy

### Unit Tests
- Points earning calculations
- Tier progression logic
- Redemption validation
- Expiration handling

### Integration Tests
- Booking to loyalty flow
- Payment to loyalty integration
- Real-time notifications

### Load Testing
- Concurrent point operations
- Large transaction volumes
- Cache performance

### Nigerian Market Tests
- Currency formatting
- Local payment methods
- Regional promotions

See `tests/loyalty-system.test.ts` for comprehensive test suite.

## Deployment Checklist

### Pre-deployment
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Redis cache configured
- [ ] Cron jobs scheduled
- [ ] Monitoring dashboards setup

### Configuration
```bash
# Environment variables
LOYALTY_POINTS_EXPIRATION_DAYS=365
LOYALTY_DEFAULT_RATE=0.02
LOYALTY_VIP_BONUS_MULTIPLIER=1.5
LOYALTY_MAX_REDEMPTION_PERCENTAGE=50
REDIS_URL=redis://localhost:6379
```

### Database Migration
```bash
# Apply loyalty schema
npx prisma db push

# Seed initial data
npm run seed:loyalty
```

### Cron Jobs
```typescript
// Setup in your job scheduler (e.g., node-cron, PM2)
const cronJobs = [
  {
    name: 'process-point-expiration',
    schedule: '0 2 * * *', // Daily at 2 AM
    task: processPointExpiration,
  },
  {
    name: 'calculate-tier-bonuses',
    schedule: '0 1 * * 1', // Weekly on Monday
    task: calculateWeeklyTierBonuses,
  },
];
```

### Monitoring Alerts
- Point balance anomalies
- Tier progression errors
- Cache miss rates > 10%
- Database connection failures
- API response times > 500ms

## Monitoring and Analytics

### Key Metrics
```typescript
interface LoyaltyMetrics {
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  activeUsersByTier: Record<Tier, number>;
  averagePointsPerUser: number;
  tierProgressionRate: number;
  redemptionRate: number;
  expirationRate: number;
}
```

### Dashboard Queries
```sql
-- Daily points activity
SELECT 
  DATE(created_at) as date,
  type,
  SUM(points) as total_points,
  COUNT(*) as transaction_count
FROM loyalty_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), type
ORDER BY date DESC;

-- Tier distribution
SELECT 
  CASE 
    WHEN loyalty_points >= 10000 THEN 'DIAMOND'
    WHEN loyalty_points >= 5000 THEN 'PLATINUM'
    WHEN loyalty_points >= 3000 THEN 'GOLD'
    WHEN loyalty_points >= 1000 THEN 'SILVER'
    ELSE 'BRONZE'
  END as tier,
  COUNT(*) as user_count
FROM users
GROUP BY tier;

-- Top earners this month
SELECT 
  u.first_name,
  u.last_name,
  SUM(lt.points) as points_earned
FROM loyalty_transactions lt
JOIN users u ON lt.user_id = u.id
WHERE lt.type = 'EARNED'
  AND lt.created_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY u.id, u.first_name, u.last_name
ORDER BY points_earned DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues

#### Points Not Appearing
1. Check transaction exists in database
2. Verify user ID matches
3. Check for concurrent transaction conflicts
4. Review error logs

#### Tier Not Updating
1. Verify point thresholds are met
2. Check tier calculation service
3. Clear user cache
4. Force recalculation

#### Redemption Failures
1. Verify sufficient point balance
2. Check redemption limits
3. Validate transaction data
4. Review authorization logs

### Debug Queries
```sql
-- Check user's point history
SELECT * FROM loyalty_transactions 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC;

-- Verify tier calculation
SELECT 
  loyalty_points,
  total_spent,
  CASE 
    WHEN loyalty_points >= 10000 THEN 'DIAMOND'
    WHEN loyalty_points >= 5000 THEN 'PLATINUM'
    WHEN loyalty_points >= 3000 THEN 'GOLD'
    WHEN loyalty_points >= 1000 THEN 'SILVER'
    ELSE 'BRONZE'
  END as calculated_tier
FROM users 
WHERE id = 'USER_ID';

-- Recent transactions
SELECT 
  lt.*,
  u.first_name,
  u.last_name
FROM loyalty_transactions lt
JOIN users u ON lt.user_id = u.id
WHERE lt.created_at >= NOW() - INTERVAL '1 day'
ORDER BY lt.created_at DESC;
```

### Log Analysis
```typescript
// Enable debug logging
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'loyalty-debug.log' }),
  ],
});

// Log all loyalty operations
logger.info('Points earned', {
  userId,
  points,
  referenceType,
  referenceId,
  timestamp: new Date(),
});
```

---

For more detailed information, see:
- [Tier Benefits Documentation](LOYALTY_TIER_BENEFITS.md)
- [Partner Integration Guide](LOYALTY_PARTNER_INTEGRATION.md)
- [API Reference](../API_REFERENCE.md)
