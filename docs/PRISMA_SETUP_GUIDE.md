# Prisma Setup Guide for Restaurant Booking System

## 📋 Table of Contents
- [What's Already Set Up](#whats-already-set-up)
- [Quick Start (5 Minutes)](#quick-start-5-minutes)
- [Database Provider Options](#database-provider-options)
- [Step-by-Step Setup](#step-by-step-setup)
- [Database Operations](#database-operations)
- [Troubleshooting](#troubleshooting)

---

## ✅ What's Already Set Up

Your project already has:
- **Prisma CLI**: v5.22.0 installed
- **Prisma Client**: v5.22.0 configured
- **Comprehensive Schema**: 65+ models with 1,893 lines
  - Users, Restaurants, Bookings, Tables
  - Loyalty System with tiers, achievements, streaks
  - Payment Processing (Stripe)
  - Reviews & Ratings
  - Waitlist Management
  - Menu System
  - Delivery Platform Integrations (Uber Eats, DoorDash, GrubHub)
  - AR/VR Features
  - Internationalization (i18n)
  - A/B Testing & Analytics
  - Social Sharing & Referrals
  - And much more!

**Location**: `/workspace/prisma/schema.prisma`

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Using Free Cloud PostgreSQL (Recommended)

**Choose one of these free providers:**

#### **Neon.tech** (Easiest, Serverless)
1. Go to https://neon.tech
2. Sign up (free tier: 10GB storage)
3. Create a new project
4. Copy the connection string
5. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require"
   ```

#### **Railway.app** (Popular, Easy)
1. Go to https://railway.app
2. Sign up (free tier: $5/month credit)
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the DATABASE_URL from settings
5. Update `.env.local` with the copied URL

#### **Supabase** (Full Backend Platform)
1. Go to https://supabase.com
2. Sign up (free tier: 500MB)
3. Create a new project
4. Go to Settings → Database → Connection String
5. Copy the connection string and update `.env.local`

### Option 2: Using Local PostgreSQL

If you already have PostgreSQL installed locally:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_booking"
```

---

## 🔧 Step-by-Step Setup

### Step 1: Configure Database URL

Update your `.env.local` file with your database connection:

```bash
# Copy from Tier 1 template
cp .env.tier1.core .env.local

# Edit and add your DATABASE_URL
nano .env.local  # or use any text editor
```

Your `.env.local` should have:
```env
DATABASE_URL="postgresql://your-connection-string-here"
JWT_SECRET="your-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 2: Generate Prisma Client

This creates the TypeScript client for database operations:

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

### Step 3: Run Database Migrations

This creates all the tables in your database:

```bash
npx prisma migrate deploy
```

**Or create a new migration:**
```bash
npx prisma migrate dev --name init
```

**Expected Output:**
```
✔ Applying migration `20231027000000_init`
✔ Generated Prisma Client (5.22.0)
```

### Step 4: (Optional) Seed Database with Sample Data

Add test restaurants, users, and bookings:

```bash
npx prisma db seed
```

This will populate your database with:
- Sample restaurants
- Test users
- Example bookings
- Menu items
- Loyalty tiers

### Step 5: Verify Setup

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can:
- View all tables
- Browse data
- Edit records
- Run queries

---

## 🗄️ Database Provider Options

### Comparison Table

| Provider | Free Tier | Best For | Setup Time |
|----------|-----------|----------|------------|
| **Neon.tech** | 10GB, Serverless | Development, Small apps | 2 min |
| **Railway.app** | $5/month credit | Full features | 3 min |
| **Supabase** | 500MB, Full platform | Apps needing realtime | 5 min |
| **PlanetScale** | 5GB, 1 billion reads/month | High-scale apps | 5 min |
| **Heroku** | 10k rows, 20 connections | Heroku apps | 3 min |
| **Local PostgreSQL** | Unlimited | Development only | 10 min |

### Recommended for Production

1. **Neon.tech** - Best serverless option
2. **Railway.app** - Best ease of use
3. **Supabase** - If you need realtime features
4. **AWS RDS** - For enterprise/high-scale

---

## 💻 Database Operations

### Common Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Validate schema
npx prisma validate

# Format schema file
npx prisma format

# Check migration status
npx prisma migrate status

# View database structure
npx prisma db pull

# Seed database
npx prisma db seed
```

### Using Prisma Client in Code

**Import and use:**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed_password',
    role: 'CUSTOMER'
  }
})

// Example: Find restaurants
const restaurants = await prisma.restaurant.findMany({
  where: {
    city: 'Lagos',
    isActive: true
  },
  include: {
    reviews: true,
    tables: true
  }
})

// Example: Create a booking
const booking = await prisma.booking.create({
  data: {
    userId: user.id,
    restaurantId: restaurant.id,
    tableId: table.id,
    bookingTime: new Date('2025-11-01T19:00:00'),
    partySize: 4,
    status: 'CONFIRMED',
    confirmationCode: 'ABC123XYZ'
  }
})

// Always disconnect when done (in serverless functions)
await prisma.$disconnect()
```

**Best Practice - Create a singleton:**

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

---

## 🔍 Troubleshooting

### Error: "Can't reach database server"

**Problem**: Database not running or wrong connection string

**Solution**:
```bash
# Test your connection
npx prisma db execute --stdin <<< "SELECT 1;"

# Check your DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Error: "Migration failed"

**Problem**: Database state doesn't match migrations

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Or resolve manually
npx prisma migrate resolve --applied "migration_name"
```

### Error: "PrismaClient is unable to be run in the browser"

**Problem**: Using Prisma Client in frontend code

**Solution**: Only use Prisma in:
- API routes (`/app/api/`)
- Server components
- Server actions
- Never in client components

### Error: "Environment variable not found: DATABASE_URL"

**Problem**: `.env.local` not loaded or missing

**Solution**:
```bash
# Create .env.local
cp .env.tier1.core .env.local

# Edit and add your DATABASE_URL
# Make sure Next.js is restarted after changes
```

### Slow Queries

**Problem**: Database queries taking too long

**Solution**:
```bash
# Enable query logging
# In your Prisma Client initialization:
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

# Add indexes to your schema.prisma:
@@index([userId, createdAt])
@@index([restaurantId, bookingTime])

# Then migrate
npx prisma migrate dev --name add_indexes
```

### Connection Pool Exhausted

**Problem**: Too many database connections

**Solution**:
```typescript
// Configure connection pool in DATABASE_URL
DATABASE_URL="postgresql://...?connection_limit=5&pool_timeout=10"

// Or in schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // For PlanetScale
}
```

---

## 📚 Additional Resources

### Documentation
- **Prisma Docs**: https://www.prisma.io/docs
- **Prisma Schema Reference**: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- **Best Practices**: https://www.prisma.io/docs/guides/performance-and-optimization

### Your Project Files
- **Schema**: `/workspace/prisma/schema.prisma`
- **Migrations**: `/workspace/prisma/migrations/`
- **Seed Script**: `/workspace/prisma/seed.ts`
- **Env Example**: `/workspace/.env.tier1.core`

### Commands Cheatsheet
```bash
# Development workflow
npx prisma generate          # After schema changes
npx prisma migrate dev       # Create & apply migration
npx prisma studio           # View database in browser

# Production workflow
npx prisma generate          # Build step
npx prisma migrate deploy   # Deploy migrations

# Maintenance
npx prisma db seed          # Add test data
npx prisma migrate reset    # Reset database (dev only)
npx prisma db pull          # Sync schema from database
```

---

## ✅ Checklist

- [ ] Choose a database provider (Neon.tech recommended)
- [ ] Get DATABASE_URL connection string
- [ ] Update `.env.local` with DATABASE_URL
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate deploy` or `npx prisma migrate dev`
- [ ] (Optional) Run `npx prisma db seed`
- [ ] Test with `npx prisma studio`
- [ ] Verify app connects successfully

---

## 🎯 Quick Commands Summary

```bash
# Complete setup in 3 commands
npx prisma generate              # Generate TypeScript client
npx prisma migrate deploy        # Create database tables
npx prisma studio               # Open database viewer

# That's it! Your database is ready 🎉
```

---

## Need Help?

- Check the [Pain Points Analysis](/workspace/docs/PROJECT_PAIN_POINTS_ANALYSIS.md)
- Read the [Backend Architecture Decision](/workspace/docs/BACKEND_ARCHITECTURE_DECISION.md)
- Review the [Environment Setup Guide](/workspace/docs/ENVIRONMENT_SETUP_GUIDE.md)
- Open the [Master Documentation](/workspace/docs/README.md)
