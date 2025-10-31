# Deployment Checklist
## Complete Restaurant Booking Platform

Use this checklist to ensure proper deployment of the entire platform.

## Pre-Deployment Setup

### ✅ Account Setup
- [ ] Supabase account created
- [ ] Stripe account created  
- [ ] Domain name purchased (optional)
- [ ] Email service account (optional)
- [ ] SMS service account (optional)

### ✅ Development Environment
- [ ] Node.js 18+ installed
- [ ] Git repository initialized
- [ ] Environment variables configured
- [ ] Supabase CLI installed (optional but recommended)

## Phase 1: Supabase Backend Deployment

### Database Setup
- [ ] Create Supabase project
- [ ] Note project URL and anon key
- [ ] Enable Row Level Security (RLS)
- [ ] Run database migrations:
  - [ ] `20251028_initial_schema.sql`
  - [ ] `20251028_rls_policies.sql`
  - [ ] `20251028_seed_data.sql`
- [ ] Verify all tables created
- [ ] Check RLS policies enabled

### Edge Functions Deployment
- [ ] Deploy `create-booking` function
- [ ] Deploy `create-order` function  
- [ ] Deploy `stripe-webhook` function
- [ ] Deploy `send-notification` function
- [ ] Set environment variables in Supabase:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `APP_URL`
- [ ] Test edge functions locally

### Storage Setup
- [ ] Create `profile-avatars` bucket (images only, 5MB)
- [ ] Create `restaurant-images` bucket (images only, 10MB)
- [ ] Create `menu-items` bucket (images only, 5MB)
- [ ] Set bucket policies for public read access
- [ ] Test image upload functionality

### Authentication
- [ ] Configure email/password auth
- [ ] Set up OAuth providers (optional)
- [ ] Configure email templates
- [ ] Test user registration/login

## Phase 2: Stripe Payment Integration

### Stripe Configuration
- [ ] Get Stripe publishable key
- [ ] Get Stripe secret key
- [ ] Create webhook endpoint in Stripe dashboard:
  - [ ] URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
  - [ ] Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
- [ ] Copy webhook signing secret
- [ ] Test webhook delivery

### Payment Testing
- [ ] Test booking deposit payment
- [ ] Test order payment
- [ ] Test failed payment handling
- [ ] Verify webhook processing
- [ ] Check payment status updates

## Phase 3: Frontend Integration

### Dependencies Installation
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Install Stripe client: `npm install @stripe/stripe-js @stripe/react-stripe-js`
- [ ] Install utilities: `npm install lucide-react date-fns`

### Environment Configuration
- [ ] Create `.env.local` file
- [ ] Add Supabase URL and anon key
- [ ] Add Stripe publishable key
- [ ] Test environment variable loading

### Code Integration
- [ ] Create Supabase client (`/lib/supabase.ts`)
- [ ] Update authentication context
- [ ] Migrate restaurant service
- [ ] Update cart context
- [ ] Replace profile service
- [ ] Create booking service
- [ ] Add payment forms
- [ ] Test all integrations

### Frontend Testing
- [ ] Test user registration
- [ ] Test restaurant browsing
- [ ] Test menu viewing
- [ ] Test cart functionality
- [ ] Test booking creation
- [ ] Test order placement
- [ ] Test payment processing

## Phase 4: Production Deployment

### Build Process
- [ ] Fix any TypeScript errors
- [ ] Resolve all linting issues
- [ ] Test build process: `npm run build`
- [ ] Optimize bundle size
- [ ] Verify environment variables

### Deployment Platform (Choose One)

#### Option A: Vercel
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Run `vercel` in project root
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up custom domain (optional)
- [ ] Configure redirects for SPA

#### Option B: Netlify
- [ ] Build project: `npm run build`
- [ ] Upload `dist` folder to Netlify
- [ ] Configure environment variables
- [ ] Set up _redirects file for SPA routing
- [ ] Configure custom domain (optional)

#### Option C: Self-hosted
- [ ] Set up server (Ubuntu/CentOS recommended)
- [ ] Install Nginx
- [ ] Configure SSL certificates
- [ ] Set up PM2 for process management
- [ ] Configure environment variables

### Domain & SSL
- [ ] Point domain to deployment platform
- [ ] Configure DNS records
- [ ] Enable HTTPS/SSL
- [ ] Update CORS settings in Supabase
- [ ] Update environment variables with production URL

## Phase 5: Testing & Monitoring

### End-to-End Testing
- [ ] Test complete user journey:
  - [ ] Registration → Profile setup
  - [ ] Restaurant search → Menu browsing
  - [ ] Add to cart → Place order
  - [ ] Payment processing → Order tracking
  - [ ] Booking creation → Reservation management
- [ ] Test mobile responsiveness
- [ ] Test different browsers
- [ ] Test edge cases and error handling

### Performance Testing
- [ ] Test page load speeds
- [ ] Test database query performance
- [ ] Test image loading times
- [ ] Test payment processing speed
- [ ] Monitor memory usage

### Security Testing
- [ ] Test authentication boundaries
- [ ] Test RLS policies
- [ ] Test input validation
- [ ] Test SQL injection prevention
- [ ] Test XSS protection
- [ ] Verify HTTPS everywhere

### Monitoring Setup
- [ ] Enable Supabase logging
- [ ] Set up error tracking (Sentry recommended)
- [ ] Monitor Stripe webhook delivery
- [ ] Set up uptime monitoring
- [ ] Configure alerts for failures

## Phase 6: Post-Deployment

### Documentation
- [ ] Create admin user guide
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Set up runbooks for common issues

### Backup Strategy
- [ ] Set up Supabase database backups
- [ ] Backup environment configurations
- [ ] Document recovery procedures
- [ ] Test backup restoration

### Maintenance Plan
- [ ] Schedule regular database maintenance
- [ ] Plan for feature updates
- [ ] Set up monitoring dashboards
- [ ] Create incident response plan

## Success Criteria

### Functional Requirements ✅
- [ ] Users can register and authenticate
- [ ] Users can browse restaurants and menus
- [ ] Users can add items to cart
- [ ] Users can create bookings with payment
- [ ] Users can place orders with payment
- [ ] Users can view booking and order history
- [ ] Users can manage profile and preferences
- [ ] Restaurant owners can manage their data

### Technical Requirements ✅
- [ ] Database properly configured with RLS
- [ ] Edge functions deployed and working
- [ ] Payment processing functional
- [ ] Real-time updates working
- [ ] File upload/storage working
- [ ] API endpoints responding correctly
- [ ] Error handling implemented
- [ ] Performance within acceptable limits

### Business Requirements ✅
- [ ] Booking system operational
- [ ] Order management functional
- [ ] Payment processing secure
- [ ] User notifications working
- [ ] Admin controls available
- [ ] Data analytics tracking
- [ ] Scalability considerations addressed

## Troubleshooting Common Issues

### Database Issues
**Problem:** "relation does not exist"
- **Solution:** Run migrations in correct order
- **Check:** Verify Supabase project is linked correctly

**Problem:** RLS policy violations
- **Solution:** Check user authentication and policy rules
- **Check:** Verify JWT token is valid

### Edge Function Issues
**Problem:** Function timeout
- **Solution:** Optimize database queries and external API calls
- **Check:** Monitor function logs in Supabase dashboard

**Problem:** CORS errors
- **Solution:** Add proper CORS headers
- **Check:** Verify allowed origins

### Payment Issues
**Problem:** Webhook delivery failed
- **Solution:** Check webhook URL and secret
- **Check:** Test webhook endpoint manually

**Problem:** Payment intent creation failed
- **Solution:** Verify Stripe API keys
- **Check:** Test with Stripe test mode

### Frontend Issues
**Problem:** Authentication not working
- **Solution:** Check environment variables
- **Check:** Verify Supabase URL and keys

**Problem:** API calls failing
- **Solution:** Check network requests and CORS
- **Check:** Verify RLS policies allow access

## Final Verification

Before going live:
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance acceptable
- [ ] Error monitoring active
- [ ] Backup procedures tested
- [ ] Team trained on system
- [ ] Documentation complete
- [ ] Support procedures established

## Go-Live Checklist

### Last-Minute Checks
- [ ] Switch to production Stripe keys
- [ ] Update webhook URLs to production
- [ ] Disable debug logging
- [ ] Verify all environment variables
- [ ] Test final deployment
- [ ] Announce launch

### Post-Launch Monitoring
- [ ] Monitor error rates
- [ ] Check payment processing
- [ ] Verify user registration flow
- [ ] Monitor database performance
- [ ] Watch for unusual activity
- [ ] Gather user feedback

---

**🎉 Congratulations! Your restaurant booking platform is now live and ready to serve customers!**

## Support & Maintenance

For ongoing support:
1. Monitor Supabase dashboard for errors
2. Check Stripe dashboard for payment issues
3. Review application logs regularly
4. Keep dependencies updated
5. Monitor user feedback and usage patterns

Regular maintenance tasks:
- Database optimization and cleanup
- Security updates and patches
- Feature enhancements based on user feedback
- Performance monitoring and optimization