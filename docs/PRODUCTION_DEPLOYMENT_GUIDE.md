# Production Deployment Guide

## Prerequisites

Before deploying, you'll need accounts and API credentials for:

### Required Services
1. **Hosting Platform** (choose one):
   - Vercel (recommended for Next.js): https://vercel.com
   - Railway: https://railway.app
   - AWS/GCP/Azure
   - Self-hosted VPS

2. **Database**:
   - PostgreSQL (Neon, Supabase, or Railway provides free tier)
   - Get connection string

3. **Redis**:
   - Redis Cloud, Upstash, or Railway
   - Get connection string

### Third-Party API Credentials

4. **Delivery Platforms** (if using delivery features):
   - Uber Eats Developer: https://developer.uber.com/
   - DoorDash Developer: https://developer.doordash.com/
   - Grubhub Developer: https://developer.grubhub.com/

5. **Payment Gateways** (for Nigerian market):
   - Paystack: https://paystack.com/signup
   - Flutterwave: https://flutterwave.com/signup

6. **Communication** (optional):
   - Twilio: https://www.twilio.com/try-twilio (for SMS)
   - SendGrid/SMTP: for emails

---

## Deployment Option 1: Vercel (Recommended)

### Step 1: Prepare Database

1. **Create PostgreSQL database**:
   ```bash
   # Using Neon (free tier)
   # 1. Sign up at https://neon.tech
   # 2. Create a new project
   # 3. Copy the connection string
   ```

2. **Create Redis instance**:
   ```bash
   # Using Upstash (free tier)
   # 1. Sign up at https://upstash.com
   # 2. Create a new Redis database
   # 3. Copy the connection string
   ```

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in all required values:
   ```bash
   DATABASE_URL="your-postgresql-connection-string"
   REDIS_URL="your-redis-connection-string"
   # ... fill in all other variables
   ```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   # First deployment
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Add environment variables** in Vercel Dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all variables from `.env`

### Step 4: Run Database Migration

```bash
# After first deployment, run migrations
DATABASE_URL="your-vercel-postgres-url" npx prisma migrate deploy
DATABASE_URL="your-vercel-postgres-url" npx prisma db seed
```

---

## Deployment Option 2: Railway

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Initialize Project

```bash
railway init
railway link
```

### Step 3: Add PostgreSQL and Redis

```bash
railway add --plugin postgresql
railway add --plugin redis
```

### Step 4: Deploy

```bash
railway up
```

Railway will automatically:
- Build your Next.js app
- Run Prisma migrations
- Set up DATABASE_URL and REDIS_URL

### Step 5: Add Environment Variables

```bash
railway variables set PAYSTACK_SECRET_KEY=sk_test_xxx
railway variables set FLUTTERWAVE_SECRET_KEY=FLWSECK_xxx
# Add all other required variables
```

---

## Deployment Option 3: Docker (Self-Hosted)

### Step 1: Prepare Server

```bash
# SSH into your VPS
ssh user@your-server-ip

# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 2: Clone and Configure

```bash
git clone your-repository.git
cd restaurant-booking-system

# Copy and configure environment
cp .env.example .env
nano .env  # Edit with your values
```

### Step 3: Build and Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker-compose -f docker-compose.prod.yml exec app npx prisma db seed
```

### Step 4: Configure Nginx (Optional)

```bash
# Install Nginx for SSL/reverse proxy
sudo apt install nginx certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

---

## Getting API Credentials

### 1. Paystack (Nigerian Payments)

```bash
# Steps:
1. Go to https://paystack.com/signup
2. Verify your business
3. Navigate to Settings > API Keys & Webhooks
4. Copy Test keys for development
5. After KYC approval, use Live keys for production

# Add to .env:
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
```

### 2. Flutterwave (Alternative Payment)

```bash
# Steps:
1. Sign up at https://flutterwave.com/signup
2. Complete KYC verification
3. Go to Settings > API
4. Copy API keys

# Add to .env:
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxx
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx
```

### 3. Uber Eats API

```bash
# Steps:
1. Sign up at https://developer.uber.com/
2. Create a new application
3. Enable Eats API
4. Get API credentials from Dashboard

# Add to .env:
UBER_EATS_API_KEY=your_api_key
UBER_EATS_CLIENT_ID=your_client_id
```

### 4. DoorDash API

```bash
# Steps:
1. Apply at https://developer.doordash.com/
2. Wait for approval (requires business verification)
3. Access credentials in Developer Portal

# Add to .env:
DOORDASH_DEVELOPER_ID=your_developer_id
DOORDASH_KEY_ID=your_key_id
```

### 5. Grubhub API

```bash
# Steps:
1. Contact Grubhub Developer Relations
2. Complete partnership agreement
3. Receive API credentials

# Add to .env:
GRUBHUB_API_KEY=your_api_key
GRUBHUB_API_SECRET=your_api_secret
```

---

## Post-Deployment Configuration

### 1. Set Up Webhooks

After deployment, configure webhooks for real-time updates:

```bash
# Paystack Webhook URL
https://your-domain.com/api/webhooks/paystack

# Flutterwave Webhook URL
https://your-domain.com/api/webhooks/flutterwave

# Delivery Platform Webhooks
https://your-domain.com/api/delivery/webhooks/uber-eats
https://your-domain.com/api/delivery/webhooks/doordash
https://your-domain.com/api/delivery/webhooks/grubhub
```

### 2. Test Payment Integration

```bash
# Use test cards provided by payment gateways

# Paystack Test Card
Card: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date
PIN: 0000

# Flutterwave Test Card
Card: 5531 8866 5214 2950
CVV: 564
Expiry: 09/32
PIN: 3310
```

### 3. Verify Delivery Integration

```bash
# Test with sandbox credentials first
# Create test orders
# Verify webhooks are received
# Check real-time tracking works
```

---

## Health Checks & Monitoring

### Application Health Check

```bash
curl https://your-domain.com/api/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2025-10-27T05:31:45Z"
}
```

### Monitor Logs

```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f app
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
DATABASE_URL="your-connection-string" npx prisma db push

# If fails, check:
1. Connection string format is correct
2. Database is accessible from your deployment
3. IP whitelist (if using cloud database)
```

### Payment Integration Not Working

```bash
# Check:
1. API keys are correctly set in environment variables
2. Webhook URLs are configured in payment dashboard
3. Test mode is enabled for development
4. Webhook signatures are being validated correctly
```

### Delivery Platform Issues

```bash
# Common issues:
1. API credentials not approved (check with platform)
2. Sandbox vs production environment mismatch
3. Restaurant not connected to platform
4. Menu not synchronized

# Debug:
- Check API logs: /api/delivery/menu-sync
- Verify platform connection status
- Test with manual API calls
```

---

## Security Checklist

Before going live:

- [ ] All environment variables are set securely
- [ ] Database uses strong password
- [ ] SSL certificate is configured
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Webhook signatures are validated
- [ ] User input is sanitized
- [ ] File uploads are secured
- [ ] Error messages don't expose sensitive info
- [ ] Security headers are set (Helmet.js)

---

## Performance Optimization

```bash
# Enable production optimizations
NODE_ENV=production

# Use CDN for static assets
# Configure caching headers
# Enable compression
# Optimize images
# Use Redis for session storage
```

---

## Scaling Considerations

### Horizontal Scaling

```bash
# Vercel: Automatic
# Railway: Enable autoscaling in settings
# Docker: Use Docker Swarm or Kubernetes
```

### Database Optimization

```bash
# Add indexes for frequent queries
npx prisma studio

# Enable connection pooling
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```

---

## Support Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Prisma Deployment**: https://www.prisma.io/docs/guides/deployment
- **Vercel Documentation**: https://vercel.com/docs
- **Railway Documentation**: https://docs.railway.app

---

## Maintenance

### Backup Database

```bash
# PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated backups (recommended)
# Use your hosting provider's backup features
```

### Update Dependencies

```bash
npm update
npm audit fix
npx prisma migrate deploy  # After Prisma updates
```

---

**Your application is ready for deployment!** Choose the deployment option that best fits your needs and follow the steps above.

For questions or issues, refer to the documentation or contact support.
