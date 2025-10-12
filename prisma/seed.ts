import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
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
    },
  })

  // Create restaurant owner
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
    },
  })

  // Create customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      password: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      phone: '+1234567892',
    },
  })

  // Create sample restaurants
  const restaurant1 = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-1' },
    update: {},
    create: {
      id: 'sample-restaurant-1',
      name: 'The Gourmet Corner',
      description: 'Fine dining experience with contemporary cuisine',
      email: 'info@gourmetcorner.com',
      phone: '+1234567893',
      address: '123 Main Street, New York, NY 10001',
      latitude: 40.7128,
      longitude: -74.0060,
      cuisine: 'Contemporary',
      priceRange: '$$$',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      ownerId: owner.id,
    },
  })

  const restaurant2 = await prisma.restaurant.upsert({
    where: { id: 'sample-restaurant-2' },
    update: {},
    create: {
      id: 'sample-restaurant-2',
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza in a cozy atmosphere',
      email: 'info@pizzapalace.com',
      phone: '+1234567894',
      address: '456 Oak Avenue, New York, NY 10002',
      latitude: 40.7589,
      longitude: -73.9851,
      cuisine: 'Italian',
      priceRange: '$$',
      rating: 4.2,
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
      ownerId: owner.id,
    },
  })

  // Create tables for restaurants
  const tables1 = await Promise.all([
    prisma.table.upsert({
      where: { id: 'table-1-1' },
      update: {},
      create: {
        id: 'table-1-1',
        name: 'Table 1',
        capacity: 2,
        restaurantId: restaurant1.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-1-2' },
      update: {},
      create: {
        id: 'table-1-2',
        name: 'Table 2',
        capacity: 4,
        restaurantId: restaurant1.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-1-3' },
      update: {},
      create: {
        id: 'table-1-3',
        name: 'Private Booth',
        capacity: 6,
        restaurantId: restaurant1.id,
      },
    }),
  ])

  const tables2 = await Promise.all([
    prisma.table.upsert({
      where: { id: 'table-2-1' },
      update: {},
      create: {
        id: 'table-2-1',
        name: 'Table A',
        capacity: 2,
        restaurantId: restaurant2.id,
      },
    }),
    prisma.table.upsert({
      where: { id: 'table-2-2' },
      update: {},
      create: {
        id: 'table-2-2',
        name: 'Table B',
        capacity: 4,
        restaurantId: restaurant2.id,
      },
    }),
  ])

  // Create operating hours
  const operatingHours1 = await Promise.all(
    Array.from({ length: 7 }, (_, dayOfWeek) => {
      const isClosed = dayOfWeek === 1 // Closed on Mondays
      return prisma.operatingHours.upsert({
        where: {
          restaurantId_dayOfWeek: {
            restaurantId: restaurant1.id,
            dayOfWeek,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant1.id,
          dayOfWeek,
          openTime: isClosed ? '00:00' : '17:00',
          closeTime: isClosed ? '00:00' : '23:00',
          isClosed,
        },
      })
    })
  )

  const operatingHours2 = await Promise.all(
    Array.from({ length: 7 }, (_, dayOfWeek) => {
      return prisma.operatingHours.upsert({
        where: {
          restaurantId_dayOfWeek: {
            restaurantId: restaurant2.id,
            dayOfWeek,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant2.id,
          dayOfWeek,
          openTime: '11:00',
          closeTime: '22:00',
          isClosed: false,
        },
      })
    })
  )

  console.log('Database seeded successfully!')
  console.log('Sample users created:')
  console.log('- Admin: admin@restaurant.com / admin123')
  console.log('- Owner: owner@restaurant.com / owner123')
  console.log('- Customer: customer@example.com / customer123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })