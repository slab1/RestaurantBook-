# Backend Deployment - Quick Start Guide
## Nigeria Restaurant Tech Platform

Get your backend deployed to production in 3 simple steps.

---

## Prerequisites

Before you begin, ensure you have:
- [ ] Cloud provider account (AWS, Vercel, or DigitalOcean)
- [ ] Domain name purchased and configured
- [ ] Nigerian payment gateway accounts:
  - [ ] Paystack account (https://paystack.com)
  - [ ] Flutterwave account (https://flutterwave.com)
- [ ] Email service (SendGrid or AWS SES)
- [ ] SMS service (Twilio or Africa's Talking)

---

## Step 1: Environment Configuration (15 minutes)

### 1.1 Copy Environment Template

```bash
cp .env.production.template .env.production
```

### 1.2 Fill in Required Values

**Critical Variables (MUST be filled):**

```bash
# Application
APP_URL=https://your-domain.com
NODE_ENV=production

# Database (Get from Supabase, AWS RDS, or DigitalOcean)
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Redis (Get from Redis Cloud or AWS ElastiCache)
REDIS_URL="redis://default:password@host:6379"

# JWT Secrets (Generate with: openssl rand -hex 32)
JWT_SECRET="your-32-char-secret-here"
JWT_REFRESH_SECRET="your-different-32-char-secret-here"

# Paystack (Get from https://dashboard.paystack.com/#/settings/developer)
PAYSTACK_SECRET_KEY="sk_live_xxxxxxxxxxxxxxxxxxxx"
PAYSTACK_PUBLIC_KEY="pk_live_xxxxxxxxxxxxxxxxxxxx"
PAYSTACK_WEBHOOK_SECRET="xxxxxxxxxxxxxxxxxx"

# Flutterwave (Get from https://dashboard.flutterwave.com/settings/apis)
FLUTTERWAVE_SECRET_KEY="FLWSECK-xxxxxxxxxxxxxxxxxxxxxxxx"
FLUTTERWAVE_PUBLIC_KEY="FLWPUBK-xxxxxxxxxxxxxxxxxxxxxxxx"

# Email (Get from SendGrid)
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@your-domain.com"
```

### 1.3 Validate Environment

```bash
npm run validate-env
```

---

## Step 2: Choose Deployment Platform (Pick One)

### Option A: Vercel (Easiest - 10 minutes)

**Best for:** Quick deployment, Next.js applications

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add JWT_SECRET production
# ... add all other env vars
```

**Database:** Use Supabase (https://supabase.com)  
**Redis:** Use Upstash (https://upstash.com)  
**Cost:** ~$60/month

---

### Option B: AWS (Most Scalable - 2 hours)

**Best for:** Large scale, enterprise deployments

#### Quick Deploy with CloudFormation

```bash
# 1. Build and push Docker image
docker build -f Dockerfile.production -t restaurant-platform .
docker tag restaurant-platform:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/restaurant-platform:latest
aws ecr get-login-password | docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/restaurant-platform:latest

# 2. Deploy infrastructure
aws cloudformation create-stack \
  --stack-name restaurant-platform \
  --template-body file://aws/cloudformation-stack.yaml \
  --parameters ParameterKey=Environment,ParameterValue=production \
  --capabilities CAPABILITY_IAM

# 3. Wait for stack creation (10-15 minutes)
aws cloudformation wait stack-create-complete --stack-name restaurant-platform

# 4. Get outputs
aws cloudformation describe-stacks --stack-name restaurant-platform --query 'Stacks[0].Outputs'
```

**Cost:** ~$230/month

---

### Option C: DigitalOcean (Most Cost-Effective - 1 hour)

**Best for:** Budget-conscious deployments

```bash
# 1. Install doctl
brew install doctl  # macOS
# or: snap install doctl  # Linux

# 2. Authenticate
doctl auth init

# 3. Create app
doctl apps create --spec .do/app.yaml

# 4. Monitor deployment
doctl apps list
```

**Cost:** ~$90/month

---

## Step 3: Post-Deployment Setup (15 minutes)

### 3.1 Run Database Migrations

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 3.2 Configure Payment Webhooks

**Paystack:**
1. Go to https://dashboard.paystack.com/#/settings/webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Copy webhook secret to `PAYSTACK_WEBHOOK_SECRET`

**Flutterwave:**
1. Go to https://dashboard.flutterwave.com/settings/webhooks
2. Add webhook URL: `https://your-domain.com/api/webhooks/flutterwave`
3. Copy webhook secret to environment

### 3.3 Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Expected response: {"status":"healthy"}

# Test authentication
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#","firstName":"Test","lastName":"User"}'

# Test payment initialization
curl -X POST https://your-domain.com/api/delivery/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount":5000,"email":"test@test.com","bookingId":"test-123"}'
```

### 3.4 Set Up Monitoring

**Sentry (Error Tracking):**
```bash
# Add Sentry DSN to environment
SENTRY_DSN="https://xxxxxxxxx@sentry.io/xxxxxxx"
```

**Uptime Monitoring:**
- Set up monitoring at https://uptimerobot.com
- Monitor: `/api/health` endpoint
- Check frequency: 1 minute

---

## Deployment Complete! ✅

Your backend is now live at `https://your-domain.com`

### Next Steps

1. **Test all features:**
   - User registration and login
   - Restaurant booking
   - Payment processing
   - Delivery ordering
   - Loyalty program

2. **Monitor performance:**
   - Check Sentry for errors
   - Monitor API response times
   - Track payment success rate

3. **Scale as needed:**
   - Add more server instances
   - Enable auto-scaling
   - Set up CDN

---

## Troubleshooting

### Database Connection Failed
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check connection string format
# Should be: postgresql://user:password@host:5432/db?sslmode=require
```

### Payment Gateway Not Working
```bash
# Verify API keys are for LIVE mode (not test)
# Paystack: sk_live_xxxxx (not sk_test_xxxxx)
# Flutterwave: FLWSECK-xxxxxx (not test keys)

# Test payment initialization
curl -X POST https://api.paystack.co/transaction/initialize \
  -H "Authorization: Bearer $PAYSTACK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","amount":"50000"}'
```

### WebSocket Not Connecting
```bash
# Ensure WebSocket port is exposed (3001)
# Check load balancer supports WebSocket upgrade
# Verify CORS settings allow WebSocket origin
```

---

## Support

### Documentation
- **Full Deployment Guide:** `docs/COMPLETE_BACKEND_DEPLOYMENT.md`
- **Deployment Checklist:** `docs/DEPLOYMENT_CHECKLIST.md`
- **Security Guide:** `docs/SECURITY_BEST_PRACTICES.md`
- **Implementation Summary:** `docs/BACKEND_IMPLEMENTATION_SUMMARY.md`

### Emergency Contacts
- **Technical Issues:** devops@your-platform.com
- **Payment Issues:** payments@your-platform.com
- **Security Issues:** security@your-platform.com

---

## Deployment Options Comparison

| Feature | Vercel | AWS | DigitalOcean |
|---------|--------|-----|--------------|
| **Ease of Use** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Deployment Time** | 10 min | 2 hours | 1 hour |
| **Cost/Month** | $60 | $230 | $90 |
| **Scalability** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Learning Curve** | Easy | Complex | Medium |
| **Best For** | MVP, Small | Enterprise | Growing |

---

**Deployment Time Estimates:**
- Vercel: 30 minutes total
- AWS: 3 hours total
- DigitalOcean: 2 hours total

**Choose Vercel if:** You want the fastest deployment with minimal configuration  
**Choose AWS if:** You need maximum scalability and control  
**Choose DigitalOcean if:** You want balance of simplicity and cost  

---

*This guide is part of the complete backend deployment documentation.*  
*For detailed instructions, see `docs/COMPLETE_BACKEND_DEPLOYMENT.md`*

**Last Updated:** 2025-10-27  
**Version:** 2.0
