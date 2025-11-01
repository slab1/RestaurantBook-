# Chef Warehouse Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Environment variables configured

### Step 1: Database Setup
```bash
# Set your database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/restaurantbook"

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Step 2: Seed Demo Data
```bash
# Create 20+ demo chefs with portfolios and bookings
npx tsx prisma/seed-chefs.ts
```

This creates:
- 20 verified chefs across Nigerian cities
- 30+ sample bookings
- 10 sample customers
- Portfolio items and ratings

### Step 3: Start the Application
```bash
npm run dev
```

### Step 4: Access the Features

**Customer Chef Marketplace**
- http://localhost:3000/chefs - Browse and search chefs

**Admin Chef Management**
- http://localhost:3000/admin/chefs - Manage chef verifications

**Admin Login**
- Email: admin@restaurant.com
- Password: admin123

### Step 5: Test the System

1. **Search for Chefs**
   - Go to `/chefs`
   - Filter by city (Lagos, Abuja, etc.)
   - Filter by specialty (Nigerian Cuisine, Italian, etc.)
   - Filter by price range

2. **View Chef Details**
   - Click any chef card
   - View portfolio, ratings, and availability
   - Check pricing and service types

3. **Admin Management**
   - Login to `/admin`
   - Navigate to "Chef Management"
   - Approve/suspend chefs
   - Toggle featured/premium status

## 🎯 Demo Chef Credentials

All demo chefs have the password: `chef123`

**Sample Logins:**
- adewale.ogunleye@chefs.com (Lagos, Nigerian Cuisine)
- chioma.nwosu@chefs.com (Abuja, Italian Cuisine)
- yusuf.abdullahi@chefs.com (Kano, BBQ Specialist)

## 📊 Sample Data Overview

### Chefs by Specialty
- Nigerian Cuisine: 5 chefs
- Italian Cuisine: 2 chefs
- Chinese Cuisine: 2 chefs
- BBQ & Grilling: 3 chefs
- Pastries & Baking: 2 chefs
- Continental: 2 chefs
- Seafood: 2 chefs
- Vegetarian/Vegan: 2 chefs

### Chefs by City
- Lagos: 7 chefs
- Abuja: 4 chefs
- Kano: 3 chefs
- Port Harcourt: 2 chefs
- Ibadan: 1 chef

### Price Ranges
- Budget: ₦19,000 - ₦25,000/hour (7 chefs)
- Mid-Range: ₦26,000 - ₦32,000/hour (9 chefs)
- Premium: ₦33,000 - ₦38,000/hour (4 chefs)

## 🔧 Common Tasks

### Add a New Chef (Via Admin)
1. Chef registers through customer interface
2. Admin logs into `/admin/chefs`
3. Find chef in "Pending" status
4. Click expand arrow
5. Click "Approve" button
6. Chef is now "VERIFIED" and visible to customers

### Feature a Chef
1. Go to `/admin/chefs`
2. Find verified chef
3. Expand chef row
4. Check "Featured Chef" checkbox
5. Chef appears with "Featured" badge in search

### Filter Chefs
**Customer Search:**
- City dropdown
- Specialty filter
- Event type filter
- Max rate slider
- Verified only checkbox

**Admin Filters:**
- Status filter (Pending, Verified, etc.)
- City filter
- Search by name/email

## 📱 API Testing

### Get All Chefs
```bash
curl http://localhost:3000/api/chefs
```

### Get Chefs in Lagos
```bash
curl "http://localhost:3000/api/chefs?city=Lagos"
```

### Get Nigerian Cuisine Specialists
```bash
curl "http://localhost:3000/api/chefs?specialty=Nigerian%20Cuisine"
```

### Get Chef Details
```bash
# Replace {id} with actual chef ID from database
curl http://localhost:3000/api/chefs/{id}
```

### Admin: Get All Chefs
```bash
curl http://localhost:3000/api/admin/chefs
```

### Admin: Get Pending Chefs
```bash
curl "http://localhost:3000/api/admin/chefs?status=PENDING"
```

## 🎨 UI Features

### Customer Interface
- ✅ Responsive grid layout
- ✅ Advanced search filters
- ✅ Real-time filtering
- ✅ Pagination
- ✅ Chef cards with ratings
- ✅ Featured chef badges
- ✅ Verified chef indicators
- ✅ Price display in NGN
- ✅ Specialty tags
- ✅ Location display

### Chef Detail Page
- ✅ Profile header with cover image
- ✅ Verification and featured badges
- ✅ Multi-criteria ratings
- ✅ About section
- ✅ Certifications list
- ✅ Portfolio gallery
- ✅ Customer reviews
- ✅ Booking sidebar with pricing
- ✅ Service types display
- ✅ Contact options

### Admin Interface
- ✅ Searchable chef table
- ✅ Status filtering
- ✅ Stats dashboard
- ✅ Expandable detail rows
- ✅ Quick action buttons
- ✅ Feature toggles
- ✅ Pagination
- ✅ Performance metrics

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Environment variable not found: DATABASE_URL
```
**Solution:** Set DATABASE_URL in `.env` file

### Prisma Client Not Found
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Run `npx prisma generate`

### Seed Data Fails
```
Error: Unique constraint failed
```
**Solution:** Database already seeded. Drop and recreate to reseed.

### No Chefs Showing
**Check:**
1. Seed data ran successfully
2. Chefs have status "VERIFIED"
3. Chefs have isActive = true
4. API returns data: `curl http://localhost:3000/api/chefs`

## 📚 Next Steps

1. **Implement Chef Dashboard** - Let chefs manage their own profiles
2. **Add Booking Form** - Complete booking request flow
3. **Payment Integration** - Connect Stripe/Paystack
4. **Notifications** - Email/SMS for bookings
5. **Calendar Integration** - Visual availability management

## 🤝 Development Tips

### Adding New Chef Specialty
1. Update `chefSpecialties` array in seed file
2. Add to `SPECIALTIES` constant in `/app/chefs/page.tsx`
3. Reseed database

### Adding New Event Type
1. Add to `ChefEventType` enum in `schema.prisma`
2. Run `npx prisma migrate dev`
3. Update `EVENT_TYPES` in `/app/chefs/page.tsx`

### Customizing Pricing
- Edit `hourlyRate` in chef profiles
- Modify `commissionRate` (default 12%)
- Adjust `depositPercentage` (default 30%)

## 📞 Support

For issues or questions:
1. Check documentation in `/docs/CHEF_WAREHOUSE_SYSTEM.md`
2. Review API routes in `/app/api/chefs/`
3. Examine database models in `prisma/schema.prisma`

---

**Happy Cooking! 👨‍🍳**
