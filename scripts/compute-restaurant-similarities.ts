/**
 * Compute Restaurant Similarity Script
 * 
 * This script computes similarity scores between restaurants based on:
 * 1. Collaborative filtering: Users who booked restaurant A also booked restaurant B
 * 2. Content-based: Similar cuisine, price range, features, location
 * 3. Hybrid: Combination of both approaches
 * 
 * Run this script periodically (e.g., daily via cron job) to keep similarity data fresh
 */

import { PrismaClient, Decimal } from '@prisma/client';

const prisma = new PrismaClient();

interface SimilarityData {
  restaurantId: string;
  similarRestaurantId: string;
  similarityScore: number;
  similarityType: string;
  featureOverlap: {
    reasons: string[];
    cuisineOverlap: number;
    priceMatch: boolean;
    locationDistance?: number;
  };
}

/**
 * Main function to compute all restaurant similarities
 */
async function computeRestaurantSimilarities() {
  console.log('Starting restaurant similarity computation...');
  const startTime = Date.now();

  try {
    // Get all active restaurants
    const restaurants = await prisma.restaurant.findMany({
      where: {
        isActive: true,
        isVerified: true,
      },
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    });

    console.log(`Computing similarities for ${restaurants.length} restaurants`);

    const similarities: SimilarityData[] = [];

    // Compute pairwise similarities
    for (let i = 0; i < restaurants.length; i++) {
      const restaurant1 = restaurants[i];
      
      for (let j = i + 1; j < restaurants.length; j++) {
        const restaurant2 = restaurants[j];

        // Collaborative filtering similarity
        const collaborativeSim = await computeCollaborativeSimilarity(
          restaurant1.id,
          restaurant2.id
        );

        // Content-based similarity
        const contentSim = computeContentBasedSimilarity(restaurant1, restaurant2);

        // Hybrid similarity (weighted average)
        const hybridScore = collaborativeSim * 0.6 + contentSim.score * 0.4;

        // Only store if similarity is above threshold
        if (hybridScore >= 0.3) {
          similarities.push({
            restaurantId: restaurant1.id,
            similarRestaurantId: restaurant2.id,
            similarityScore: hybridScore,
            similarityType: 'hybrid',
            featureOverlap: contentSim.overlap,
          });

          // Store reverse direction too
          similarities.push({
            restaurantId: restaurant2.id,
            similarRestaurantId: restaurant1.id,
            similarityScore: hybridScore,
            similarityType: 'hybrid',
            featureOverlap: contentSim.overlap,
          });
        }

        // Also store individual scores if high enough
        if (collaborativeSim >= 0.4) {
          similarities.push({
            restaurantId: restaurant1.id,
            similarRestaurantId: restaurant2.id,
            similarityScore: collaborativeSim,
            similarityType: 'collaborative',
            featureOverlap: contentSim.overlap,
          });
        }

        if (contentSim.score >= 0.5) {
          similarities.push({
            restaurantId: restaurant1.id,
            similarRestaurantId: restaurant2.id,
            similarityScore: contentSim.score,
            similarityType: 'content_based',
            featureOverlap: contentSim.overlap,
          });
        }
      }

      // Log progress every 10 restaurants
      if ((i + 1) % 10 === 0) {
        console.log(`Processed ${i + 1}/${restaurants.length} restaurants`);
      }
    }

    console.log(`Computed ${similarities.length} similarity relationships`);

    // Delete old similarities
    await prisma.restaurantSimilarity.deleteMany({});
    console.log('Deleted old similarity data');

    // Batch insert new similarities
    const batchSize = 1000;
    for (let i = 0; i < similarities.length; i += batchSize) {
      const batch = similarities.slice(i, i + batchSize);
      await prisma.restaurantSimilarity.createMany({
        data: batch.map(sim => ({
          restaurantId: sim.restaurantId,
          similarRestaurantId: sim.similarRestaurantId,
          similarityScore: new Decimal(sim.similarityScore),
          similarityType: sim.similarityType,
          featureOverlap: sim.featureOverlap,
        })),
      });
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(similarities.length / batchSize)}`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`✓ Similarity computation completed in ${duration} seconds`);
    console.log(`  Total similarities stored: ${similarities.length}`);
  } catch (error) {
    console.error('Error computing similarities:', error);
    throw error;
  }
}

/**
 * Compute collaborative filtering similarity
 * Based on users who booked both restaurants
 */
async function computeCollaborativeSimilarity(
  restaurantId1: string,
  restaurantId2: string
): Promise<number> {
  try {
    // Get users who booked restaurant 1
    const users1 = await prisma.booking.findMany({
      where: { restaurantId: restaurantId1, status: 'COMPLETED' },
      select: { userId: true },
      distinct: ['userId'],
    });

    // Get users who booked restaurant 2
    const users2 = await prisma.booking.findMany({
      where: { restaurantId: restaurantId2, status: 'COMPLETED' },
      select: { userId: true },
      distinct: ['userId'],
    });

    const users1Set = new Set(users1.map(u => u.userId));
    const users2Set = new Set(users2.map(u => u.userId));

    // Calculate Jaccard similarity
    const intersection = new Set([...users1Set].filter(u => users2Set.has(u)));
    const union = new Set([...users1Set, ...users2Set]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  } catch (error) {
    console.error('Error computing collaborative similarity:', error);
    return 0;
  }
}

/**
 * Compute content-based similarity
 * Based on restaurant features
 */
function computeContentBasedSimilarity(
  restaurant1: any,
  restaurant2: any
): { score: number; overlap: any } {
  let score = 0;
  const reasons: string[] = [];

  // Cuisine similarity (Jaccard)
  const cuisine1 = new Set(restaurant1.cuisine);
  const cuisine2 = new Set(restaurant2.cuisine);
  const cuisineIntersection = new Set([...cuisine1].filter(c => cuisine2.has(c)));
  const cuisineUnion = new Set([...cuisine1, ...cuisine2]);
  const cuisineOverlap = cuisineUnion.size > 0 ? cuisineIntersection.size / cuisineUnion.size : 0;
  
  score += cuisineOverlap * 0.4;
  if (cuisineOverlap > 0.5) {
    reasons.push('Similar cuisine');
  }

  // Price range match
  const priceMatch = restaurant1.priceRange === restaurant2.priceRange;
  if (priceMatch) {
    score += 0.25;
    reasons.push('Same price range');
  }

  // Rating similarity
  const ratingDiff = Math.abs(restaurant1.rating - restaurant2.rating);
  const ratingSim = Math.max(0, 1 - ratingDiff / 5);
  score += ratingSim * 0.15;
  if (ratingSim > 0.8) {
    reasons.push('Similar quality');
  }

  // Location proximity (if coordinates available)
  let locationDistance = null;
  if (
    restaurant1.latitude &&
    restaurant1.longitude &&
    restaurant2.latitude &&
    restaurant2.longitude
  ) {
    locationDistance = calculateDistance(
      restaurant1.latitude,
      restaurant1.longitude,
      restaurant2.latitude,
      restaurant2.longitude
    );

    // Closer restaurants are more similar
    const locationSim = Math.max(0, 1 - locationDistance / 20); // 20km max
    score += locationSim * 0.1;
    if (locationDistance < 5) {
      reasons.push('Nearby location');
    }
  }

  // Features overlap
  const features1 = new Set(restaurant1.features);
  const features2 = new Set(restaurant2.features);
  const featuresIntersection = new Set([...features1].filter(f => features2.has(f)));
  const featuresUnion = new Set([...features1, ...features2]);
  const featuresOverlap = featuresUnion.size > 0 ? featuresIntersection.size / featuresUnion.size : 0;
  
  score += featuresOverlap * 0.1;
  if (featuresOverlap > 0.5) {
    reasons.push('Similar amenities');
  }

  return {
    score: Math.min(1, score),
    overlap: {
      reasons,
      cuisineOverlap,
      priceMatch,
      locationDistance,
    },
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Run the computation
computeRestaurantSimilarities()
  .then(() => {
    console.log('✓ Similarity computation job completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Similarity computation job failed:', error);
    process.exit(1);
  });
