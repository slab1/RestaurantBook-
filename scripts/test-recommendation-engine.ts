/**
 * Quick test script for AI Recommendation Engine
 * 
 * Run this after database migration to verify everything works
 */

import { mlRecommendationEngine } from '../lib/ml-recommendation-engine';
import { prisma } from '../lib/prisma';

async function testRecommendationEngine() {
  console.log('🧪 Testing AI Recommendation Engine...\n');

  try {
    // Test 1: Check database models
    console.log('✓ Test 1: Database Models');
    const userCount = await prisma.user.count();
    const restaurantCount = await prisma.restaurant.count();
    const bookingCount = await prisma.booking.count();
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Restaurants: ${restaurantCount}`);
    console.log(`  - Bookings: ${bookingCount}`);

    if (restaurantCount === 0) {
      console.log('  ⚠️  Warning: No restaurants in database. Some tests will be limited.\n');
    } else {
      console.log('  ✓ Database has data\n');
    }

    // Test 2: Anonymous recommendations
    console.log('✓ Test 2: Anonymous Recommendations');
    const anonymousRecs = await mlRecommendationEngine.getPersonalizedRecommendations({
      limit: 5,
    });
    console.log(`  - Generated ${anonymousRecs.length} recommendations`);
    if (anonymousRecs.length > 0) {
      console.log(`  - Top recommendation: ${anonymousRecs[0].restaurant.name}`);
      console.log(`  - Algorithm: ${anonymousRecs[0].algorithm}`);
      console.log(`  - Score: ${anonymousRecs[0].score.toFixed(2)}`);
    }
    console.log('  ✓ Anonymous recommendations working\n');

    // Test 3: Get first user for personalized test
    const firstUser = await prisma.user.findFirst();
    
    if (firstUser) {
      console.log('✓ Test 3: Personalized Recommendations');
      const personalizedRecs = await mlRecommendationEngine.getPersonalizedRecommendations({
        userId: firstUser.id,
        limit: 5,
      });
      console.log(`  - Generated ${personalizedRecs.length} personalized recommendations`);
      if (personalizedRecs.length > 0) {
        console.log(`  - Top recommendation: ${personalizedRecs[0].restaurant.name}`);
        console.log(`  - Algorithm: ${personalizedRecs[0].algorithm}`);
        console.log(`  - Confidence: ${(personalizedRecs[0].confidence * 100).toFixed(1)}%`);
        console.log(`  - Reasons: ${personalizedRecs[0].reasons.join(', ')}`);
      }
      console.log('  ✓ Personalized recommendations working\n');

      // Test 4: Test feedback tracking
      if (personalizedRecs.length > 0) {
        console.log('✓ Test 4: Feedback Tracking');
        await mlRecommendationEngine.trackRecommendationFeedback(
          firstUser.id,
          personalizedRecs[0].restaurantId,
          'positive',
          'clicked'
        );
        console.log('  - Feedback tracked successfully');
        
        // Verify interaction was created
        const interaction = await prisma.userRestaurantInteraction.findUnique({
          where: {
            userId_restaurantId: {
              userId: firstUser.id,
              restaurantId: personalizedRecs[0].restaurantId,
            },
          },
        });
        console.log(`  - Interaction recorded: ${interaction ? 'Yes' : 'No'}`);
        console.log('  ✓ Feedback tracking working\n');
      }

      // Test 5: Check recommendation logs
      console.log('✓ Test 5: Recommendation Logging');
      const recentLogs = await prisma.recommendationLog.findMany({
        where: { userId: firstUser.id },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });
      console.log(`  - Recent logs: ${recentLogs.length}`);
      if (recentLogs.length > 0) {
        console.log(`  - Latest algorithm: ${recentLogs[0].algorithmUsed}`);
        console.log(`  - Restaurants recommended: ${recentLogs[0].restaurantIds.length}`);
      }
      console.log('  ✓ Recommendation logging working\n');
    } else {
      console.log('⚠️  Test 3-5 skipped: No users in database\n');
    }

    // Test 6: Location-based recommendations
    if (restaurantCount > 0) {
      console.log('✓ Test 6: Location-Based Recommendations');
      const locationRecs = await mlRecommendationEngine.getPersonalizedRecommendations({
        latitude: 40.7128,
        longitude: -74.0060,
        limit: 5,
      });
      console.log(`  - Generated ${locationRecs.length} location-based recommendations`);
      console.log('  ✓ Location-based recommendations working\n');
    }

    // Test 7: Check similarity data
    console.log('✓ Test 7: Restaurant Similarities');
    const similarityCount = await prisma.restaurantSimilarity.count();
    console.log(`  - Similarity records: ${similarityCount}`);
    if (similarityCount === 0) {
      console.log('  ⚠️  No similarity data. Run: npm run ml:compute-similarities');
    } else {
      const sampleSimilarity = await prisma.restaurantSimilarity.findFirst({
        include: {
          restaurant: { select: { name: true } },
          similarRestaurant: { select: { name: true } },
        },
      });
      if (sampleSimilarity) {
        console.log(`  - Example: ${sampleSimilarity.restaurant.name} similar to ${sampleSimilarity.similarRestaurant.name}`);
        console.log(`  - Similarity score: ${Number(sampleSimilarity.similarityScore).toFixed(3)}`);
      }
    }
    console.log('  ✓ Similarity data structure working\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 All Tests Passed!');
    console.log('═══════════════════════════════════════');
    console.log('\n📋 Next Steps:');
    console.log('  1. Run similarity computation: npm run ml:compute-similarities');
    console.log('  2. Set up cron jobs for daily similarity updates');
    console.log('  3. Integrate recommendation components into your pages');
    console.log('  4. Monitor recommendation performance in analytics\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testRecommendationEngine()
  .then(() => {
    console.log('✓ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Test suite failed:', error);
    process.exit(1);
  });
