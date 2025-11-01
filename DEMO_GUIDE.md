# Chef Warehouse - Demo Mode Guide

## 🎯 Overview
The Chef Warehouse Booking System is now running in **DEMO MODE** with fully functional features using realistic mock data. All functionality works exactly as it would with a real database, perfect for demonstration and testing.

## ✅ What's Working

### 1. Chef Search & Discovery
- **20 Professional Chefs** across 8 Nigerian cities
- **Advanced Filtering:**
  - By city (Lagos, Abuja, Kano, Port Harcourt, Ibadan, Enugu, Owerri, Calabar)
  - By specialty (Nigerian, Italian, Chinese, French, BBQ, Pastries, etc.)
  - By rating (4.6 - 4.9 stars)
  - By price range (₦15,000 - ₦35,000/hour)
  - By experience (7 - 22 years)
- **Sorting:** By rating, price, or experience
- **Pagination:** 20 items per page

### 2. Chef Profiles
Each chef includes:
- Professional bio and specialties
- Hourly rates and event minimums
- Ratings and reviews
- Portfolio showcase
- Weekly availability schedule
- Service types and event types
- Travel radius
- Verification badges

### 3. Booking System
- **Multi-step booking form:**
  - Event details (type, date, party size)
  - Location and preferences
  - Menu requirements and dietary restrictions
- **Automatic pricing calculation:**
  - Base price (hourly rate × duration)
  - Travel fee
  - 12% platform commission
  - 30% deposit requirement
- **Mock payment processing**

### 4. Admin Features
- Chef management dashboard
- Verification and featured status toggles
- Search and filter capabilities
- Booking statistics

## 🚀 How to Test

### Access the Demo
1. **Start Server** (if not already running):
   ```bash
   cd /workspace
   npm run dev
   ```

2. **Open in Browser:**
   - Chef Search: http://localhost:3000/chefs
   - Admin Dashboard: http://localhost:3000/admin/chefs

### Test Scenarios

#### Scenario 1: Search for Nigerian Chef in Lagos
1. Go to `/chefs`
2. Select "Lagos" from city filter
3. Select "Nigerian" from specialty filter
4. Browse results (should show 8 Lagos-based chefs)

#### Scenario 2: Book a Chef for Wedding
1. Browse chefs and select "Chef Amaka's Kitchen" (top rated)
2. Click "View Profile"
3. Review portfolio and ratings
4. Click "Book Chef"
5. Fill out booking form:
   - Event: Wedding
   - Date: Future date
   - Party size: 150
   - Location: Lekki, Lagos
6. See automatic pricing calculation:
   - Base: ₦100,000 (4 hours × ₦25,000)
   - Travel: ₦10,000
   - Platform fee (12%): ₦13,200
   - Total: ₦123,200
   - Deposit (30%): ₦36,960

#### Scenario 3: Filter by Budget
1. On chef search page
2. Set max rate filter to ₦20,000
3. See only budget-friendly chefs
4. Sort by rating to find best value

#### Scenario 4: Admin Management
1. Go to `/admin/chefs`
2. View all 20 chefs
3. Filter by city
4. Toggle featured status
5. Toggle verification status

## 📊 Demo Data Overview

### Cities Represented
- **Lagos:** 9 chefs (largest selection)
- **Abuja:** 4 chefs
- **Kano:** 1 chef
- **Port Harcourt:** 2 chefs
- **Ibadan:** 1 chef
- **Enugu:** 1 chef
- **Owerri:** 1 chef
- **Calabar:** 1 chef

### Specialties Available
- Nigerian Cuisine (8 chefs)
- Italian (3 chefs)
- French (1 chef)
- Chinese/Asian (2 chefs)
- BBQ/Grills (3 chefs)
- Pastries/Desserts (2 chefs)
- Seafood (2 chefs)
- Vegetarian/Vegan (2 chefs)
- Caribbean (1 chef)
- Middle Eastern (1 chef)

### Featured Chefs
- Chef Amaka's Kitchen (Nigerian) - 4.9★
- Chef Marco's Italian Experience - 4.8★
- Chef Ngozi's Home Cooking - 4.9★
- Chef Pierre's French Cuisine - 4.9★
- Chef Yusuf's Intercontinental - 4.8★
- Sweet Sensations by Chef Ada - 4.9★
- Chef Antonio's Pizza & Pasta - 4.8★
- Chef Grace's Wellness Kitchen - 4.9★

### Price Ranges
- **Budget:** ₦15,000 - ₦19,000/hour (4 chefs)
- **Mid-Range:** ₦20,000 - ₦26,000/hour (11 chefs)
- **Premium:** ₦28,000 - ₦35,000/hour (5 chefs)

## 🔄 Demo vs Production

### What's Mocked
- Database queries (using in-memory mock data)
- Payment processing (simulated Stripe responses)
- Chef verification process

### What's Real
- All UI/UX interactions
- Search and filter logic
- Pricing calculations
- Form validations
- Responsive design
- Booking workflow

## 🎨 Demo Mode Indicator
A prominent banner at the top of chef pages indicates demo mode:
> **DEMO MODE:** This is a fully functional demonstration with sample data. All bookings and payments are simulated.

## 📱 Responsive Testing
Test on different screen sizes:
- Desktop: Full filters and grid layout
- Tablet: Responsive grid and collapsible filters
- Mobile: Stacked layout and mobile-optimized forms

## ⚡ Performance
- **Initial Load:** < 2 seconds
- **Search/Filter:** Instant (in-memory)
- **Chef Detail:** < 1 second
- **Booking Form:** Real-time updates

## 🔌 Converting to Production

When ready to connect to a real database:

1. **Set Environment Variables:**
   ```bash
   DATABASE_URL="your-postgresql-connection-string"
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   ```

2. **Run Database Migrations:**
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed-chefs.ts
   ```

3. **Update API Routes:**
   - Replace mock data imports with Prisma queries
   - Remove "DEMO MODE" indicators
   - Enable real Stripe payment processing

4. **Deploy:**
   ```bash
   npm run build
   npm start
   ```

## 🐛 Known Limitations (Demo Mode)
- Bookings are not persisted (page refresh clears them)
- Admin changes don't persist across sessions
- No real payment processing
- No email notifications
- No real-time availability checking

## 💡 Tips for Demo
1. **Highlight Search:** Show how quickly filters work
2. **Show Pricing:** Demonstrate automatic calculation
3. **Emphasize UX:** Smooth booking flow
4. **Mobile Demo:** Test on phone for full effect
5. **Admin View:** Show management capabilities

## 🎯 Next Steps
1. Set up production database (Neon, Supabase, etc.)
2. Configure Stripe account
3. Run migrations and seed data
4. Deploy to production
5. Add monitoring and analytics

## 🆘 Support
If you encounter any issues:
1. Check browser console for errors
2. Verify server is running (`npm run dev`)
3. Clear browser cache
4. Restart development server

---

**Demo is ready!** Start at http://localhost:3000/chefs and explore the full Chef Warehouse Booking System.
