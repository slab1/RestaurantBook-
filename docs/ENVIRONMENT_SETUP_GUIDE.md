# Environment Configuration Guide
## Tiered Setup System

This project uses a **tiered environment configuration system** to simplify setup and reduce overwhelm. You only configure what you need, when you need it.

---

## 🎯 Quick Start: Choose Your Tier

### Tier 1: Core (5 minutes setup)
**"I just want to run the app locally"**
- **Variables:** 5 required
- **Services:** Database + Auth
- **Cost:** Free
- **Features:** Basic booking, user authentication
- **Use:** `cp .env.tier1.core .env.local`

### Tier 2: Basic (30 minutes setup)
**"I want to launch an MVP"**
- **Variables:** Tier 1 + 8 more = 13 total
- **Services:** + Payments, Maps, Email
- **Cost:** $0-50/month
- **Features:** + Payment processing, location services, notifications
- **Use:** `cp .env.tier2.basic .env.local`

### Tier 3: Advanced (2-4 hours setup)
**"I want all features"**
- **Variables:** Tier 2 + 27 more = 40 total
- **Services:** + Social media, Delivery platforms, All payment gateways
- **Cost:** $50-200/month
- **Features:** + Social sharing, delivery integration, multi-gateway payments
- **Use:** `cp .env.tier3.advanced .env.local`

---

## 📋 Tier Comparison Table

| Feature | Tier 1 (Core) | Tier 2 (Basic) | Tier 3 (Advanced) |
|---------|:-------------:|:--------------:|:-----------------:|
| **Booking System** | ✅ | ✅ | ✅ |
| **User Auth** | ✅ | ✅ | ✅ |
| **Database** | ✅ | ✅ | ✅ |
| **Redis Cache** | ❌ | ✅ | ✅ |
| **Payments (Stripe)** | ❌ | ✅ | ✅ |
| **Payments (Paystack)** | ❌ | Optional | ✅ |
| **Payments (Flutterwave)** | ❌ | ❌ | ✅ |
| **Google Maps** | ❌ | ✅ | ✅ |
| **Email Notifications** | ❌ | ✅ | ✅ |
| **SMS Notifications** | ❌ | ❌ | ✅ |
| **Social Media Sharing** | ❌ | ❌ | ✅ |
| **Delivery Platforms** | ❌ | ❌ | ✅ |
| **Real-time Tracking** | ❌ | ❌ | ✅ |
| **Setup Time** | 5 min | 30 min | 2-4 hrs |
| **Monthly Cost** | Free | $0-50 | $50-200 |

---

## 🚀 Setup Instructions

### Option 1: Start with Tier 1 (Recommended for New Developers)

```bash
# 1. Copy Tier 1 configuration
cp .env.tier1.core .env.local

# 2. Edit .env.local and fill in these 5 values:
#    - DATABASE_URL (get free database from Neon.tech)
#    - JWT_SECRET (generate: openssl rand -base64 32)
#    - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
#    - NEXTAUTH_URL (http://localhost:3000)
#    - APP_URL (http://localhost:3000)

# 3. Install dependencies
npm install

# 4. Setup database
npx prisma migrate dev
npx prisma db seed

# 5. Start development server
npm run dev

# ✅ App running at http://localhost:3000
```

**When to upgrade:** When you need payments or location services, upgrade to Tier 2

---

### Option 2: Start with Tier 2 (Recommended for MVP Launch)

```bash
# 1. Copy Tier 2 configuration
cp .env.tier2.basic .env.local

# 2. Fill in Tier 1 variables (5 required)
#    See instructions above

# 3. Fill in Tier 2 variables (8 additional):
#    - REDIS_URL (get from Upstash.com - free tier)
#    - STRIPE_SECRET_KEY (or PAYSTACK_SECRET_KEY)
#    - STRIPE_PUBLISHABLE_KEY (or PAYSTACK_PUBLIC_KEY)
#    - STRIPE_WEBHOOK_SECRET
#    - GOOGLE_MAPS_API_KEY
#    - SENDGRID_API_KEY
#    - SENDGRID_FROM_EMAIL

# 4. Setup database and run
npx prisma migrate dev
npx prisma db seed
npm run dev

# ✅ Full-featured booking platform with payments
```

**When to upgrade:** When you need social sharing or delivery integration, upgrade to Tier 3

---

### Option 3: Full Setup (Tier 3)

```bash
# 1. Copy Tier 3 configuration
cp .env.tier3.advanced .env.local

# 2. Fill in Tier 1 variables (5 required)
# 3. Fill in Tier 2 variables (8 required)
# 4. Fill in Tier 3 variables (only the ones you need - all optional):
#    - Social media APIs (Twitter, Facebook, etc.)
#    - Delivery platforms (Uber Eats, DoorDash, Grubhub)
#    - Additional payment gateways
#    - SMS notifications (Twilio)
#    - Additional APIs (Yelp, Weather)

# 5. Setup and run
npx prisma migrate dev
npx prisma db seed
npm run dev

# ✅ Enterprise-grade platform with all features
```

---

## 📝 Detailed Variable Descriptions

### Tier 1: Core Variables (5 Required)

| Variable | Description | How to Get | Example |
|----------|-------------|------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | [Neon.tech](https://neon.tech), [Railway](https://railway.app), or [Supabase](https://supabase.com) | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | Generate: `openssl rand -base64 32` | `your-random-32-char-string` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | Generate: `openssl rand -base64 32` | `your-random-32-char-string` |
| `NEXTAUTH_URL` | App URL for auth callbacks | Your domain or `http://localhost:3000` | `http://localhost:3000` |
| `APP_URL` | Base application URL | Same as NEXTAUTH_URL | `http://localhost:3000` |

### Tier 2: Basic Variables (8 Additional)

| Variable | Description | Free Tier? | Required? |
|----------|-------------|:----------:|:---------:|
| `REDIS_URL` | Redis cache connection | ✅ Yes ([Upstash](https://upstash.com)) | Recommended |
| `REDIS_PASSWORD` | Redis password | - | If required |
| `STRIPE_SECRET_KEY` | Stripe payment processing | ✅ Test mode | Choose ONE |
| `PAYSTACK_SECRET_KEY` | Paystack (Nigerian payments) | ✅ Test mode | Choose ONE |
| `GOOGLE_MAPS_API_KEY` | Location services | ✅ $200 credit | Highly Recommended |
| `SENDGRID_API_KEY` | Email sending | ✅ 12k emails/mo | Recommended |
| `SENDGRID_FROM_EMAIL` | Sender email address | - | If using SendGrid |

### Tier 3: Advanced Variables (27 Optional)

All Tier 3 variables are **optional**. Only configure the features you need:

**Social Media (7 platforms):**
- Twitter, Facebook, LinkedIn, Instagram, Pinterest, Telegram, Bitly
- **Note:** URL-based sharing works without API keys
- **Only needed for:** Direct posting to social media

**Delivery Platforms (3 services):**
- Uber Eats, DoorDash, Grubhub
- **Only needed if:** You want delivery integration

**Additional Payments:**
- Flutterwave (Nigerian alternative to Paystack)
- **Only needed if:** You want multiple payment options

**Communications:**
- Twilio (SMS notifications)
- **Only needed if:** You want SMS booking confirmations

**Additional APIs:**
- Yelp (restaurant data), Weather (contextual recommendations)
- **Only needed for:** Enhanced features

---

## 🔧 Progressive Setup Strategy

### Week 1: Start Simple
```bash
cp .env.tier1.core .env.local
# Just 5 variables
# Launch with basic booking
```

### Week 2: Add Payments
```bash
# Add to .env.local:
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
GOOGLE_MAPS_API_KEY=...
```

### Week 3: Add Email
```bash
# Add to .env.local:
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
```

### Week 4: Add Social Sharing
```bash
# Add to .env.local (only the platforms you want):
TWITTER_BEARER_TOKEN=...
FACEBOOK_ACCESS_TOKEN=...
```

**Benefit:** Gradual complexity increase, easier to debug

---

## 🎓 Onboarding Path for New Developers

### Day 1: Local Development (Tier 1)
1. `cp .env.tier1.core .env.local`
2. Fill in 5 core variables
3. `npm install && npx prisma migrate dev && npm run dev`
4. **Goal:** See the app running locally

### Week 1: Add Basic Features (Tier 2)
1. `cp .env.tier2.basic .env.local`
2. Add payment gateway (Stripe or Paystack)
3. Add Google Maps API
4. **Goal:** Complete booking flow with payments

### Week 2-3: Production Launch (Tier 2)
1. Deploy to Vercel/Railway
2. Set up production database
3. Configure production payment gateway
4. **Goal:** Live MVP

### Month 2+: Advanced Features (Tier 3)
1. Add social sharing (one platform at a time)
2. Add delivery integration (if needed)
3. Add SMS notifications (if needed)
4. **Goal:** Full-featured platform

---

## 🐛 Troubleshooting

### "Missing environment variable" error

**Problem:** App won't start, shows missing variable error

**Solution:**
1. Check which tier you copied: `head -n 1 .env.local`
2. Verify all Tier 1 variables are filled
3. Use the variable checker: `npm run check-env` *(coming soon)*

### "Database connection failed"

**Problem:** Cannot connect to database

**Solution:**
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
2. Check database is running (if local)
3. Test connection: `npx prisma db pull`

### "Stripe API key invalid"

**Problem:** Payments not working

**Solution:**
1. Verify you're using **test** keys for development
2. Check key starts with `sk_test_` (not `sk_live_`)
3. Confirm webhook secret matches Stripe dashboard

### "Google Maps not loading"

**Problem:** Map doesn't show on restaurant pages

**Solution:**
1. Verify `GOOGLE_MAPS_API_KEY` is set
2. Check API is enabled in Google Cloud Console
3. Verify billing is enabled (for production use)

---

## 📊 Cost Breakdown

### Tier 1: Free
- Database: Neon free tier (10GB)
- Total: **$0/month**

### Tier 2: $0-50/month
- Database: Neon free → $19/mo
- Redis: Upstash free → $10/mo
- Stripe: Transaction fees only (2.9% + $0.30)
- Google Maps: $200 free credit/mo → $0-20/mo
- SendGrid: Free (12k emails) → $15/mo (40k emails)
- Total: **$0-50/month**

### Tier 3: $50-200/month
- All Tier 2 costs: $0-50/mo
- Twilio SMS: $20-100/mo (depends on volume)
- Delivery platform fees: Variable
- Social media APIs: Mostly free
- Total: **$50-200/month** (depending on usage)

---

## 🚦 Feature Flags

The application automatically enables/disables features based on configured variables:

```typescript
// Automatic feature detection
if (process.env.STRIPE_SECRET_KEY) {
  // Enable Stripe payments ✅
}

if (process.env.TWITTER_BEARER_TOKEN) {
  // Enable Twitter direct posting ✅
} else {
  // Still show URL-based Twitter sharing ✅
}

if (process.env.GOOGLE_MAPS_API_KEY) {
  // Enable map features ✅
} else {
  // Show static address instead ✅
}
```

**Benefit:** No feature breaks if API keys missing

---

## 📖 Related Documentation

- **Backend Architecture:** [BACKEND_ARCHITECTURE_DECISION.md](./BACKEND_ARCHITECTURE_DECISION.md)
- **Deployment Guide:** [deployment-guide.md](./deployment-guide.md)
- **Social Media Setup:** [SOCIAL_MEDIA_API_INTEGRATION.md](./SOCIAL_MEDIA_API_INTEGRATION.md)
- **Pain Points Analysis:** [PROJECT_PAIN_POINTS_ANALYSIS.md](./PROJECT_PAIN_POINTS_ANALYSIS.md)

---

## 🆘 Need Help?

1. **Check health status:** `GET /api/health` *(coming soon)*
2. **Run setup wizard:** `npm run setup-wizard` *(coming soon)*
3. **View configured features:** Check feature flags dashboard *(coming soon)*

---

**Last Updated:** 2025-10-31  
**Version:** 1.0
