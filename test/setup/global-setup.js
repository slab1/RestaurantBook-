const { execSync } = require('child_process')
const { PrismaClient } = require('@prisma/client')

module.exports = async () => {
  console.log('\n🚀 Starting global test setup...')

  // Set test environment
  process.env.NODE_ENV = 'test'
  
  try {
    // Initialize test database
    console.log('📊 Setting up test database...')
    
    // Reset test database schema
    execSync('npx prisma db push --force-reset --accept-data-loss', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    })

    // Generate Prisma client for test environment
    execSync('npx prisma generate', {
      stdio: 'inherit',
    })

    // Seed test database with minimal data
    console.log('🌱 Seeding test database...')
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // Create test users
    await prisma.user.createMany({
      data: [
        {
          id: 'test-admin-id',
          email: 'admin@test.com',
          password: 'hashedpassword123',
          firstName: 'Test',
          lastName: 'Admin',
          role: 'ADMIN',
          emailVerified: true,
          isActive: true,
        },
        {
          id: 'test-owner-id',
          email: 'owner@test.com',
          password: 'hashedpassword123',
          firstName: 'Test',
          lastName: 'Owner',
          role: 'RESTAURANT_OWNER',
          emailVerified: true,
          isActive: true,
        },
        {
          id: 'test-customer-id',
          email: 'customer@test.com',
          password: 'hashedpassword123',
          firstName: 'Test',
          lastName: 'Customer',
          role: 'CUSTOMER',
          emailVerified: true,
          isActive: true,
          loyaltyPoints: 100,
        },
        {
          id: 'test-staff-id',
          email: 'staff@test.com',
          password: 'hashedpassword123',
          firstName: 'Test',
          lastName: 'Staff',
          role: 'STAFF',
          emailVerified: true,
          isActive: true,
        },
      ],
    })

    // Create test restaurant
    await prisma.restaurant.create({
      data: {
        id: 'test-restaurant-id',
        name: 'Test Restaurant',
        description: 'A test restaurant for testing purposes',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
        phone: '+1234567890',
        email: 'test@restaurant.com',
        cuisine: ['Test Cuisine'],
        priceRange: '$$',
        rating: 4.5,
        totalReviews: 10,
        latitude: 40.7128,
        longitude: -74.0060,
        operatingHours: {
          monday: { open: '09:00', close: '22:00', closed: false },
          tuesday: { open: '09:00', close: '22:00', closed: false },
          wednesday: { open: '09:00', close: '22:00', closed: false },
          thursday: { open: '09:00', close: '22:00', closed: false },
          friday: { open: '09:00', close: '23:00', closed: false },
          saturday: { open: '09:00', close: '23:00', closed: false },
          sunday: { open: '10:00', close: '21:00', closed: false },
        },
        capacity: 50,
        isActive: true,
        isVerified: true,
        ownerId: 'test-owner-id',
      },
    })

    // Create test tables
    await prisma.table.createMany({
      data: [
        {
          id: 'test-table-1',
          number: 'T1',
          capacity: 2,
          restaurantId: 'test-restaurant-id',
          isActive: true,
        },
        {
          id: 'test-table-2',
          number: 'T2',
          capacity: 4,
          restaurantId: 'test-restaurant-id',
          isActive: true,
        },
        {
          id: 'test-table-3',
          number: 'T3',
          capacity: 6,
          restaurantId: 'test-restaurant-id',
          isActive: true,
        },
      ],
    })

    // Create test booking
    await prisma.booking.create({
      data: {
        id: 'test-booking-id',
        userId: 'test-customer-id',
        restaurantId: 'test-restaurant-id',
        tableId: 'test-table-1',
        bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        partySize: 2,
        status: 'CONFIRMED',
        confirmationCode: 'TEST123',
        specialRequests: 'Test booking',
      },
    })

    // Create test menu categories and items
    const appetizers = await prisma.menuCategory.create({
      data: {
        id: 'test-category-appetizers',
        name: 'Appetizers',
        description: 'Starter dishes',
        restaurantId: 'test-restaurant-id',
        sortOrder: 1,
      },
    })

    await prisma.menuItem.create({
      data: {
        id: 'test-menu-item-1',
        name: 'Test Appetizer',
        description: 'A delicious test appetizer',
        price: 12.99,
        categoryId: appetizers.id,
        isAvailable: true,
      },
    })

    // Create test user sessions
    await prisma.userSession.createMany({
      data: [
        {
          id: 'test-session-admin',
          userId: 'test-admin-id',
          sessionToken: 'test-admin-session-token',
          ipAddress: '127.0.0.1',
          userAgent: 'Test User Agent',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          id: 'test-session-customer',
          userId: 'test-customer-id',
          sessionToken: 'test-customer-session-token',
          ipAddress: '127.0.0.1',
          userAgent: 'Test User Agent',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ],
    })

    await prisma.$disconnect()

    console.log('✅ Test database setup completed')

    // Start test Redis server (if needed)
    console.log('🔧 Setting up test cache...')
    // Note: In a real setup, you might want to start a test Redis instance
    
    console.log('✅ Global test setup completed successfully')

  } catch (error) {
    console.error('❌ Global test setup failed:', error)
    process.exit(1)
  }
}
