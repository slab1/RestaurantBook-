# Loyalty Partner Integration Guide

## Table of Contents
1. [Overview](#overview)
2. [Partner Ecosystem](#partner-ecosystem)
3. [Integration Architecture](#integration-architecture)
4. [API Integration](#api-integration)
5. [Loyalty Points Synchronization](#loyalty-points-synchronization)
6. [Tier Benefits Distribution](#tier-benefits-distribution)
7. [Data Flow](#data-flow)
8. [Authentication & Security](#authentication--security)
9. [Partner Onboarding](#partner-onboarding)
10. [Nigerian Market Partners](#nigerian-market-partners)
11. [Testing & Validation](#testing--validation)
12. [Monitoring & Support](#monitoring--support)
13. [Error Handling](#error-handling)
14. [Best Practices](#best-practices)
15. [Troubleshooting](#troubleshooting)

## Overview

The Loyalty Partner Integration system enables seamless collaboration between restaurants and external partners (spas, entertainment venues, retail stores, etc.) to provide comprehensive loyalty benefits across multiple businesses. Partners can offer tier-based discounts, accept loyalty points as payment, and share customer data to enhance the overall loyalty experience.

### Key Features
- Real-time loyalty points synchronization
- Tier-based discount application
- Cross-platform point redemption
- Partner-specific benefits
- Unified customer profile
- Nigerian market payment method integration
- Multi-currency support
- Automated reconciliation

## Partner Ecosystem

### Partner Categories

#### Tier 1 Partners (Gold+)
- **Spas & Wellness**: Rejuvenation Spa, Bliss Wellness, Urban Fitness
- **Entertainment**: Genesis Cinema, Palms Shopping Mall, Ikeja City Mall
- **Retail**: SPAR, ShopRite, Genesis Fashion
- **Hotels**: Federal Palace Hotel, Four Points by Sheraton, Radisson Blu

#### Tier 2 Partners (Platinum+)
- **Luxury Spas**: Earth Spa, Raw Cup Wellness, TriBeCa Spa
- **Premium Entertainment**: Ozone Cinema, City Mall, The Palms
- **Designer Retail**: www.shopRite.com.ng,Genesis Luxury
- **5-Star Hotels**: InterContinental Lagos, Eko Hotel & Suites, The George

#### Tier 3 Partners (Diamond)
- **Ultra-Premium**: Sanctuary Spa, Genesis Private Cinema
- **Exclusive Retail**: Designer boutiques, luxury brands
- **VIP Hotels**: Private membership hotels, exclusive resorts
- **Personal Services**: Personal trainers, nutritionists, concierge

### Partnership Models

#### Revenue Share Model
- Partner pays commission on sales: 3-8%
- Loyalty points earned: Base rate
- Discount application: Tier-based

#### Points Purchase Model
- Partner buys points at discount
- Uses points to offer customer benefits
- Custom point values per partner

#### Mutual Benefit Model
- Cross-promotional benefits
- Shared customer acquisition costs
- Joint marketing campaigns

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Partner Integration Architecture             │
├─────────────────────────────────────────────────────────────┤
│  Partner Applications                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Spa Partner  │  │Cinema Partner│  │Retail Partner│        │
│  │   System    │  │    System   │  │    System   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Partner API Gateway                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication │ Rate Limiting │ Validation         │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │  │
│  │  │ OAuth 2.0   │ │ Token Queue │ │ Schema Check│     │  │
│  │  │ API Keys    │ │ Throttling  │ │ Type Verify │     │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Loyalty Integration Layer                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Points Sync  │  │Tier Verify  │  │Discount Calc│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│  Core Loyalty System                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Database  │ Transaction Engine  │ Tier Engine  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## API Integration

### Base Configuration

```typescript
// Partner API Configuration
const partnerConfig = {
  baseURL: 'https://api.restaurant.com/loyalty/partners',
  apiVersion: 'v1',
  timeout: 30000,
  retryAttempts: 3,
  rateLimits: {
    requests: 1000, // per hour
    burst: 100,     // immediate burst allowance
  },
};

// Partner Authentication
interface PartnerAuth {
  apiKey: string;
  apiSecret: string;
  partnerId: string;
  environment: 'sandbox' | 'production';
}
```

### Authentication

#### API Key Authentication
```typescript
// Generate API credentials
const credentials = await fetch('/api/partners/auth/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    partnerName: 'Genesis Spa',
    partnerType: 'spa_wellness',
    contactEmail: 'integration@genesisspa.com',
  }),
});

// Response
{
  "apiKey": "pk_live_abc123xyz",
  "apiSecret": "sk_live_def456uvw",
  "partnerId": "partner_001",
  "webhookUrl": "https://api.genesisspa.com/loyalty/webhook"
}
```

#### Making Authenticated Requests
```typescript
import axios from 'axios';

class LoyaltyPartnerAPI {
  private apiKey: string;
  private apiSecret: string;
  private baseURL: string;

  constructor(config: PartnerAuth) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseURL = 'https://api.restaurant.com/loyalty/v1';
  }

  private getAuthHeaders() {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(timestamp);
    
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Timestamp': timestamp,
      'X-Signature': signature,
      'Content-Type': 'application/json',
    };
  }

  private generateSignature(timestamp: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(timestamp)
      .digest('hex');
  }

  async verifyCustomer(phoneNumber: string, email?: string) {
    try {
      const response = await axios.get(
        `${this.baseURL}/customers/verify`,
        {
          headers: this.getAuthHeaders(),
          params: {
            phone: phoneNumber,
            email: email,
          },
        }
      );
      
      return response.data;
    } catch (error) {
      throw new LoyaltyAPIError('Customer verification failed', error);
    }
  }
}
```

## Loyalty Points Synchronization

### Earning Points at Partner Location

```typescript
// Partner earns points for customer
async function earnPointsAtPartner(partnerId: string, customerData: CustomerData, amount: number) {
  // 1. Verify customer tier
  const customerTier = await loyaltyAPI.getCustomerTier(customerData.phoneNumber);
  
  // 2. Calculate points based on tier
  const pointMultiplier = getTierMultiplier(customerTier);
  const basePoints = Math.floor(amount * 0.02); // 2 points per ₦1
  const earnedPoints = Math.floor(basePoints * pointMultiplier);
  
  // 3. Record transaction
  const transaction = await loyaltyAPI.recordPointsEarned({
    customerPhone: customerData.phoneNumber,
    partnerId,
    points: earnedPoints,
    amount,
    referenceId: generateReferenceId(),
    referenceType: 'partner_purchase',
    description: `Points earned at ${partnerId}`,
  });
  
  // 4. Send confirmation
  await sendPointsConfirmation(customerData.phoneNumber, earnedPoints, partnerId);
  
  return {
    success: true,
    pointsEarned: earnedPoints,
    transactionId: transaction.id,
    newBalance: await loyaltyAPI.getCurrentPoints(customerData.phoneNumber),
  };
}

// Tier multipliers
function getTierMultiplier(tier: string): number {
  const multipliers = {
    BRONZE: 1.0,
    SILVER: 1.2,
    GOLD: 1.3,
    PLATINUM: 1.5,
    DIAMOND: 2.0,
  };
  
  return multipliers[tier] || 1.0;
}
```

### Redeeming Points at Partner Location

```typescript
async function redeemPointsAtPartner(partnerId: string, customerData: CustomerData, requestedPoints: number) {
  // 1. Verify customer has sufficient points
  const currentBalance = await loyaltyAPI.getCurrentPoints(customerData.phoneNumber);
  
  if (currentBalance < requestedPoints) {
    throw new Error('Insufficient loyalty points');
  }
  
  // 2. Check partner accepts redemption
  const partnerInfo = await loyaltyAPI.getPartnerInfo(partnerId);
  if (!partnerInfo.acceptsRedemption) {
    throw new Error('Partner does not accept point redemption');
  }
  
  // 3. Calculate discount value
  const discountRate = partnerInfo.redemptionRate || 0.1; // 1 point = ₦0.10
  const discountValue = requestedPoints * discountRate;
  
  // 4. Process redemption
  const redemption = await loyaltyAPI.redeemPoints({
    customerPhone: customerData.phoneNumber,
    partnerId,
    points: requestedPoints,
    discountValue,
    referenceId: generateReferenceId(),
    referenceType: 'partner_redemption',
    description: `Points redeemed at ${partnerInfo.name}`,
  });
  
  // 5. Update partner system
  await updatePartnerSystem(partnerId, {
    customerId: customerData.phoneNumber,
    discountAmount: discountValue,
    loyaltyPointsUsed: requestedPoints,
  });
  
  return {
    success: true,
    discountApplied: discountValue,
    pointsRedeemed: requestedPoints,
    remainingPoints: currentBalance - requestedPoints,
  };
}
```

### Real-time Points Sync

```typescript
// WebSocket for real-time updates
class PointsSyncWebSocket {
  private ws: WebSocket;
  
  constructor(partnerId: string, apiKey: string) {
    this.ws = new WebSocket(`wss://api.restaurant.com/loyalty/ws?partnerId=${partnerId}&key=${apiKey}`);
    
    this.ws.on('open', () => {
      console.log('Connected to loyalty points sync');
    });
    
    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.handleSyncMessage(message);
    });
  }
  
  private async handleSyncMessage(message: SyncMessage) {
    switch (message.type) {
      case 'POINTS_EARNED':
        await this.updatePartnerPoints(message.data);
        break;
      case 'POINTS_REDEEMED':
        await this.updatePartnerRedemption(message.data);
        break;
      case 'TIER_UPDATED':
        await this.updatePartnerTier(message.data);
        break;
      case 'TIER_BENEFITS_CHANGED':
        await this.updatePartnerBenefits(message.data);
        break;
    }
  }
  
  private async updatePartnerPoints(data: PointsData) {
    // Update partner's customer points display
    await fetch(`${PARTNER_API_BASE}/customers/${data.customerPhone}/loyalty`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPoints: data.newBalance,
        lastUpdated: new Date(),
      }),
    });
  }
}
```

## Tier Benefits Distribution

### Discount Application

```typescript
interface TierBenefit {
  tier: string;
  discountPercentage: number;
  partnerCategories: string[];
  minimumAmount?: number;
  maximumDiscount?: number;
}

const tierBenefits: TierBenefit[] = [
  {
    tier: 'BRONZE',
    discountPercentage: 0,
    partnerCategories: ['all'],
  },
  {
    tier: 'SILVER',
    discountPercentage: 5,
    partnerCategories: ['spa_wellness', 'retail', 'entertainment'],
    minimumAmount: 5000,
  },
  {
    tier: 'GOLD',
    discountPercentage: 10,
    partnerCategories: ['all'],
    minimumAmount: 3000,
  },
  {
    tier: 'PLATINUM',
    discountPercentage: 20,
    partnerCategories: ['all'],
  },
  {
    tier: 'DIAMOND',
    discountPercentage: 30,
    partnerCategories: ['all'],
    maximumDiscount: 50000,
  },
];

async function applyTierDiscount(
  customerTier: string,
  partnerCategory: string,
  amount: number
): Promise<DiscountResult> {
  const benefit = tierBenefits.find(
    b => b.tier === customerTier && 
    (b.partnerCategories.includes('all') || b.partnerCategories.includes(partnerCategory))
  );
  
  if (!benefit || benefit.discountPercentage === 0) {
    return { discountApplied: 0, finalAmount: amount };
  }
  
  let discountAmount = amount * (benefit.discountPercentage / 100);
  
  if (benefit.minimumAmount && amount < benefit.minimumAmount) {
    return { discountApplied: 0, finalAmount: amount };
  }
  
  if (benefit.maximumDiscount) {
    discountAmount = Math.min(discountAmount, benefit.maximumDiscount);
  }
  
  return {
    discountApplied: discountAmount,
    finalAmount: amount - discountAmount,
    discountPercentage: benefit.discountPercentage,
  };
}
```

### Benefit Validation

```typescript
async function validateTierBenefits(
  customerPhone: string,
  partnerId: string,
  requestedBenefits: string[]
): Promise<ValidationResult> {
  const customer = await loyaltyAPI.getCustomer(customerPhone);
  const partner = await loyaltyAPI.getPartner(partnerId);
  
  const results = [];
  
  for (const benefit of requestedBenefits) {
    const isValid = await checkBenefitEligibility(customer, partner, benefit);
    
    results.push({
      benefit,
      eligible: isValid.eligible,
      discountRate: isValid.discountRate,
      restrictions: isValid.restrictions,
    });
  }
  
  return {
    customerTier: customer.tier,
    benefits: results,
    totalDiscount: calculateTotalDiscount(results),
  };
}
```

## Data Flow

### Customer Flow at Partner Location

```
1. Customer Visits Partner
   ↓
2. Partner Scans QR Code / Searches Phone
   ↓
3. API Verifies Customer & Tier
   ↓
4. Display Available Benefits
   ↓
5. Customer Makes Purchase
   ↓
6. Apply Discounts (if applicable)
   ↓
7. Earn Points (if applicable)
   ↓
8. Confirm Transaction
   ↓
9. Update Both Systems
   ↓
10. Send Confirmation SMS
```

### Implementation Example

```typescript
// Partner POS Integration
class PartnerPOSIntegration {
  async processTransaction(transactionData: PartnerTransaction) {
    const { customerPhone, partnerId, items, subtotal } = transactionData;
    
    // 1. Verify customer
    const customer = await loyaltyAPI.verifyCustomer(customerPhone);
    
    // 2. Get tier benefits
    const benefits = await loyaltyAPI.getTierBenefits(customerPhone, partnerId);
    
    // 3. Apply benefits
    const appliedBenefits = await this.applyBenefits(items, benefits);
    
    // 4. Calculate final amount
    const finalAmount = subtotal - appliedBenefits.totalDiscount;
    
    // 5. Process payment
    const payment = await this.processPayment(finalAmount, transactionData.paymentMethod);
    
    // 6. Record loyalty transactions
    const loyaltyResult = await this.recordLoyaltyTransaction({
      customer,
      partnerId,
      originalAmount: subtotal,
      discountAmount: appliedBenefits.totalDiscount,
      finalAmount,
      payment,
    });
    
    // 7. Update customer
    await this.updateCustomerDisplay(customerPhone, loyaltyResult);
    
    // 8. Send receipts
    await this.sendReceipts(customerPhone, partnerId, loyaltyResult);
    
    return loyaltyResult;
  }
}
```

## Authentication & Security

### OAuth 2.0 Implementation

```typescript
// Partner OAuth Flow
class PartnerOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  
  async generateAuthUrl(partnerId: string): Promise<string> {
    const state = this.generateState(partnerId);
    const codeVerifier = this.generateCodeVerifier();
    
    const authUrl = new URL('https://api.restaurant.com/oauth/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('redirect_uri', this.redirectUri);
    authUrl.searchParams.set('scope', 'loyalty:read loyalty:write partners:read');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', this.generateCodeChallenge(codeVerifier));
    authUrl.searchParams.set('code_challenge_method', 'S256');
    
    return authUrl.toString();
  }
  
  async exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
    const response = await fetch('https://api.restaurant.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier,
      }),
    });
    
    return response.json();
  }
}
```

### API Security Best Practices

```typescript
// Rate Limiting
const rateLimiter = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 1000,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.headers['x-api-key'],
};

// Request Validation
const validateRequest = (schema: joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details,
      });
    }
    req.body = value;
    next();
  };
};

// Audit Logging
const auditLogger = async (req: Request, partnerId: string, action: string) => {
  await prisma.auditLog.create({
    data: {
      partnerId,
      action,
      endpoint: req.path,
      method: req.method,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    },
  });
};
```

## Partner Onboarding

### Step 1: Application & Verification

```typescript
// Partner Application
interface PartnerApplication {
  businessName: string;
  businessType: string; // spa_wellness, retail, entertainment, hotel
  registrationNumber: string;
  taxId: string;
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    position: string;
  };
  businessAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  locations: BusinessLocation[];
  paymentMethods: string[];
  logo: string; // URL to logo
  website?: string;
}

async function submitPartnerApplication(application: PartnerApplication) {
  // 1. Validate application
  const validation = await validatePartnerApplication(application);
  if (!validation.isValid) {
    throw new Error(`Application validation failed: ${validation.errors.join(', ')}`);
  }
  
  // 2. Check business registration
  const businessCheck = await verifyBusinessRegistration(application.registrationNumber);
  if (!businessCheck.isValid) {
    throw new Error('Invalid business registration');
  }
  
  // 3. Create application record
  const appRecord = await prisma.partnerApplication.create({
    data: {
      ...application,
      status: 'PENDING_REVIEW',
      submittedAt: new Date(),
    },
  });
  
  // 4. Send to compliance team
  await sendToComplianceReview(appRecord.id);
  
  return { applicationId: appRecord.id, status: 'submitted' };
}
```

### Step 2: Technical Integration Setup

```typescript
// Technical Integration
async function setupPartnerIntegration(partnerId: string, requirements: IntegrationRequirements) {
  // 1. Generate API credentials
  const credentials = await generateAPICredentials(partnerId);
  
  // 2. Setup webhook endpoints
  const webhookConfig = await setupWebhookEndpoints(partnerId, {
    pointsEarned: true,
    pointsRedeemed: true,
    tierUpdated: true,
    customerUpdated: true,
  });
  
  // 3. Configure integration settings
  const integrationSettings = await prisma.partnerIntegrationSettings.create({
    data: {
      partnerId,
      apiVersion: 'v1',
      rateLimit: 1000,
      retryAttempts: 3,
      webhookSecret: generateWebhookSecret(),
      allowedIPs: requirements.allowedIPs,
      timezone: requirements.timezone || 'Africa/Lagos',
      currency: requirements.currency || 'NGN',
    },
  });
  
  // 4. Send credentials to partner
  await sendIntegrationCredentials(partnerId, {
    ...credentials,
    webhookUrl: webhookConfig.url,
    webhookSecret: webhookConfig.secret,
  });
  
  return {
    integrationId: integrationSettings.id,
    credentials: credentials,
    webhookUrl: webhookConfig.url,
  };
}
```

### Step 3: Testing & Validation

```typescript
// Integration Testing Suite
describe('Partner Integration Tests', () => {
  let partnerAPI: LoyaltyPartnerAPI;
  let testCustomer: TestCustomer;
  
  beforeAll(async () => {
    partnerAPI = new LoyaltyPartnerAPI(testCredentials);
    testCustomer = await setupTestCustomer('SILVER');
  });
  
  test('should verify customer tier correctly', async () => {
    const customer = await partnerAPI.verifyCustomer(testCustomer.phoneNumber);
    expect(customer.tier).toBe('SILVER');
    expect(customer.benefits.discountPercentage).toBe(5);
  });
  
  test('should apply tier discounts correctly', async () => {
    const discount = await partnerAPI.calculateDiscount({
      customerPhone: testCustomer.phoneNumber,
      partnerCategory: 'spa_wellness',
      amount: 10000,
    });
    
    expect(discount.discountApplied).toBe(500); // 5% of ₦10,000
    expect(discount.discountPercentage).toBe(5);
  });
  
  test('should earn points correctly', async () => {
    const result = await partnerAPI.earnPoints({
      customerPhone: testCustomer.phoneNumber,
      amount: 15000,
      partnerId: 'partner_001',
    });
    
    expect(result.pointsEarned).toBeGreaterThan(0);
    expect(result.success).toBe(true);
  });
  
  test('should handle point redemption', async () => {
    const redemption = await partnerAPI.redeemPoints({
      customerPhone: testCustomer.phoneNumber,
      points: 1000,
      partnerId: 'partner_001',
    });
    
    expect(redemption.discountApplied).toBe(100); // 1000 pts × ₦0.10
    expect(redemption.success).toBe(true);
  });
});
```

## Nigerian Market Partners

### Local Payment Integration

```typescript
// Nigerian Payment Methods
const nigerianPaymentMethods = {
  bank_transfer: {
    name: 'Bank Transfer',
    discount: '0%',
    processingTime: 'instant',
    supportedBanks: ['GTBank', 'First Bank', 'UBA', 'Access Bank', 'Zenith Bank'],
  },
  mobile_money: {
    name: 'Mobile Money',
    discount: '2%',
    processingTime: 'instant',
    providers: ['Paga', 'Opay', 'Kuda', 'PalmPay'],
  },
  ussd: {
    name: 'USSD',
    discount: '1%',
    processingTime: 'instant',
    codes: ['*737#', '*770#', '*322#'],
  },
  card: {
    name: 'Card Payment',
    discount: '0%',
    processingTime: 'instant',
    types: ['Visa', 'Mastercard', 'Verve'],
  },
};

// Partner integration with Nigerian methods
async function processNigerianPayment(
  paymentMethod: string,
  amount: number,
  customerTier: string
): Promise<PaymentResult> {
  const paymentConfig = nigerianPaymentMethods[paymentMethod];
  let finalAmount = amount;
  
  // Apply tier benefits
  if (customerTier !== 'BRONZE') {
    const discount = amount * (getTierDiscount(customerTier) / 100);
    finalAmount -= discount;
  }
  
  // Apply payment method discount
  if (paymentConfig.discount !== '0%') {
    const paymentDiscount = amount * (parseFloat(paymentConfig.discount) / 100);
    finalAmount -= paymentDiscount;
  }
  
  return {
    originalAmount: amount,
    tierDiscount: amount - finalAmount,
    paymentMethodDiscount: 0,
    finalAmount,
    paymentMethod,
  };
}
```

### Local Partner Examples

```typescript
// Lagos Spa Partners
const lagosSpaPartners = [
  {
    id: 'spa_rejuvenation',
    name: 'Rejuvenation Spa Victoria Island',
    location: 'Victoria Island, Lagos',
    categories: ['spa_wellness'],
    tierBenefits: {
      SILVER: { discount: 5, freeService: '15-min massage' },
      GOLD: { discount: 10, freeService: '30-min massage' },
      PLATINUM: { discount: 20, freeService: 'Full body treatment' },
      DIAMOND: { discount: 30, freeService: 'Day package + lunch' },
    },
    loyaltyAcceptance: {
      earn: true,
      redeem: true,
      redemptionRate: 0.1,
    },
  },
];

// Abuja Hotel Partners
const abujaHotelPartners = [
  {
    id: 'hotel_federal_palace',
    name: 'Federal Palace Hotel',
    location: 'Abuja',
    categories: ['hotel', 'dining', 'entertainment'],
    tierBenefits: {
      SILVER: { discount: 5, freeService: 'Welcome drink' },
      GOLD: { discount: 8, freeService: 'Airport transfer' },
      PLATINUM: { discount: 12, freeService: 'Room upgrade' },
      DIAMOND: { discount: 15, freeService: 'Executive suite' },
    },
    loyaltyAcceptance: {
      earn: true,
      redeem: false,
    },
  },
];
```

## Testing & Validation

### Automated Testing Pipeline

```yaml
# .github/workflows/partner-integration-tests.yml
name: Partner Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          API_KEY: ${{ secrets.TEST_API_KEY }}
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Run partner simulation tests
        run: npm run test:partners
        env:
          PARTNER_API_KEY: ${{ secrets.TEST_PARTNER_API_KEY }}
      
      - name: Generate test coverage
        run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v1
```

### Partner Simulation Testing

```typescript
// Partner Test Suite
class PartnerSimulationTest {
  private testPartner: TestPartner;
  private testCustomers: TestCustomer[];
  
  async setup() {
    this.testPartner = await createTestPartner({
      name: 'Test Spa Partner',
      category: 'spa_wellness',
      acceptsRedemption: true,
    });
    
    this.testCustomers = await Promise.all([
      this.createTestCustomer('BRONZE'),
      this.createTestCustomer('SILVER'),
      this.createTestCustomer('GOLD'),
      this.createTestCustomer('PLATINUM'),
      this.createTestCustomer('DIAMOND'),
    ]);
  }
  
  async testTierBenefitApplication() {
    for (const customer of this.testCustomers) {
      const benefit = await this.getPartnerBenefit(this.testPartner.id, customer.phone);
      
      expect(benefit).toBeDefined();
      expect(benefit.discountPercentage).toBe(getExpectedDiscount(customer.tier));
      expect(benefit.eligible).toBe(true);
    }
  }
  
  async testPointsSynchronization() {
    for (const customer of this.testCustomers) {
      const amount = 10000; // ₦10,000
      const earnedPoints = await this.simulatePurchase(this.testPartner.id, customer, amount);
      
      expect(earnedPoints).toBeGreaterThan(0);
      
      const balance = await this.getCurrentPoints(customer.phone);
      expect(balance).toBeGreaterThanOrEqual(earnedPoints);
    }
  }
  
  async testPointRedemption() {
    for (const customer of this.testCustomers) {
      const redemption = await this.simulateRedemption(this.testPartner.id, customer, 1000);
      
      expect(redemption.success).toBe(true);
      expect(redemption.discountApplied).toBe(100); // 1000 × ₦0.10
    }
  }
}
```

## Monitoring & Support

### Real-time Monitoring

```typescript
// Partner Monitoring Dashboard
interface PartnerMetrics {
  partnerId: string;
  activeCustomers: number;
  dailyTransactions: number;
  pointsIssued: number;
  pointsRedeemed: number;
  totalDiscountGiven: number;
  revenueGenerated: number;
  errorRate: number;
  averageResponseTime: number;
}

class PartnerMonitoring {
  async getPartnerMetrics(partnerId: string, dateRange: DateRange): Promise<PartnerMetrics> {
    const metrics = await prisma.$transaction([
      this.getActiveCustomersCount(partnerId, dateRange),
      this.getDailyTransactions(partnerId, dateRange),
      this.getPointsMetrics(partnerId, dateRange),
      this.getRevenueMetrics(partnerId, dateRange),
      this.getErrorMetrics(partnerId, dateRange),
    ]);
    
    return {
      partnerId,
      activeCustomers: metrics[0],
      dailyTransactions: metrics[1],
      pointsIssued: metrics[2].issued,
      pointsRedeemed: metrics[2].redeemed,
      totalDiscountGiven: metrics[3].discount,
      revenueGenerated: metrics[3].revenue,
      errorRate: metrics[4].errorRate,
      averageResponseTime: metrics[4].avgResponseTime,
    };
  }
  
  async setupAlerts(partnerId: string) {
    // Error rate alerts
    await this.createAlert({
      partnerId,
      type: 'ERROR_RATE',
      threshold: 5, // 5%
      notification: 'email',
    });
    
    // Response time alerts
    await this.createAlert({
      partnerId,
      type: 'RESPONSE_TIME',
      threshold: 1000, // 1 second
      notification: 'slack',
    });
    
    // Transaction volume alerts
    await this.createAlert({
      partnerId,
      type: 'TRANSACTION_VOLUME',
      threshold: 1000, // transactions per hour
      notification: 'email',
    });
  }
}
```

### Support Ticket System

```typescript
// Partner Support Integration
class PartnerSupport {
  async createSupportTicket(ticketData: PartnerSupportTicket) {
    const ticket = await prisma.supportTicket.create({
      data: {
        partnerId: ticketData.partnerId,
        category: ticketData.category, // technical, billing, integration
        priority: ticketData.priority, // low, medium, high, critical
        subject: ticketData.subject,
        description: ticketData.description,
        attachments: ticketData.attachments,
        status: 'OPEN',
        assignedTo: await this.assignAgent(ticketData.category),
        createdAt: new Date(),
      },
    });
    
    // Auto-assign based on category
    await this.notifyAssignedAgent(ticket.assignedTo, ticket);
    
    return ticket;
  }
  
  async escalateTicket(ticketId: string, reason: string) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'ESCALATED',
        escalationReason: reason,
        escalatedAt: new Date(),
        priority: 'CRITICAL',
      },
    });
    
    await this.notifyManagement(ticket);
    
    return ticket;
  }
}

// Integration issues tracking
class IntegrationIssueTracker {
  async trackIssue(issueData: IntegrationIssue) {
    await prisma.integrationIssue.create({
      data: {
        partnerId: issueData.partnerId,
        issueType: issueData.type, // api_failure, sync_error, auth_issue
        severity: issueData.severity, // low, medium, high, critical
        description: issueData.description,
        errorCode: issueData.errorCode,
        stackTrace: issueData.stackTrace,
        endpoint: issueData.endpoint,
        timestamp: new Date(),
        resolved: false,
      },
    });
    
    // Auto-notify if critical
    if (issueData.severity === 'CRITICAL') {
      await this.notifyCriticalIssue(issueData);
    }
  }
}
```

## Error Handling

### Common Error Scenarios

```typescript
enum LoyaltyAPIErrorType {
  INVALID_CUSTOMER = 'INVALID_CUSTOMER',
  INSUFFICIENT_POINTS = 'INSUFFICIENT_POINTS',
  PARTNER_NOT_FOUND = 'PARTNER_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INVALID_TIER = 'INVALID_TIER',
  REDEMPTION_NOT_ALLOWED = 'REDEMPTION_NOT_ALLOWED',
  SYNC_FAILED = 'SYNC_FAILED',
}

class LoyaltyAPIError extends Error {
  constructor(
    public type: LoyaltyAPIErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LoyaltyAPIError';
  }
}

// Error handling middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof LoyaltyAPIError) {
    const statusCode = getErrorStatusCode(err.type);
    const response = {
      error: {
        type: err.type,
        message: err.message,
        details: err.details,
        timestamp: new Date(),
        requestId: req.headers['x-request-id'],
      },
    };
    
    res.status(statusCode).json(response);
    
    // Log error for monitoring
    logger.error('Loyalty API Error', {
      type: err.type,
      message: err.message,
      partnerId: req.headers['x-partner-id'],
      requestId: req.headers['x-request-id'],
    });
  } else {
    res.status(500).json({
      error: {
        type: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date(),
        requestId: req.headers['x-request-id'],
      },
    });
  }
};

// Error recovery strategies
class ErrorRecovery {
  async handleRetryableError(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }
        
        await this.delay(attempt * delayMs);
      }
    }
    
    throw lastError;
  }
  
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'RATE_LIMIT_EXCEEDED',
      'SYNC_FAILED',
    ];
    
    return retryableErrors.includes(error.code) || retryableErrors.includes(error.type);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Best Practices

### Performance Optimization

```typescript
// Connection Pooling
const connectionPool = {
  maxConnections: 10,
  minConnections: 2,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
};

// Caching Strategy
class PartnerCache {
  private redis: Redis;
  private defaultTTL: number = 300; // 5 minutes
  
  async getCachedCustomerData(phoneNumber: string): Promise<CustomerData | null> {
    const cached = await this.redis.get(`customer:${phoneNumber}`);
    return cached ? JSON.parse(cached) : null;
  }
  
  async cacheCustomerData(phoneNumber: string, data: CustomerData): Promise<void> {
    await this.redis.setex(
      `customer:${phoneNumber}`,
      this.defaultTTL,
      JSON.stringify(data)
    );
  }
  
  async invalidateCustomerCache(phoneNumber: string): Promise<void> {
    await this.redis.del(`customer:${phoneNumber}`);
  }
}

// Batch Processing
class BatchProcessor {
  async processBatch(operations: BatchOperation[]): Promise<BatchResult[]> {
    const batchSize = 100;
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await this.processBatchChunk(batch);
      results.push(...batchResults);
      
      // Rate limiting delay
      await this.delay(100);
    }
    
    return results;
  }
}
```

### Data Consistency

```typescript
// Transactional consistency
async function processLoyaltyTransaction(transactionData: LoyaltyTransactionData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify customer balance
    const customer = await tx.user.findUnique({
      where: { id: transactionData.customerId },
    });
    
    if (!customer) {
      throw new LoyaltyAPIError('INVALID_CUSTOMER', 'Customer not found');
    }
    
    // 2. Create transaction record
    const transaction = await tx.loyaltyTransaction.create({
      data: {
        userId: transactionData.customerId,
        type: transactionData.type,
        points: transactionData.points,
        description: transactionData.description,
        expiresAt: transactionData.expiresAt,
      },
    });
    
    // 3. Update customer points
    const updatedCustomer = await tx.user.update({
      where: { id: transactionData.customerId },
      data: {
        loyaltyPoints: {
          increment: transactionData.type === 'EARNED' ? transactionData.points : -transactionData.points,
        },
      },
    });
    
    // 4. Update partner metrics
    if (transactionData.partnerId) {
      await tx.partnerMetrics.upsert({
        where: { partnerId: transactionData.partnerId },
        update: {
          totalTransactions: { increment: 1 },
          totalPoints: { increment: transactionData.points },
        },
        create: {
          partnerId: transactionData.partnerId,
          totalTransactions: 1,
          totalPoints: transactionData.points,
        },
      });
    }
    
    return transaction;
  });
}
```

### Security Best Practices

```typescript
// Input sanitization
const sanitizeInput = (input: any): any => {
  if (typeof input === 'string') {
    return input.trim().substring(0, 1000); // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (key.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) { // Valid field names
        sanitized[key] = sanitizeInput(value);
      }
    }
    return sanitized;
  }
  
  return input;
};

// API key validation
const validateAPIKey = async (apiKey: string): Promise<Partner | null> => {
  const partner = await prisma.partner.findFirst({
    where: {
      apiKey: apiKey,
      isActive: true,
    },
  });
  
  return partner;
};

// IP Whitelisting
const checkIPWhitelist = (req: Request, partnerId: string): boolean => {
  const clientIP = getClientIP(req);
  
  return prisma.allowedIP.findFirst({
    where: {
      partnerId,
      ipAddress: clientIP,
      isActive: true,
    },
  });
};
```

## Troubleshooting

### Common Issues & Solutions

#### Issue: Customer Not Found
```
Error: INVALID_CUSTOMER
Solution: 
1. Verify customer phone number format
2. Check if customer exists in database
3. Ensure customer account is active
4. Verify API authentication
```

#### Issue: Points Not Syncing
```
Error: SYNC_FAILED
Solution:
1. Check partner webhook configuration
2. Verify network connectivity
3. Review API rate limits
4. Check database locks
5. Review error logs
```

#### Issue: Discount Not Applied
```
Error: INVALID_TIER
Solution:
1. Verify customer tier status
2. Check tier benefit configuration
3. Validate partner category mapping
4. Review discount calculation logic
```

### Debug Tools

```typescript
// Partner Debug Endpoint
app.get('/api/partners/debug/:partnerId', async (req, res) => {
  const { partnerId } = req.params;
  
  const debugInfo = {
    partner: await prisma.partner.findUnique({
      where: { id: partnerId },
    }),
    apiKeys: await prisma.partnerApiKey.findMany({
      where: { partnerId },
    }),
    webhooks: await prisma.webhookEndpoint.findMany({
      where: { partnerId },
    }),
    recentTransactions: await prisma.loyaltyTransaction.findMany({
      where: { partnerId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    errorLogs: await prisma.auditLog.findMany({
      where: { partnerId, level: 'ERROR' },
      orderBy: { timestamp: 'desc' },
      take: 20,
    }),
  };
  
  res.json(debugInfo);
});

// Transaction Tracing
const traceTransaction = async (transactionId: string): Promise<TransactionTrace> => {
  const steps = await prisma.$queryRaw`
    SELECT 
      step,
      status,
      message,
      timestamp,
      duration
    FROM transaction_trace 
    WHERE transaction_id = ${transactionId}
    ORDER BY step ASC
  `;
  
  return {
    transactionId,
    steps,
    totalDuration: steps.reduce((sum, step) => sum + step.duration, 0),
  };
};
```

---

## Support Contact

For partner integration support:
- **Email**: partners@restaurant.com
- **Phone**: +234-1-234-5678
- **Documentation**: https://docs.restaurant.com/partners
- **Status Page**: https://status.restaurant.com

---

*Last Updated: October 2024*
*For the latest API documentation and integration guides, visit our partner portal.*
