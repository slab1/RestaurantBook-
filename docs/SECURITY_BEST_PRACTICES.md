# Security Best Practices
## Nigeria Restaurant Tech Platform

**Production Security Guide - Nigerian Market Focus**

---

## Table of Contents
1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [Payment Security](#payment-security)
4. [API Security](#api-security)
5. [Infrastructure Security](#infrastructure-security)
6. [Compliance](#compliance)
7. [Security Monitoring](#security-monitoring)
8. [Incident Response](#incident-response)

---

## Authentication & Authorization

### Password Security

**Strong Password Policy:**
```typescript
// Enforce password requirements
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])/, 'Must contain lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Must contain uppercase letter')
  .regex(/^(?=.*\d)/, 'Must contain number')
  .regex(/^(?=.*[@$!%*?&])/, 'Must contain special character');

// Hash passwords with bcrypt (salt rounds: 12)
const hashedPassword = await bcrypt.hash(password, 12);
```

**Best Practices:**
- ✅ Minimum 8 characters (recommended: 12+)
- ✅ Require uppercase, lowercase, numbers, special characters
- ✅ Check against common password lists
- ✅ Implement password history (prevent last 5 passwords)
- ✅ Force password change every 90 days (optional)
- ❌ Never store passwords in plain text
- ❌ Never log passwords
- ❌ Never send passwords via email

### JWT Token Security

**Token Configuration:**
```typescript
// Access Token: Short-lived
const accessToken = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '15m',  // 15 minutes
  algorithm: 'HS256',
  issuer: 'restaurant-platform',
  audience: 'api.restaurant-platform.com'
});

// Refresh Token: Longer-lived, stored securely
const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
  expiresIn: '7d',  // 7 days
  algorithm: 'HS256'
});
```

**Token Storage:**
```typescript
// Client-side: Store in httpOnly cookies
res.setHeader('Set-Cookie', [
  `accessToken=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`,
  `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
]);

// Server-side: Track active sessions in Redis
await redis.setex(
  `session:${sessionId}`,
  604800,  // 7 days
  JSON.stringify(sessionData)
);
```

**Best Practices:**
- ✅ Use strong JWT secrets (min 32 characters)
- ✅ Store tokens in httpOnly cookies (not localStorage)
- ✅ Implement token rotation
- ✅ Blacklist tokens on logout
- ✅ Validate token signature and expiration
- ✅ Use separate secrets for access and refresh tokens
- ❌ Never expose JWT secrets
- ❌ Never include sensitive data in JWT payload

### Two-Factor Authentication (2FA)

**Implementation:**
```typescript
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// Generate 2FA secret
const secret = speakeasy.generateSecret({
  name: `Restaurant Platform (${user.email})`,
  issuer: 'Restaurant Platform'
});

// Generate QR code
const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

// Verify 2FA code
const verified = speakeasy.totp.verify({
  secret: user.twoFactorSecret,
  encoding: 'base32',
  token: userProvidedCode,
  window: 2  // Allow 2 time steps before/after
});
```

**Best Practices:**
- ✅ Offer 2FA to all users
- ✅ Require 2FA for admin accounts
- ✅ Provide backup codes (10 single-use codes)
- ✅ Support authenticator apps (Google Authenticator, Authy)
- ✅ Implement account recovery process
- ❌ Don't force 2FA without user education

### Session Management

**Secure Session Handling:**
```typescript
// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,  // HTTPS only
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 604800  // 7 days
  })
};

// Track active sessions
async function createSession(userId: string, ipAddress: string, userAgent: string) {
  const sessionId = crypto.randomUUID();
  
  await prisma.userSession.create({
    data: {
      userId,
      sessionToken: sessionId,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  });
  
  return sessionId;
}

// Invalidate session on suspicious activity
async function invalidateSession(sessionId: string) {
  await prisma.userSession.update({
    where: { sessionToken: sessionId },
    data: { isActive: false }
  });
  
  await redis.del(`sess:${sessionId}`);
}
```

**Best Practices:**
- ✅ Set reasonable session timeouts (15-30 minutes inactivity)
- ✅ Invalidate sessions on logout
- ✅ Track active sessions per user
- ✅ Allow users to revoke sessions remotely
- ✅ Detect and prevent session fixation
- ✅ Monitor for suspicious login patterns
- ❌ Don't allow unlimited concurrent sessions

### Role-Based Access Control (RBAC)

**Permission System:**
```typescript
enum UserRole {
  CUSTOMER = 'CUSTOMER',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

const PERMISSIONS = {
  CUSTOMER: [
    'booking.create',
    'booking.read.own',
    'booking.update.own',
    'booking.delete.own',
    'review.create',
    'profile.read.own',
    'profile.update.own'
  ],
  RESTAURANT_OWNER: [
    'restaurant.create',
    'restaurant.read.own',
    'restaurant.update.own',
    'booking.read.own.restaurant',
    'booking.update.own.restaurant',
    'menu.manage.own',
    'staff.manage.own'
  ],
  ADMIN: [
    '*'  // All permissions
  ],
  STAFF: [
    'booking.read.assigned.restaurant',
    'booking.update.assigned.restaurant',
    'table.update.assigned.restaurant'
  ]
};

// Middleware to check permissions
function requirePermission(permission: string) {
  return async (req, res, next) => {
    const user = req.user;
    const userPermissions = PERMISSIONS[user.role];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({
      error: 'Insufficient permissions',
      required: permission
    });
  };
}
```

**Best Practices:**
- ✅ Implement principle of least privilege
- ✅ Use role-based permissions
- ✅ Audit permission changes
- ✅ Regular permission review
- ✅ Separate admin accounts from user accounts
- ❌ Don't hardcode permissions in code

---

## Data Protection

### Encryption at Rest

**Database Encryption:**
```typescript
// PostgreSQL: Enable encryption at rest (managed service)
// AWS RDS: Enable encryption when creating instance
// Ensure DATABASE_URL uses SSL/TLS

// Encrypt sensitive fields manually
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Encrypt PII before storing
async function createUser(data) {
  return prisma.user.create({
    data: {
      ...data,
      phone: data.phone ? encrypt(data.phone) : null,
      address: data.address ? encrypt(data.address) : null
    }
  });
}
```

**Best Practices:**
- ✅ Encrypt sensitive data at application level
- ✅ Use AES-256-GCM for encryption
- ✅ Rotate encryption keys periodically
- ✅ Store encryption keys in secure vault (AWS KMS, Azure Key Vault)
- ✅ Encrypt backups
- ❌ Never store encryption keys in code or environment variables

### Encryption in Transit

**TLS/SSL Configuration:**
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name restaurant-platform.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/restaurant-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurant-platform.com/privkey.pem;

    # TLS configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # HSTS (force HTTPS)
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name restaurant-platform.com;
    return 301 https://$server_name$request_uri;
}
```

**Database Connections:**
```typescript
// Force SSL for database connections
const DATABASE_URL = process.env.DATABASE_URL + '?sslmode=require';

// Redis TLS
const redisClient = createClient({
  url: process.env.REDIS_TLS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: true
  }
});
```

**Best Practices:**
- ✅ Use TLS 1.2 or higher
- ✅ Force HTTPS for all connections
- ✅ Use HSTS headers
- ✅ Enable SSL for database and Redis connections
- ✅ Validate SSL certificates
- ❌ Don't allow unencrypted connections

### Data Sanitization

**Input Validation:**
```typescript
import { z } from 'zod';
import validator from 'validator';

// Validate and sanitize user input
const UserInputSchema = z.object({
  email: z.string().email().transform(val => validator.normalizeEmail(val)),
  name: z.string().min(1).max(100).transform(val => validator.escape(val)),
  phone: z.string().refine(val => validator.isMobilePhone(val, 'en-NG')),
  address: z.string().max(500).transform(val => validator.escape(val))
});

// SQL injection prevention (Prisma handles this)
// Never use raw SQL with user input
// ❌ Bad: await prisma.$queryRaw`SELECT * FROM users WHERE email = '${userInput}'`
// ✅ Good: await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`

// XSS prevention
import DOMPurify from 'isomorphic-dompurify';

function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
}

// NoSQL injection prevention (if using MongoDB)
function sanitizeMongoQuery(query: any) {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (key.startsWith('$')) {
      continue; // Skip MongoDB operators from user input
    }
    sanitized[key] = value;
  }
  return sanitized;
}
```

**Output Encoding:**
```typescript
// Encode data before rendering
import he from 'he';

function encodeForHtml(str: string): string {
  return he.encode(str);
}

function encodeForJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

function encodeForUrl(str: string): string {
  return encodeURIComponent(str);
}
```

**Best Practices:**
- ✅ Validate all user input
- ✅ Sanitize input before storing
- ✅ Encode output before rendering
- ✅ Use parameterized queries
- ✅ Use ORM (Prisma) to prevent SQL injection
- ❌ Never trust user input
- ❌ Never concatenate user input into SQL queries

### Data Retention & Deletion

**GDPR/NDPR Compliance:**
```typescript
// Right to erasure (right to be forgotten)
async function deleteUserData(userId: string) {
  // Transaction to ensure all data is deleted
  await prisma.$transaction(async (tx) => {
    // Anonymize instead of hard delete (for audit)
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@deleted.com`,
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        address: null,
        dateOfBirth: null,
        isActive: false
      }
    });
    
    // Delete or anonymize related data
    await tx.review.deleteMany({ where: { userId } });
    await tx.socialShare.deleteMany({ where: { userId } });
    
    // Keep bookings for legal reasons but anonymize
    await tx.booking.updateMany({
      where: { userId },
      data: { specialRequests: null, notes: null }
    });
  });
  
  logger.info('User data deleted', { userId, timestamp: new Date() });
}

// Data retention policy
async function deleteExpiredData() {
  const retentionPeriod = 2 * 365; // 2 years
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionPeriod);
  
  // Delete old analytics events
  await prisma.analyticsEvent.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      userId: null // Only delete anonymous events
    }
  });
  
  // Archive old bookings
  const oldBookings = await prisma.booking.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      status: 'COMPLETED'
    }
  });
  
  // Export to archive storage
  await exportToArchive(oldBookings);
  
  // Delete from primary database
  await prisma.booking.deleteMany({
    where: {
      id: { in: oldBookings.map(b => b.id) }
    }
  });
}
```

**Best Practices:**
- ✅ Implement data retention policies
- ✅ Allow users to delete their data
- ✅ Anonymize data instead of hard delete (for audit)
- ✅ Archive old data to cold storage
- ✅ Document data retention periods
- ✅ Comply with GDPR and NDPR regulations

---

## Payment Security

### PCI DSS Compliance

**Never Store Sensitive Payment Data:**
```typescript
// ❌ NEVER store these:
// - Full card numbers
// - CVV/CVC codes
// - Magnetic stripe data
// - PINs

// ✅ Use payment gateway tokenization
async function processPayment(bookingId: string, amount: number, email: string) {
  // Initialize payment with Paystack
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: amount * 100, // Convert to kobo
      currency: 'NGN',
      reference: `BK-${bookingId}-${Date.now()}`,
      callback_url: `${process.env.APP_URL}/payment/callback`,
      metadata: {
        bookingId,
        custom_fields: []
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  // Store only reference, not card details
  await prisma.payment.create({
    data: {
      bookingId,
      amount,
      currency: 'NGN',
      status: 'PENDING',
      stripePaymentIntentId: response.data.data.reference
    }
  });
  
  return response.data.data.authorization_url;
}
```

**Webhook Verification:**
```typescript
import crypto from 'crypto';

function verifyPaystackWebhook(req: Request): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  return hash === req.headers['x-paystack-signature'];
}

async function handlePaymentWebhook(req: Request, res: Response) {
  // Verify webhook signature
  if (!verifyPaystackWebhook(req)) {
    logger.warn('Invalid webhook signature', {
      ip: req.ip,
      body: req.body
    });
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  const event = req.body;
  
  // Process based on event type
  switch (event.event) {
    case 'charge.success':
      await handleSuccessfulPayment(event.data);
      break;
    case 'charge.failed':
      await handleFailedPayment(event.data);
      break;
    default:
      logger.info('Unhandled webhook event', { event: event.event });
  }
  
  res.status(200).json({ received: true });
}
```

**Payment Security Checklist:**
- ✅ Use HTTPS for all payment pages
- ✅ Never store card details
- ✅ Use payment gateway tokenization
- ✅ Verify webhook signatures
- ✅ Log all payment transactions
- ✅ Implement fraud detection
- ✅ Support 3D Secure
- ❌ Never log payment card details
- ❌ Never transmit card details via email

### Fraud Prevention

**Fraud Detection System:**
```typescript
async function detectFraudulentTransaction(
  userId: string,
  amount: number,
  ip: string
): Promise<{ isFraudulent: boolean; reasons: string[] }> {
  const reasons: string[] = [];
  
  // Check 1: Unusual transaction amount
  const userAvgTransaction = await getUserAverageTransaction(userId);
  if (amount > userAvgTransaction * 5) {
    reasons.push('Unusual transaction amount');
  }
  
  // Check 2: Multiple transactions in short time
  const recentTransactions = await getRecentTransactions(userId, 15); // 15 minutes
  if (recentTransactions.length > 3) {
    reasons.push('Multiple transactions in short time');
  }
  
  // Check 3: Suspicious IP (VPN, Tor, known fraud IP)
  const ipRiskScore = await checkIPReputation(ip);
  if (ipRiskScore > 0.7) {
    reasons.push('Suspicious IP address');
  }
  
  // Check 4: Location mismatch
  const userLocation = await getUserLocation(userId);
  const ipLocation = await getIPLocation(ip);
  if (userLocation && ipLocation && 
      calculateDistance(userLocation, ipLocation) > 500) { // 500km
    reasons.push('Location mismatch');
  }
  
  // Check 5: Failed payment attempts
  const failedAttempts = await getFailedPayments(userId, 60); // 60 minutes
  if (failedAttempts.length > 2) {
    reasons.push('Multiple failed payment attempts');
  }
  
  return {
    isFraudulent: reasons.length >= 2,
    reasons
  };
}

// Handle fraudulent transaction
async function handleFraudulentTransaction(
  userId: string,
  transactionId: string,
  reasons: string[]
) {
  // Flag transaction
  await prisma.payment.update({
    where: { id: transactionId },
    data: {
      status: 'FAILED',
      metadata: {
        fraudCheck: {
          flagged: true,
          reasons,
          timestamp: new Date()
        }
      }
    }
  });
  
  // Alert admin
  await sendAdminAlert({
    type: 'FRAUD_DETECTED',
    userId,
    transactionId,
    reasons
  });
  
  // Log for analysis
  logger.warn('Fraudulent transaction detected', {
    userId,
    transactionId,
    reasons
  });
}
```

**Best Practices:**
- ✅ Implement velocity checks (transaction frequency)
- ✅ Monitor for unusual amounts
- ✅ Check IP reputation
- ✅ Detect location mismatches
- ✅ Track failed payment attempts
- ✅ Use machine learning for fraud detection
- ✅ Implement manual review for high-risk transactions

---

## API Security

### Rate Limiting

**Implementation:**
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// General API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Strict rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    error: 'Too many login attempts',
    retryAfter: '15 minutes'
  }
});

// Apply rate limiting
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

**Advanced Rate Limiting:**
```typescript
// User-specific rate limiting
async function checkUserRateLimit(userId: string, action: string): Promise<boolean> {
  const key = `rl:user:${userId}:${action}`;
  const limit = RATE_LIMITS[action] || 10;
  const window = 60; // 1 minute
  
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  if (current > limit) {
    logger.warn('Rate limit exceeded', { userId, action, current, limit });
    return false;
  }
  
  return true;
}

const RATE_LIMITS = {
  'booking.create': 5,
  'review.create': 3,
  'payment.initiate': 3,
  'password.reset': 3
};
```

**Best Practices:**
- ✅ Implement rate limiting on all endpoints
- ✅ Use stricter limits for sensitive endpoints
- ✅ Implement user-specific rate limiting
- ✅ Return proper 429 status code
- ✅ Include Retry-After header
- ✅ Use Redis for distributed rate limiting

### CORS Configuration

**Secure CORS Setup:**
```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://restaurant-platform.com',
      'https://www.restaurant-platform.com',
      'https://app.restaurant-platform.com'
    ];
    
    // Allow requests from allowed origins or no origin (mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Api-Key'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

**Best Practices:**
- ✅ Whitelist specific origins
- ✅ Use HTTPS origins only
- ✅ Validate origin on server
- ✅ Set credentials: true only when needed
- ❌ Never use * for origin in production

### API Authentication

**API Key Management:**
```typescript
// Generate API key
function generateApiKey(): string {
  return `pk_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 10);
}

// Validate API key middleware
async function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // Find API key in database
  const keys = await prisma.apiKey.findMany({
    where: { isActive: true }
  });
  
  for (const key of keys) {
    const isValid = await bcrypt.compare(apiKey, key.keyHash);
    if (isValid) {
      // Update last used
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() }
      });
      
      req.apiKey = key;
      return next();
    }
  }
  
  return res.status(401).json({ error: 'Invalid API key' });
}
```

**Best Practices:**
- ✅ Use API keys for service-to-service communication
- ✅ Hash API keys before storing
- ✅ Implement key rotation
- ✅ Track API key usage
- ✅ Allow users to revoke keys
- ❌ Never expose API keys in client-side code

### Input Validation

**Comprehensive Validation:**
```typescript
import { z } from 'zod';

// Booking creation validation
const CreateBookingSchema = z.object({
  restaurantId: z.string().cuid(),
  tableId: z.string().cuid(),
  bookingTime: z.string().datetime(),
  partySize: z.number().int().min(1).max(20),
  specialRequests: z.string().max(500).optional(),
  eventType: z.enum([
    'BIRTHDAY',
    'ANNIVERSARY',
    'BUSINESS_MEETING',
    'DATE_NIGHT',
    'CELEBRATION',
    'CASUAL_DINING'
  ]).optional(),
  dietaryRestrictions: z.array(z.string()).max(10).optional()
});

// Validate in route handler
app.post('/api/bookings', async (req, res) => {
  try {
    const validatedData = CreateBookingSchema.parse(req.body);
    
    // Process validated data
    const booking = await createBooking(validatedData);
    
    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**Best Practices:**
- ✅ Validate all input data
- ✅ Use schema validation (Zod, Joi)
- ✅ Validate data types, formats, and ranges
- ✅ Sanitize input after validation
- ✅ Return detailed validation errors
- ❌ Never trust client-side validation alone

---

## Infrastructure Security

### Firewall Configuration

**Ubuntu UFW Setup:**
```bash
# Enable UFW
sudo ufw enable

# Allow SSH (change port if not default)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow WebSocket port (only from load balancer)
sudo ufw allow from 10.0.0.0/8 to any port 3001 proto tcp

# Deny all other incoming traffic
sudo ufw default deny incoming

# Allow all outgoing traffic
sudo ufw default allow outgoing

# View rules
sudo ufw status verbose
```

**AWS Security Groups:**
```bash
# Web server security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-web-server \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-web-server \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# Database security group (only from application servers)
aws ec2 authorize-security-group-ingress \
  --group-id sg-database \
  --protocol tcp --port 5432 \
  --source-group sg-web-server

# Redis security group (only from application servers)
aws ec2 authorize-security-group-ingress \
  --group-id sg-redis \
  --protocol tcp --port 6379 \
  --source-group sg-web-server
```

**Best Practices:**
- ✅ Follow principle of least privilege
- ✅ Only allow necessary ports
- ✅ Restrict database and Redis access to application servers
- ✅ Use security groups/firewall rules instead of IP whitelisting
- ✅ Regularly audit firewall rules
- ❌ Never expose database ports publicly

### Container Security

**Docker Security:**
```dockerfile
# Use specific version, not latest
FROM node:18.17.0-alpine

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js || exit 1

# Start application
CMD ["node", "server.js"]
```

**Best Practices:**
- ✅ Use official base images
- ✅ Use specific version tags
- ✅ Run as non-root user
- ✅ Scan images for vulnerabilities (Trivy, Snyk)
- ✅ Minimize image size
- ✅ Use multi-stage builds
- ❌ Never run containers as root
- ❌ Never store secrets in images

### Network Security

**VPC Configuration (AWS):**
```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create public subnet (for load balancers)
aws ec2 create-subnet --vpc-id vpc-xxx \
  --cidr-block 10.0.1.0/24 \
  --availability-zone us-east-1a

# Create private subnet (for application servers)
aws ec2 create-subnet --vpc-id vpc-xxx \
  --cidr-block 10.0.2.0/24 \
  --availability-zone us-east-1a

# Create private subnet (for databases)
aws ec2 create-subnet --vpc-id vpc-xxx \
  --cidr-block 10.0.3.0/24 \
  --availability-zone us-east-1a

# Create NAT gateway for private subnets
aws ec2 create-nat-gateway --subnet-id subnet-public \
  --allocation-id eipalloc-xxx
```

**Best Practices:**
- ✅ Use private subnets for application and database servers
- ✅ Use public subnets only for load balancers
- ✅ Implement network segmentation
- ✅ Use VPN for administrative access
- ✅ Enable VPC flow logs
- ❌ Never put databases in public subnets

---

## Compliance

### GDPR Compliance (EU Users)

**Data Subject Rights:**
```typescript
// Right to access
async function exportUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: true,
      reviews: true,
      payments: true,
      loyaltyProfile: true
    }
  });
  
  // Remove sensitive internal data
  const exportData = {
    personal: {
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth
    },
    bookings: user.bookings,
    reviews: user.reviews,
    loyaltyPoints: user.loyaltyProfile?.currentPointsBalance
  };
  
  return exportData;
}

// Right to rectification
async function updateUserData(userId: string, updates: any) {
  await prisma.user.update({
    where: { id: userId },
    data: updates
  });
  
  logger.info('User data updated', { userId, fields: Object.keys(updates) });
}

// Right to erasure
async function deleteUserData(userId: string) {
  // See Data Retention & Deletion section above
}

// Right to data portability
async function exportDataInStandardFormat(userId: string) {
  const data = await exportUserData(userId);
  return JSON.stringify(data, null, 2); // JSON format
}
```

**Consent Management:**
```typescript
// Track user consents
async function recordConsent(userId: string, consentType: string) {
  await prisma.userConsent.create({
    data: {
      userId,
      consentType,
      consentGiven: true,
      consentDate: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    }
  });
}

// Verify consent before processing
async function hasConsent(userId: string, consentType: string): Promise<boolean> {
  const consent = await prisma.userConsent.findFirst({
    where: {
      userId,
      consentType,
      consentGiven: true,
      isActive: true
    }
  });
  
  return !!consent;
}
```

### NDPR Compliance (Nigeria)

**Nigeria Data Protection Regulation Requirements:**

1. **Lawful Processing:**
   - Obtain consent for data collection
   - Provide privacy notice
   - Process data for specified purposes only

2. **Data Subject Rights:**
   - Right to access personal data
   - Right to rectification
   - Right to erasure
   - Right to object to processing

3. **Data Security:**
   - Implement appropriate security measures
   - Report data breaches within 72 hours
   - Conduct data protection impact assessments

4. **Data Transfer:**
   - Ensure adequate protection for cross-border transfers
   - Implement standard contractual clauses

**Implementation:**
```typescript
// Privacy notice template
const PRIVACY_NOTICE = {
  organization: 'Restaurant Platform Nigeria',
  purpose: [
    'Facilitate restaurant bookings',
    'Process payments',
    'Send booking confirmations',
    'Improve service quality'
  ],
  dataCollected: [
    'Name and contact information',
    'Booking preferences',
    'Payment information (tokenized)',
    'Usage analytics'
  ],
  dataRetention: '2 years after last activity',
  dataSharing: [
    'Partner restaurants',
    'Payment processors (Paystack, Flutterwave)',
    'Delivery partners'
  ],
  rights: [
    'Right to access your data',
    'Right to correct your data',
    'Right to delete your data',
    'Right to withdraw consent'
  ],
  contact: 'privacy@restaurant-platform.ng'
};

// Data breach notification
async function reportDataBreach(breach: DataBreach) {
  // Notify NITDA (Nigeria) within 72 hours
  await sendBreachNotification({
    authority: 'NITDA',
    email: 'cert@nitda.gov.ng',
    breach: {
      date: breach.discoveredAt,
      affectedUsers: breach.affectedUsers,
      dataTypes: breach.dataTypes,
      mitigationSteps: breach.mitigationSteps
    }
  });
  
  // Notify affected users
  for (const userId of breach.affectedUsers) {
    await sendUserBreachNotification(userId, breach);
  }
  
  logger.error('Data breach reported', breach);
}
```

---

## Security Monitoring

### Logging Strategy

**Comprehensive Logging:**
```typescript
import winston from 'winston';

// Security event logger
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'warn'
    }),
    new winston.transports.File({
      filename: 'logs/security-all.log'
    })
  ]
});

// Log security events
function logSecurityEvent(event: string, details: any) {
  securityLogger.info(event, {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
}

// Examples of security events to log
logSecurityEvent('LOGIN_FAILED', {
  userId,
  email,
  ipAddress,
  reason: 'Invalid password'
});

logSecurityEvent('SUSPICIOUS_ACTIVITY', {
  userId,
  activity: 'Multiple failed payment attempts',
  ipAddress,
  count: 5
});

logSecurityEvent('PERMISSION_DENIED', {
  userId,
  resource: '/api/admin/users',
  requiredPermission: 'admin.users.read'
});
```

**Events to Log:**
- ✅ Authentication attempts (success and failure)
- ✅ Authorization failures
- ✅ Password changes
- ✅ Payment transactions
- ✅ Data exports
- ✅ Admin actions
- ✅ API key usage
- ✅ Rate limit violations
- ✅ Suspicious activity patterns

### Intrusion Detection

**Anomaly Detection:**
```typescript
async function detectAnomalies(userId: string) {
  const anomalies: string[] = [];
  
  // Check for unusual login locations
  const recentLogins = await getRecentLogins(userId, 7); // 7 days
  const locations = recentLogins.map(l => l.location);
  const uniqueLocations = new Set(locations);
  
  if (uniqueLocations.size > 3) {
    anomalies.push('Multiple login locations detected');
  }
  
  // Check for unusual activity times
  const currentHour = new Date().getHours();
  if (currentHour >= 2 && currentHour <= 6) {
    const userTypicalHours = await getUserTypicalActivityHours(userId);
    if (!userTypicalHours.includes(currentHour)) {
      anomalies.push('Unusual activity time');
    }
  }
  
  // Check for rapid succession of actions
  const recentActions = await getRecentActions(userId, 5); // 5 minutes
  if (recentActions.length > 20) {
    anomalies.push('Unusually high activity rate');
  }
  
  if (anomalies.length > 0) {
    await flagSuspiciousActivity(userId, anomalies);
  }
  
  return anomalies;
}

async function flagSuspiciousActivity(userId: string, anomalies: string[]) {
  // Require additional verification
  await prisma.user.update({
    where: { id: userId },
    data: { requiresVerification: true }
  });
  
  // Send security alert email
  await sendSecurityAlert(userId, {
    type: 'SUSPICIOUS_ACTIVITY',
    anomalies
  });
  
  // Alert security team
  await sendAdminAlert({
    type: 'SUSPICIOUS_USER_ACTIVITY',
    userId,
    anomalies
  });
  
  logger.warn('Suspicious activity detected', { userId, anomalies });
}
```

### Security Alerts

**Alert Configuration:**
```typescript
const SECURITY_ALERTS = {
  HIGH: {
    channels: ['email', 'sms', 'slack'],
    recipients: ['security@restaurant-platform.com', '+234-XXX-XXX-XXXX']
  },
  MEDIUM: {
    channels: ['email', 'slack'],
    recipients: ['security@restaurant-platform.com']
  },
  LOW: {
    channels: ['email'],
    recipients: ['logs@restaurant-platform.com']
  }
};

async function sendSecurityAlert(severity: string, alert: any) {
  const config = SECURITY_ALERTS[severity];
  
  for (const channel of config.channels) {
    switch (channel) {
      case 'email':
        await sendEmail({
          to: config.recipients[0],
          subject: `[${severity}] Security Alert: ${alert.type}`,
          body: JSON.stringify(alert, null, 2)
        });
        break;
      
      case 'sms':
        await sendSMS({
          to: config.recipients[1],
          message: `Security Alert: ${alert.type}`
        });
        break;
      
      case 'slack':
        await sendSlackMessage({
          channel: '#security-alerts',
          text: `🚨 ${severity} Alert: ${alert.type}`,
          attachments: [{ text: JSON.stringify(alert, null, 2) }]
        });
        break;
    }
  }
}
```

---

## Incident Response

### Incident Response Plan

**Phase 1: Detection & Analysis**
```typescript
// Automated incident detection
async function detectSecurityIncident() {
  const incidents = [];
  
  // Check for unusual error rates
  const errorRate = await getErrorRate(15); // Last 15 minutes
  if (errorRate > 0.05) { // 5%
    incidents.push({
      type: 'HIGH_ERROR_RATE',
      severity: 'MEDIUM',
      details: { errorRate }
    });
  }
  
  // Check for failed login attempts
  const failedLogins = await getFailedLogins(15);
  if (failedLogins > 50) {
    incidents.push({
      type: 'BRUTE_FORCE_ATTACK',
      severity: 'HIGH',
      details: { failedLogins }
    });
  }
  
  // Check for unusual database queries
  const slowQueries = await getSlowQueries(15);
  if (slowQueries.length > 10) {
    incidents.push({
      type: 'DATABASE_PERFORMANCE_ISSUE',
      severity: 'MEDIUM',
      details: { slowQueries: slowQueries.length }
    });
  }
  
  for (const incident of incidents) {
    await createIncident(incident);
  }
}

// Run every minute
setInterval(detectSecurityIncident, 60000);
```

**Phase 2: Containment**
```typescript
async function containIncident(incidentId: string) {
  const incident = await getIncident(incidentId);
  
  switch (incident.type) {
    case 'BRUTE_FORCE_ATTACK':
      // Block attacking IPs
      const attackingIPs = await getAttackingIPs();
      for (const ip of attackingIPs) {
        await blockIP(ip, 24 * 60 * 60); // 24 hours
      }
      break;
    
    case 'DATA_BREACH':
      // Revoke all active sessions
      await revokeAllSessions();
      // Force password reset for all users
      await flagAllUsersForPasswordReset();
      break;
    
    case 'SQL_INJECTION_ATTEMPT':
      // Enable WAF strict mode
      await enableWAFStrictMode();
      // Alert development team
      await alertDevTeam(incident);
      break;
  }
  
  await updateIncident(incidentId, { status: 'CONTAINED' });
}
```

**Phase 3: Eradication & Recovery**
```typescript
async function recoverFromIncident(incidentId: string) {
  const incident = await getIncident(incidentId);
  
  // Apply security patches
  await applySecurityPatches();
  
  // Restore from backup if needed
  if (incident.requiresRestore) {
    await restoreFromBackup(incident.backupTimestamp);
  }
  
  // Verify system integrity
  await verifySystemIntegrity();
  
  // Gradually restore service
  await enableRateLimiting();
  await enableLoadBalancing();
  
  await updateIncident(incidentId, { status: 'RECOVERED' });
}
```

**Phase 4: Post-Incident**
```typescript
async function postIncidentAnalysis(incidentId: string) {
  const incident = await getIncident(incidentId);
  
  // Document incident
  const report = {
    incidentId,
    type: incident.type,
    detectedAt: incident.detectedAt,
    containedAt: incident.containedAt,
    recoveredAt: incident.recoveredAt,
    impact: await assessIncidentImpact(incidentId),
    rootCause: await determineRootCause(incidentId),
    lessonsLearned: await gatherLessonsLearned(incidentId),
    preventiveMeasures: await recommendPreventiveMeasures(incidentId)
  };
  
  // Share report with team
  await shareIncidentReport(report);
  
  // Update incident response plan
  await updateIncidentResponsePlan(report.lessonsLearned);
}
```

### Emergency Contacts

**Incident Response Team:**
```typescript
const INCIDENT_RESPONSE_TEAM = {
  primary: {
    name: 'Security Lead',
    email: 'security@restaurant-platform.com',
    phone: '+234-XXX-XXX-XXXX',
    role: 'Incident Commander'
  },
  backup: {
    name: 'DevOps Lead',
    email: 'devops@restaurant-platform.com',
    phone: '+234-XXX-XXX-XXXX',
    role: 'Technical Lead'
  },
  escalation: {
    name: 'CTO',
    email: 'cto@restaurant-platform.com',
    phone: '+234-XXX-XXX-XXXX',
    role: 'Executive Escalation'
  }
};
```

---

## Security Checklist

### Daily Tasks
- [ ] Review security logs
- [ ] Check for failed login attempts
- [ ] Monitor payment transaction anomalies
- [ ] Review error logs for security issues

### Weekly Tasks
- [ ] Review access logs
- [ ] Check for unusual API usage
- [ ] Review security alerts
- [ ] Update firewall rules if needed
- [ ] Check SSL certificate expiration

### Monthly Tasks
- [ ] Security audit of new features
- [ ] Review user permissions
- [ ] Update dependencies (npm audit)
- [ ] Test backup restoration
- [ ] Review incident response plan
- [ ] Security training for team

### Quarterly Tasks
- [ ] Penetration testing
- [ ] Security code review
- [ ] Review and rotate secrets
- [ ] Update security documentation
- [ ] Compliance audit
- [ ] Disaster recovery drill

---

## Resources

### Tools
- **Dependency Scanning:** npm audit, Snyk, Dependabot
- **Static Analysis:** SonarQube, ESLint security plugin
- **Dynamic Analysis:** OWASP ZAP, Burp Suite
- **Monitoring:** Sentry, Datadog, New Relic
- **Log Management:** ELK Stack, CloudWatch Logs

### References
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **OWASP API Security:** https://owasp.org/www-project-api-security/
- **CWE/SANS Top 25:** https://cwe.mitre.org/top25/
- **NDPR:** https://nitda.gov.ng/ndpr/
- **PCI DSS:** https://www.pcisecuritystandards.org/

---

*This security guide should be reviewed and updated regularly.*  
*Last updated: 2025-10-27*  
*Version: 2.0*
