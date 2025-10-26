import { PrismaClient, UserRole, BookingStatus, PaymentStatus, EventType, NotificationType, LoyaltyTransactionType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, addHours, addMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Generate confirmation codes
  const generateConfirmationCode = () => Math.random().toString(36).substring(2, 8).toUpperCase()

  // Create admin user with enhanced profile
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      phone: '+1234567890',
      phoneVerified: true,
      emailVerified: true,
      loyaltyPoints: 0,
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      city: 'New York',
      state: 'NY',
      country: 'US',
    },
  })

  // Create restaurant owner with enhanced profile
  const ownerPassword = await bcrypt.hash('owner123', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@restaurant.com' },
    update: {},
    create: {
      email: 'owner@restaurant.com',
      password: ownerPassword,
      firstName: 'Restaurant',
      lastName: 'Owner',
      role: UserRole.RESTAURANT_OWNER,
      phone: '+1234567891',
      phoneVerified: true,
      emailVerified: true,
      loyaltyPoints: 0,
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      city: 'New York',
      state: 'NY',
      country: 'US',
    },
  })

  // Create customers with diverse profiles
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      phone: '+1234567892',
      phoneVerified: true,
      emailVerified: true,
      loyaltyPoints: 150,
      totalSpent: 75.50,
      dateOfBirth: new Date('1990-05-15'),
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      address: '789 Customer St',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'US',
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      password: customerPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.CUSTOMER,
      phone: '+1234567893',
      phoneVerified: true,
      emailVerified: true,
      loyaltyPoints: 300,
      totalSpent: 150.75,
      dateOfBirth: new Date('1985-12-03'),
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      address: '456 Main Ave',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'US',
    },
  })

  // Create VIP customer
  const vipCustomer = await prisma.user.upsert({
    where: { email: 'vip@example.com' },
    update: {},
    create: {
      email: 'vip@example.com',
      password: customerPassword,
      firstName: 'Michael',
      lastName: 'VIP',
      role: UserRole.CUSTOMER,
      phone: '+1234567894',
      phoneVerified: true,
      emailVerified: true,
      loyaltyPoints: 2500,
      totalSpent: 1250.00,
      dateOfBirth: new Date('1975-08-20'),
      preferredLanguage: 'en',
      timezone: 'America/New_York',
      address: '123 Luxury Blvd',
      city: 'Manhattan',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
  })

  // Create enhanced restaurants
  const restaurant1 = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-1' },
    update: {},
    create: {
      id: 'sample-restaurant-1',
      name: 'The Gourmet Corner',
      description: 'Fine dining experience with contemporary cuisine featuring locally sourced ingredients and innovative culinary techniques.',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
      phone: '+1234567893',
      email: 'info@gourmetcorner.com',
      website: 'https://gourmetcorner.com',
      socialMedia: {
        instagram: '@gourmetcorner',
        facebook: 'GourmetCornerNYC',
        twitter: '@GourmetCorner'
      },
      cuisine: ['Contemporary', 'American', 'Fusion'],
      priceRange: '$$$',
      rating: 4.5,
      totalReviews: 127,
      latitude: 40.7128,
      longitude: -74.0060,
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
        'https://images.unsplash.com/photo-1578474846511-04ba529f0b88?w=800'
      ],
      coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
      amenities: ['WiFi', 'Outdoor Seating', 'Full Bar', 'Private Dining'],
      features: ['Valet Parking', 'Live Music', 'Wine Cellar', 'Chef\'s Table'],
      operatingHours: {
        monday: { open: '17:00', close: '23:00', closed: false },
        tuesday: { open: '17:00', close: '23:00', closed: false },
        wednesday: { open: '17:00', close: '23:00', closed: false },
        thursday: { open: '17:00', close: '23:00', closed: false },
        friday: { open: '17:00', close: '24:00', closed: false },
        saturday: { open: '17:00', close: '24:00', closed: false },
        sunday: { open: '17:00', close: '22:00', closed: false }
      },
      capacity: 80,
      reservationPolicy: 'Reservations recommended. 24-hour cancellation policy.',
      cancellationPolicy: 'Cancellations must be made 24 hours in advance to avoid charges.',
      depositRequired: true,
      depositAmount: 25.00,
      loyaltyProgram: true,
      loyaltyRate: 0.05,
      averageSeatingTime: 90,
      isVerified: true,
      ownerId: owner.id,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-2' },
    update: {},
    create: {
      id: 'sample-restaurant-2',
      name: 'Bella Vista Trattoria',
      description: 'Authentic Italian cuisine in a warm, family-friendly atmosphere with traditional recipes passed down through generations.',
      address: '456 Oak Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'US',
      phone: '+1234567894',
      email: 'info@bellavistatrattoria.com',
      website: 'https://bellavistatrattoria.com',
      socialMedia: {
        instagram: '@bellavistatrattoria',
        facebook: 'BellaVistaTrattoriaNYC'
      },
      cuisine: ['Italian', 'Mediterranean', 'Pizza'],
      priceRange: '$$',
      rating: 4.2,
      totalReviews: 89,
      latitude: 40.7589,
      longitude: -73.9851,
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800'
      ],
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200',
      amenities: ['WiFi', 'Takeout', 'Delivery', 'Family Friendly'],
      features: ['Wood-fired Oven', 'Fresh Pasta Daily', 'Wine Selection'],
      operatingHours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '12:00', close: '21:00', closed: false }
      },
      capacity: 60,
      reservationPolicy: 'Walk-ins welcome. Reservations accepted for parties of 6 or more.',
      loyaltyProgram: true,
      loyaltyRate: 0.03,
      averageSeatingTime: 75,
      isVerified: true,
      ownerId: owner.id,
    },
  })

  const restaurant3 = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-3' },
    update: {},
    create: {
      id: 'sample-restaurant-3',
      name: 'Sakura Sushi Bar',
      description: 'Premium sushi experience with fresh fish flown in daily from Japan. Traditional techniques meet modern presentation.',
      address: '789 Cherry Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'US',
      phone: '+1234567895',
      email: 'info@sakurasushi.com',
      website: 'https://sakurasushi.com',
      cuisine: ['Japanese', 'Sushi', 'Asian'],
      priceRange: '$$$$',
      rating: 4.8,
      totalReviews: 203,
      latitude: 40.7311,
      longitude: -73.9897,
      images: [
        'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800',
        'https://images.unsplash.com/photo-1563612488-3bb1b7e4b4d6?w=800'
      ],
      coverImage: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200',
      amenities: ['WiFi', 'Sake Bar', 'Omakase Counter'],
      features: ['Sushi Counter', 'Private Rooms', 'Sake Pairing'],
      operatingHours: {
        monday: { open: '18:00', close: '23:00', closed: false },
        tuesday: { open: '18:00', close: '23:00', closed: false },
        wednesday: { open: '18:00', close: '23:00', closed: false },
        thursday: { open: '18:00', close: '23:00', closed: false },
        friday: { open: '18:00', close: '24:00', closed: false },
        saturday: { open: '18:00', close: '24:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true }
      },
      capacity: 40,
      reservationPolicy: 'Reservations required. Limited seating at sushi counter.',
      depositRequired: true,
      depositAmount: 50.00,
      loyaltyProgram: true,
      loyaltyRate: 0.08,
      averageSeatingTime: 120,
      isVerified: true,
      ownerId: owner.id,
    },
  })

  // Create enhanced tables with more details
  const tables1 = []
  for (let i = 1; i <= 12; i++) {
    const table = await prisma.table.create({
      data: {
        number: `T${i.toString().padStart(2, '0')}`,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        minCapacity: 1,
        maxCapacity: i <= 4 ? 3 : i <= 8 ? 5 : 8,
        position: {
          x: (i % 4) * 100 + 50,
          y: Math.floor((i - 1) / 4) * 80 + 50,
          rotation: 0
        },
        shape: i % 3 === 0 ? 'round' : 'rectangular',
        isOutdoor: i > 10,
        hasView: i <= 6,
        accessibility: i % 5 === 0,
        notes: i === 1 ? 'Best table for special occasions' : i === 12 ? 'Outdoor patio table' : null,
        restaurantId: restaurant1.id,
      },
    })
    tables1.push(table)
  }

  const tables2 = []
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.table.create({
      data: {
        number: `A${i}`,
        capacity: i <= 3 ? 2 : i <= 6 ? 4 : 6,
        minCapacity: 1,
        maxCapacity: i <= 3 ? 3 : i <= 6 ? 5 : 8,
        position: {
          x: (i % 3) * 90 + 40,
          y: Math.floor((i - 1) / 3) * 70 + 40,
          rotation: 0
        },
        shape: 'rectangular',
        restaurantId: restaurant2.id,
      },
    })
    tables2.push(table)
  }

  const tables3 = []
  for (let i = 1; i <= 6; i++) {
    const table = await prisma.table.create({
      data: {
        number: `S${i}`,
        capacity: i <= 2 ? 2 : i <= 4 ? 4 : 8,
        minCapacity: 1,
        maxCapacity: i <= 2 ? 2 : i <= 4 ? 4 : 10,
        position: {
          x: (i % 2) * 120 + 60,
          y: Math.floor((i - 1) / 2) * 100 + 60,
          rotation: 0
        },
        shape: i > 4 ? 'rectangular' : 'square',
        notes: i > 4 ? 'Sushi counter seating' : 'Traditional table',
        restaurantId: restaurant3.id,
      },
    })
    tables3.push(table)
  }

  // Create sample bookings with variety
  const tomorrow = addDays(new Date(), 1)
  const nextWeek = addDays(new Date(), 7)
  
  const booking1 = await prisma.booking.create({
    data: {
      bookingTime: addHours(tomorrow, 19), // 7 PM tomorrow
      partySize: 2,
      status: BookingStatus.CONFIRMED,
      specialRequests: 'Window table if possible, celebrating anniversary',
      eventType: EventType.ANNIVERSARY,
      dietaryRestrictions: ['vegetarian'],
      seatingPreference: 'window',
      confirmationCode: generateConfirmationCode(),
      reminderSent: false,
      source: 'web',
      estimatedDuration: 90,
      loyaltyPointsEarned: 15,
      userId: customer1.id,
      restaurantId: restaurant1.id,
      tableId: tables1[0].id,
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      bookingTime: addHours(tomorrow, 20), // 8 PM tomorrow
      partySize: 4,
      status: BookingStatus.PENDING,
      specialRequests: 'Birthday celebration, please prepare dessert',
      eventType: EventType.BIRTHDAY,
      confirmationCode: generateConfirmationCode(),
      source: 'mobile',
      estimatedDuration: 75,
      userId: customer2.id,
      restaurantId: restaurant2.id,
      tableId: tables2[3].id,
    },
  })

  const booking3 = await prisma.booking.create({
    data: {
      bookingTime: addHours(nextWeek, 19), // Next week
      partySize: 6,
      status: BookingStatus.CONFIRMED,
      specialRequests: 'Business dinner, quiet table preferred',
      eventType: EventType.BUSINESS_MEETING,
      seatingPreference: 'quiet',
      confirmationCode: generateConfirmationCode(),
      source: 'phone',
      estimatedDuration: 120,
      isVip: true,
      loyaltyPointsUsed: 100,
      loyaltyPointsEarned: 50,
      userId: vipCustomer.id,
      restaurantId: restaurant3.id,
      tableId: tables3[4].id,
    },
  })

  // Create completed booking for payment example
  const pastDate = addDays(new Date(), -3)
  const completedBooking = await prisma.booking.create({
    data: {
      bookingTime: addHours(pastDate, 19),
      partySize: 2,
      status: BookingStatus.COMPLETED,
      checkInTime: addHours(pastDate, 19),
      checkOutTime: addHours(pastDate, 21),
      actualPartySize: 2,
      confirmationCode: generateConfirmationCode(),
      loyaltyPointsEarned: 25,
      userId: customer1.id,
      restaurantId: restaurant1.id,
      tableId: tables1[1].id,
    },
  })

  // Create payments
  const payment1 = await prisma.payment.create({
    data: {
      amount: 125.50,
      currency: 'usd',
      status: PaymentStatus.COMPLETED,
      paymentMethod: 'card',
      tip: 25.00,
      tax: 12.50,
      loyaltyPointsEarned: 25,
      metadata: {
        cardLast4: '4242',
        receipt_url: 'https://example.com/receipt/123'
      },
      userId: customer1.id,
      restaurantId: restaurant1.id,
      bookingId: completedBooking.id,
    },
  })

  // Create waitlist entries
  const waitlistEntry1 = await prisma.waitlistEntry.create({
    data: {
      partySize: 4,
      preferredTime: addHours(tomorrow, 19),
      estimatedWait: 30,
      notes: 'Flexible with time, prefer outdoor seating',
      priority: 1,
      userId: customer2.id,
      restaurantId: restaurant1.id,
    },
  })

  // Create user preferences
  await prisma.userPreference.createMany({
    data: [
      {
        userId: customer1.id,
        type: 'SEATING',
        value: 'window'
      },
      {
        userId: customer1.id,
        type: 'DIETARY',
        value: 'vegetarian'
      },
      {
        userId: customer2.id,
        type: 'SEATING',
        value: 'outdoor'
      },
      {
        userId: vipCustomer.id,
        type: 'SEATING',
        value: 'quiet'
      },
      {
        userId: vipCustomer.id,
        type: 'COMMUNICATION',
        value: 'phone_preferred'
      },
    ],
  })

  // Create loyalty transactions
  await prisma.loyaltyTransaction.createMany({
    data: [
      {
        userId: customer1.id,
        type: LoyaltyTransactionType.EARNED,
        points: 150,
        description: 'Welcome bonus'
      },
      {
        userId: customer2.id,
        type: LoyaltyTransactionType.EARNED,
        points: 300,
        description: 'Multiple visits bonus'
      },
      {
        userId: vipCustomer.id,
        type: LoyaltyTransactionType.EARNED,
        points: 2500,
        description: 'VIP tier achievement'
      },
      {
        userId: vipCustomer.id,
        type: LoyaltyTransactionType.REDEEMED,
        points: -100,
        description: 'Redeemed for booking discount'
      },
    ],
  })

  // Create gift card
  const giftCard = await prisma.giftCard.create({
    data: {
      code: 'GIFT-2024-001',
      initialAmount: 100.00,
      currentAmount: 100.00,
      expiresAt: addDays(new Date(), 365),
      purchasedById: vipCustomer.id,
    },
  })

  // Create menu categories and items for restaurant1
  const appetizerCategory = await prisma.menuCategory.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with our signature starters',
      sortOrder: 1,
      restaurantId: restaurant1.id,
    },
  })

  const mainCategory = await prisma.menuCategory.create({
    data: {
      name: 'Main Courses',
      description: 'Our chef\'s carefully crafted main dishes',
      sortOrder: 2,
      restaurantId: restaurant1.id,
    },
  })

  const dessertCategory = await prisma.menuCategory.create({
    data: {
      name: 'Desserts',
      description: 'Sweet endings to your perfect meal',
      sortOrder: 3,
      restaurantId: restaurant1.id,
    },
  })

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Truffle Arancini',
        description: 'Crispy risotto balls with black truffle and parmesan',
        price: 18.00,
        allergens: ['dairy', 'gluten'],
        dietaryTags: ['vegetarian'],
        preparationTime: 15,
        calories: 320,
        isPopular: true,
        categoryId: appetizerCategory.id,
      },
      {
        name: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with seasonal vegetables and lemon butter',
        price: 32.00,
        allergens: ['fish', 'dairy'],
        preparationTime: 20,
        calories: 450,
        isPopular: true,
        categoryId: mainCategory.id,
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with molten center and vanilla ice cream',
        price: 12.00,
        allergens: ['dairy', 'eggs', 'gluten'],
        dietaryTags: ['vegetarian'],
        preparationTime: 10,
        calories: 480,
        categoryId: dessertCategory.id,
      },
    ],
  })

  // Create promotions
  const promotion1 = await prisma.promotion.create({
    data: {
      title: 'Happy Hour Special',
      description: '25% off appetizers and drinks from 5-7 PM',
      code: 'HAPPY25',
      discountType: 'percentage',
      discountValue: 25,
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      applicableDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      applicableHours: {
        start: '17:00',
        end: '19:00'
      },
      targetAudience: ['all'],
      restaurantId: restaurant1.id,
    },
  })

  // Create reviews
  const review1 = await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Absolutely fantastic dining experience! The truffle arancini was divine and the service was impeccable.',
      foodRating: 5,
      serviceRating: 5,
      ambianceRating: 4,
      valueRating: 4,
      isVerified: true,
      visitDate: addDays(new Date(), -7),
      helpfulVotes: 3,
      userId: customer1.id,
      restaurantId: restaurant1.id,
    },
  })

  const review2 = await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Great Italian food! The pasta was fresh and the pizza crust was perfect. Will definitely return.',
      foodRating: 5,
      serviceRating: 4,
      ambianceRating: 4,
      valueRating: 4,
      isVerified: true,
      visitDate: addDays(new Date(), -5),
      helpfulVotes: 2,
      userId: customer2.id,
      restaurantId: restaurant2.id,
    },
  })

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        type: NotificationType.BOOKING_CONFIRMATION,
        title: 'Booking Confirmed',
        message: `Your reservation at ${restaurant1.name} has been confirmed for ${booking1.bookingTime.toLocaleDateString()}.`,
        channel: 'email',
        status: 'SENT',
        sentAt: new Date(),
      },
      {
        userId: customer2.id,
        type: NotificationType.BOOKING_REMINDER,
        title: 'Reservation Reminder',
        message: `Don't forget your reservation at ${restaurant2.name} tomorrow at 8:00 PM.`,
        channel: 'sms',
        status: 'PENDING',
      },
      {
        userId: vipCustomer.id,
        type: NotificationType.PROMOTION,
        title: 'VIP Special Offer',
        message: 'Exclusive 20% discount on your next reservation. Use code VIP20.',
        channel: 'email',
        status: 'SENT',
        sentAt: new Date(),
      },
    ],
  })

  // Create analytics events
  await prisma.analyticsEvent.createMany({
    data: [
      {
        event: 'page_view',
        properties: {
          page: '/restaurants',
          source: 'organic',
          device: 'desktop'
        },
        userId: customer1.id,
        sessionId: 'sess_123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      {
        event: 'booking_created',
        properties: {
          restaurant_id: restaurant1.id,
          party_size: 2,
          booking_time: booking1.bookingTime.toISOString(),
          source: 'web'
        },
        userId: customer1.id,
        restaurantId: restaurant1.id,
      },
      {
        event: 'search_performed',
        properties: {
          query: 'italian restaurant',
          location: 'New York',
          results_count: 15
        },
        userId: customer2.id,
      },
    ],
  })

  // Create restaurant staff
  await prisma.restaurantStaff.createMany({
    data: [
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria@gourmetcorner.com',
        phone: '+1234567896',
        role: 'manager',
        permissions: {
          bookings: ['read', 'write'],
          menu: ['read', 'write'],
          staff: ['read'],
          analytics: ['read']
        },
        restaurantId: restaurant1.id,
      },
      {
        firstName: 'James',
        lastName: 'Thompson',
        email: 'james@gourmetcorner.com',
        phone: '+1234567897',
        role: 'host',
        permissions: {
          bookings: ['read', 'write'],
          waitlist: ['read', 'write']
        },
        restaurantId: restaurant1.id,
      },
    ],
  })

  // Create system configuration
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'booking_reminder_hours',
        value: { hours: 24 }
      },
      {
        key: 'loyalty_point_expiry_days',
        value: { days: 365 }
      },
      {
        key: 'max_advance_booking_days',
        value: { days: 90 }
      },
      {
        key: 'default_booking_duration_minutes',
        value: { minutes: 120 }
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('')
  console.log('👥 Sample users created:')
  console.log('   • Admin: admin@restaurant.com / admin123')
  console.log('   • Owner: owner@restaurant.com / owner123')
  console.log('   • Customer 1: customer@example.com / customer123')
  console.log('   • Customer 2: sarah@example.com / customer123')
  console.log('   • VIP Customer: vip@example.com / customer123')
  console.log('')
  console.log('🏪 Restaurants created:')
  console.log('   • The Gourmet Corner (Fine Dining)')
  console.log('   • Bella Vista Trattoria (Italian)')
  console.log('   • Sakura Sushi Bar (Japanese)')
  console.log('')
  console.log('📅 Sample bookings, reviews, and analytics data created')
  console.log('🎁 Loyalty program, gift cards, and promotions set up')
  console.log('📱 Notifications and user preferences configured')
  console.log('')
  console.log('🚀 Your enhanced restaurant booking system is ready!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
