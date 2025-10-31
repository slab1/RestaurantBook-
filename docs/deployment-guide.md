# Restaurant Booking Platform - Complete Deployment Guide

## Overview
This guide provides step-by-step instructions to deploy the complete restaurant booking platform with Supabase backend, Stripe payments, and frontend integration.

## Architecture
- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth, Storage)
- **Payments**: Stripe (one-time payments and subscriptions)
- **Deployment**: Vercel/Netlify for frontend, Supabase for backend

## Prerequisites
- Node.js 18+ installed
- Supabase account
- Stripe account
- Git repository

## Phase 1: Supabase Backend Setup

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Note your project URL and anon key from Settings > API
4. Enable Row Level Security (RLS) in Database settings

### 1.2 Database Schema Setup

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

#### Option B: Manual SQL Execution
1. Go to Supabase Dashboard > SQL Editor
2. Execute each migration file in order:
   - `20251028_initial_schema.sql`
   - `20251028_rls_policies.sql` 
   - `20251028_seed_data.sql`

### 1.3 Deploy Edge Functions

#### Method 1: Using Supabase CLI
```bash
# Deploy all edge functions
supabase functions deploy create-booking
supabase functions deploy create-order
supabase functions deploy stripe-webhook
supabase functions deploy send-notification

# Set environment variables
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set APP_URL=https://your-domain.com
```

#### Method 2: Manual Deployment
1. Create each function in Supabase Dashboard > Edge Functions
2. Copy code from respective folders
3. Set environment variables in function settings

### 1.4 Configure Storage Buckets
1. Go to Supabase Dashboard > Storage
2. Create public buckets:
   - `profile-avatars` (images only, 5MB limit)
   - `restaurant-images` (images only, 10MB limit)
   - `menu-items` (images only, 5MB limit)

### 1.5 Setup Authentication
1. Go to Authentication > Settings
2. Configure providers as needed:
   - Email/Password (enabled by default)
   - Google OAuth (optional)
   - GitHub OAuth (optional)

## Phase 2: Stripe Payment Setup

### 2.1 Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create account
2. Complete account verification
3. Go to Developers > API keys
4. Copy test/live secret key

### 2.2 Configure Webhooks
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy webhook signing secret

### 2.3 Product Configuration
Create products in Stripe Dashboard:
- **Booking Deposit**: $20 (deposit for reservations)
- **Service Fee**: 3.5% (platform fee)

## Phase 3: Frontend Deployment

### 3.1 Environment Variables
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3.2 Install Dependencies
```bash
npm install
npm install @supabase/supabase-js @stripe/stripe-js stripe
npm install lucide-react date-fns
```

### 3.3 Database Integration Migration
Update all localStorage code to Supabase queries:

#### Replace Profile Service
```typescript
// Old localStorage approach
const profile = localStorage.getItem('userProfile')

// New Supabase approach
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

#### Replace Cart Service
```typescript
// Old localStorage approach
const cart = localStorage.getItem('cart')

// New Supabase approach
const { data: cart } = await supabase
  .from('order_items')
  .select(`
    *,
    menu_items (*),
    orders (*)
  `)
  .eq('user_id', user.id)
  .eq('order_status', 'pending')
```

### 3.4 Build and Deploy
```bash
# Build application
npm run build

# Deploy to Vercel
npm install -g vercel
vercel

# Or deploy to Netlify
npm run build
# Upload dist folder to Netlify
```

## Phase 4: Integration Testing

### 4.1 Test Database Operations
```javascript
// Test profile creation
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    email: user.email,
    full_name: 'Test User'
  })

// Test booking creation
const { data, error } = await supabase.functions.invoke('create-booking', {
  body: {
    restaurant_id: 'uuid',
    booking_date: '2024-12-01',
    booking_time: '19:00',
    party_size: 4,
    special_requests: 'Birthday celebration'
  }
})
```

### 4.2 Test Payment Flow
1. Test booking deposit payment
2. Test order payment
3. Verify webhook handling
4. Check database updates

### 4.3 Test Real-time Features
```javascript
// Test booking availability updates
supabase
  .channel('booking-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('Booking updated:', payload)
  })
  .subscribe()
```

## Phase 5: Production Deployment

### 5.1 Domain Setup
1. Purchase domain name
2. Configure DNS for deployment platform
3. Update CORS settings in Supabase
4. Update environment variables

### 5.2 Security Checklist
- [ ] Row Level Security (RLS) enabled
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Webhook secrets set
- [ ] Rate limiting configured

### 5.3 Monitoring Setup
1. Enable Supabase logging
2. Configure Stripe webhook monitoring
3. Set up error tracking (Sentry recommended)
4. Monitor performance metrics

## Troubleshooting

### Common Issues

#### "Invalid API Key"
- Check Supabase URL and anon key
- Verify environment variables
- Ensure project is linked correctly

#### "Row Level Security Policy Violation"
- Check RLS policies are applied
- Verify user authentication
- Check user permissions

#### "Function Timeout"
- Check edge function code
- Verify external API calls
- Monitor function logs

#### "Webhook Delivery Failed"
- Verify webhook URL
- Check webhook secret
- Test webhook endpoint

### Debug Commands
```bash
# Check Supabase status
supabase status

# View function logs
supabase functions logs create-booking

# Reset database
supabase db reset

# Test connection
curl -H "apikey: YOUR_ANON_KEY" YOUR_SUPABASE_URL/rest/v1/profiles
```

## Architecture Decision Log

### Why Supabase over Traditional Backend?
- **Rapid Development**: Pre-built auth, database, real-time features
- **Cost Effective**: Free tier handles significant traffic
- **Scalable**: Automatic scaling without infrastructure management
- **Integrated**: Built-in storage, edge functions, and real-time subscriptions

### Why Edge Functions over Direct Database Access?
- **Business Logic**: Complex payment and booking validation
- **Security**: Service role access without exposing credentials
- **Integration**: External API calls (Stripe, email services)
- **Real-time Updates**: Database triggers for live updates

### Why Client-side Payment Processing?
- **User Experience**: Immediate feedback and error handling
- **Security**: Stripe Elements handles PCI compliance
- **Reliability**: Reduced server dependencies
- **Cost**: Lower server processing requirements

## Next Steps
1. Follow deployment guide step by step
2. Test each phase before proceeding
3. Monitor logs for any issues
4. Set up monitoring and alerts
5. Conduct user acceptance testing

## Support
For deployment issues:
1. Check Supabase logs in Dashboard
2. Review Edge Function logs
3. Test API endpoints manually
4. Verify environment variables
5. Check Stripe webhook delivery status