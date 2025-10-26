# Deployment Instructions - Restaurant Booking Platform

## Overview
This document provides step-by-step instructions for deploying the restaurant booking platform with delivery integration features to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Testing](#testing)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Accounts
- [ ] PostgreSQL database (Supabase, AWS RDS, or similar)
- [ ] Redis instance (Redis Cloud, AWS ElastiCache, or similar)
- [ ] Vercel account (for Vercel deployment) OR Docker host (for containerized deployment)
- [ ] Delivery platform accounts:
  - [ ] Uber Eats Developer Account
  - [ ] DoorDash Developer Account
  - [ ] Grubhub Developer Account
- [ ] Payment gateway accounts:
  - [ ] Paystack Account (Nigerian markets)
  - [ ] Flutterwave Account (Nigerian markets)

### Local Development Tools
- Node.js 18+ and pnpm
- Docker and Docker Compose (for containerized deployment)
- Git

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repository-url>
cd <project-directory>
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.production` file based on `.env.example`:

```bash
cp .env.example .env.production
```

**Critical Environment Variables to Configure:**

#### Database Configuration
```env
DATABASE_URL="postgresql://username:password@host:5432/restaurant_booking"
REDIS_URL="redis://:password@host:6379"
```

#### Application URLs
```env
NEXTAUTH_URL="https://your-production-domain.com"
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"
APP_URL="https://your-production-domain.com"
```

#### Authentication
```env
JWT_SECRET="<generate-strong-secret-key>"
NEXTAUTH_SECRET="<generate-strong-secret-key>"
```

#### Delivery Platform APIs

**Uber Eats:**
```env
UBER_EATS_CLIENT_ID="your-uber-eats-client-id"
UBER_EATS_CLIENT_SECRET="your-uber-eats-client-secret"
UBER_EATS_API_URL="https://api.uber.com/v1/eats"
UBER_EATS_WEBHOOK_SECRET="your-uber-eats-webhook-secret"
```

**DoorDash:**
```env
DOORDASH_DEVELOPER_ID="your-doordash-developer-id"
DOORDASH_KEY_ID="your-doordash-key-id"
DOORDASH_SIGNING_SECRET="your-doordash-signing-secret"
DOORDASH_API_URL="https://openapi.doordash.com/drive/v2"
```

**Grubhub:**
```env
GRUBHUB_API_KEY="your-grubhub-api-key"
GRUBHUB_API_SECRET="your-grubhub-api-secret"
GRUBHUB_API_URL="https://api.grubhub.com/v1"
GRUBHUB_WEBHOOK_SECRET="your-grubhub-webhook-secret"
```

#### Payment Gateways

**Paystack:**
```env
PAYSTACK_SECRET_KEY="sk_live_your-paystack-secret-key"
PAYSTACK_PUBLIC_KEY="pk_live_your-paystack-public-key"
PAYSTACK_WEBHOOK_SECRET="your-paystack-webhook-secret"
```

**Flutterwave:**
```env
FLUTTERWAVE_SECRET_KEY="FLWSECK-your-flutterwave-secret-key"
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-your-flutterwave-public-key"
FLUTTERWAVE_ENCRYPTION_KEY="FLWSECK-your-encryption-key"
FLUTTERWAVE_WEBHOOK_SECRET="your-flutterwave-webhook-secret"
```

#### WebSocket Configuration
```env
WEBSOCKET_PORT="3001"
WEBSOCKET_PATH="/socket.io"
```

#### Feature Flags
```env
ENABLE_DELIVERY_PLATFORMS="true"
ENABLE_REAL_TIME_TRACKING="true"
```

### 3. Generate Secure Keys

Generate strong secrets for production:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### 1. Create Production Database

**Option A: Using Supabase (Recommended)**
1. Create a new project at https://supabase.com
2. Copy the database connection string
3. Update `DATABASE_URL` in `.env.production`

**Option B: Using AWS RDS**
1. Create PostgreSQL RDS instance
2. Configure security groups for access
3. Update `DATABASE_URL` in `.env.production`

### 2. Run Database Migrations

```bash
# Set production database URL
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 3. Seed Delivery Platforms

```bash
node scripts/seed-delivery-platforms.js
```

This will create the default delivery platform configurations:
- Uber Eats
- DoorDash
- Grubhub

### 4. Verify Database Setup

```bash
# Check database connection
npx prisma db push --skip-generate

# View database in Prisma Studio
npx prisma studio
```

---

## Deployment Options

Choose one of the following deployment methods:

### Option 1: Vercel Deployment (Recommended for Next.js)

#### Step 1: Install Vercel CLI
```bash
pnpm install -g vercel
```

#### Step 2: Link Project
```bash
vercel link
```

#### Step 3: Configure Environment Variables

Add all environment variables from `.env.production` to Vercel:

```bash
# Option A: Using Vercel CLI
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
# ... add all other variables

# Option B: Using Vercel Dashboard
# Go to Settings → Environment Variables
# Add each variable manually
```

#### Step 4: Deploy
```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy is configured)
git push origin main
```

#### Step 5: Configure Custom Domain (Optional)
1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your domain

---

### Option 2: Docker Deployment

#### Step 1: Build Production Image

```bash
docker build -f Dockerfile.production -t restaurant-booking-app:latest .
```

#### Step 2: Deploy with Docker Compose

```bash
# Set environment variables
export DB_USER=your_db_user
export DB_PASSWORD=your_db_password
export REDIS_PASSWORD=your_redis_password

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### Step 3: Configure Nginx (Optional)

The included nginx configuration provides:
- SSL/TLS termination
- Load balancing
- Gzip compression
- Security headers

Configure SSL certificates in `nginx/ssl/`:
```bash
# Place your SSL certificates
cp your-cert.pem nginx/ssl/cert.pem
cp your-key.pem nginx/ssl/key.pem
```

#### Step 4: Access Application

- Application: http://localhost:3000 (or http://your-domain.com via nginx)
- WebSocket: http://localhost:3001

---

### Option 3: Kubernetes Deployment

For high-availability production deployments, refer to:
`docs/PRODUCTION_DEPLOYMENT_GUIDE.md` → Kubernetes section

---

## Post-Deployment Configuration

### 1. Configure Delivery Platform Webhooks

Each delivery platform requires webhook URLs for real-time updates.

**Uber Eats Webhooks:**
```
URL: https://your-domain.com/api/webhooks/uber-eats
Events: order.created, order.updated, order.cancelled
```

**DoorDash Webhooks:**
```
URL: https://your-domain.com/api/webhooks/doordash
Events: delivery.created, delivery.updated, delivery.completed
```

**Grubhub Webhooks:**
```
URL: https://your-domain.com/api/webhooks/grubhub
Events: order_placed, order_confirmed, order_cancelled
```

### 2. Configure Payment Webhooks

**Paystack:**
```
URL: https://your-domain.com/api/delivery/payment/webhooks/paystack
Events: charge.success, charge.failed, transfer.success
```

**Flutterwave:**
```
URL: https://your-domain.com/api/delivery/payment/webhooks/flutterwave
Events: charge.completed, charge.failed
```

### 3. Connect Restaurant to Delivery Platforms

For each restaurant, connect to delivery platforms via the dashboard:

```bash
POST /api/delivery/platforms/connect
{
  "restaurantId": "restaurant-id",
  "platformId": "platform-id",
  "credentials": {
    "apiKey": "...",
    "storeId": "..."
  }
}
```

### 4. Sync Restaurant Menus

```bash
POST /api/delivery/menu-sync
{
  "restaurantId": "restaurant-id",
  "platforms": ["uber-eats", "doordash", "grubhub"]
}
```

---

## Testing

### 1. Health Check Endpoints

```bash
# Application health
curl https://your-domain.com/api/health

# Database connection
curl https://your-domain.com/api/health/db

# Redis connection
curl https://your-domain.com/api/health/redis
```

### 2. Test Delivery Order Flow

```bash
# Create test order
curl -X POST https://your-domain.com/api/delivery/orders \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "test-restaurant-id",
    "items": [...],
    "deliveryAddress": {...}
  }'

# Track order
curl https://your-domain.com/api/delivery/tracking/{orderId}
```

### 3. Test WebSocket Connection

```javascript
const socket = io('https://your-domain.com:3001');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  socket.emit('track_order', { orderId: 'test-order-id' });
});

socket.on('location_update', (data) => {
  console.log('Location update:', data);
});
```

### 4. Test Payment Flow

```bash
# Initialize payment
curl -X POST https://your-domain.com/api/delivery/payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-id",
    "gateway": "paystack"
  }'
```

---

## Monitoring & Maintenance

### 1. Application Monitoring

**Recommended Tools:**
- **Vercel Analytics** (for Vercel deployments)
- **Datadog** or **New Relic** (for comprehensive monitoring)
- **Sentry** (for error tracking)

**Key Metrics to Monitor:**
- API response times
- Database query performance
- WebSocket connection count
- Delivery order success rate
- Payment transaction success rate

### 2. Log Monitoring

**Docker Deployments:**
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f app

# View specific container logs
docker logs restaurant-booking-app-prod --tail 100 -f
```

**Vercel Deployments:**
- Use Vercel Dashboard → Logs
- Integrate with external log aggregation services

### 3. Database Maintenance

```bash
# Backup database (PostgreSQL)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Vacuum database (monthly)
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

### 4. Redis Maintenance

```bash
# Monitor Redis memory
redis-cli INFO memory

# Clear cache if needed
redis-cli FLUSHDB
```

### 5. Security Updates

```bash
# Update dependencies regularly
pnpm update

# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit fix
```

---

## Rollback Procedure

### Vercel Deployment Rollback

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback <deployment-url>
```

### Docker Deployment Rollback

```bash
# Tag current image as backup
docker tag restaurant-booking-app:latest restaurant-booking-app:backup

# Pull previous image
docker pull restaurant-booking-app:previous-tag

# Restart with previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Database Rollback

```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back <migration-name>

# Restore from backup
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

---

## Troubleshooting

### Common Issues

#### Issue: Database connection failed
**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database firewall rules allow connections
3. Ensure database is running and accessible

#### Issue: WebSocket connection failed
**Solution:**
1. Verify `WEBSOCKET_PORT` is open
2. Check reverse proxy WebSocket configuration
3. Ensure CORS is properly configured

#### Issue: Delivery platform API errors
**Solution:**
1. Verify API credentials are correct
2. Check platform API status pages
3. Review webhook configurations
4. Check API rate limits

#### Issue: Payment failures
**Solution:**
1. Verify payment gateway credentials
2. Check webhook secret keys match
3. Review transaction logs in payment dashboard
4. Ensure production API keys are used (not test keys)

---

## Support & Resources

### Documentation
- [Delivery Integration Guide](./DELIVERY_INTEGRATION.md)
- [Delivery Setup Guide](./DELIVERY_SETUP.md)
- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)

### External Resources
- Uber Eats API: https://developer.uber.com/docs/eats
- DoorDash API: https://developer.doordash.com/docs
- Grubhub API: https://developer.grubhub.com/docs
- Paystack Docs: https://paystack.com/docs/api
- Flutterwave Docs: https://developer.flutterwave.com/docs

---

## Deployment Checklist

Before going live, verify all items:

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database created and migrated
- [ ] Redis instance configured
- [ ] Delivery platform accounts created
- [ ] Payment gateway accounts configured
- [ ] SSL certificates installed
- [ ] Domain DNS configured

### Deployment
- [ ] Application deployed successfully
- [ ] Health checks passing
- [ ] Database connections working
- [ ] Redis connections working
- [ ] WebSocket server running

### Post-Deployment
- [ ] Webhooks configured for all platforms
- [ ] Test orders completed successfully
- [ ] Payment transactions working
- [ ] Real-time tracking functional
- [ ] Monitoring dashboards set up
- [ ] Backup procedures configured
- [ ] Team access configured

### Production Readiness
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Error tracking configured
- [ ] Logging configured
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

**Last Updated:** 2025-10-27
**Version:** 1.0.0
