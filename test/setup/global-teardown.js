const { PrismaClient } = require('@prisma/client')

module.exports = async () => {
  console.log('\n🧹 Starting global test teardown...')

  try {
    // Clean up test database
    console.log('🗑️ Cleaning up test database...')
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // Clean up in reverse order of dependencies
    await prisma.analyticsEvent.deleteMany({})
    await prisma.notification.deleteMany({})
    await prisma.userSession.deleteMany({})
    await prisma.loyaltyTransaction.deleteMany({})
    await prisma.userPreference.deleteMany({})
    await prisma.giftCard.deleteMany({})
    await prisma.menuItem.deleteMany({})
    await prisma.menuCategory.deleteMany({})
    await prisma.promotion.deleteMany({})
    await prisma.review.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.booking.deleteMany({})
    await prisma.waitlistEntry.deleteMany({})
    await prisma.table.deleteMany({})
    await prisma.restaurantStaff.deleteMany({})
    await prisma.restaurant.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.apiKey.deleteMany({})
    await prisma.systemConfig.deleteMany({})

    await prisma.$disconnect()

    console.log('✅ Test database cleanup completed')

    // Clean up test cache
    console.log('🧹 Cleaning up test cache...')
    // Note: In a real setup, you might want to clean up test Redis instance
    
    console.log('✅ Global test teardown completed successfully')

  } catch (error) {
    console.error('❌ Global test teardown failed:', error)
    // Don't exit with error code as this might prevent other cleanup
  }
}
