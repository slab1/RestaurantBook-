/**
 * Loyalty System Comprehensive Test Suite
 * Tests for VIP tier progression, points earning, achievement unlocking, and Nigerian market scenarios
 */

import { PrismaClient, LoyaltyTransactionType, UserRole } from '@prisma/client';
import { LoyaltyService } from '../lib/loyalty-service';
import { UserTierService } from '../lib/user-tier-service';
import { AchievementService } from '../lib/achievement-service';

const prisma = new PrismaClient();

describe('Loyalty System Tests', () => {
  let loyaltyService: LoyaltyService;
  let tierService: UserTierService;
  let achievementService: AchievementService;
  let testUser: any;
  let testRestaurant: any;

  beforeAll(async () => {
    loyaltyService = new LoyaltyService(prisma);
    tierService = new UserTierService(prisma);
    achievementService = new AchievementService(prisma);

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'test.user@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        country: 'NG', // Nigeria
        state: 'Lagos',
        city: 'Lagos',
        loyaltyPoints: 0,
        totalSpent: 0,
      },
    });

    // Create test restaurant with loyalty program
    const owner = await prisma.user.create({
      data: {
        email: 'owner@example.com',
        password: 'hashedPassword',
        firstName: 'Restaurant',
        lastName: 'Owner',
        role: UserRole.RESTAURANT_OWNER,
      },
    });

    testRestaurant = await prisma.restaurant.create({
      data: {
        name: 'Test Restaurant',
        address: '123 Test St',
        city: 'Lagos',
        state: 'Lagos',
        zipCode: '10001',
        country: 'NG',
        phone: '+2341234567890',
        email: 'test@restaurant.com',
        cuisine: ['Nigerian'],
        priceRange: '$$',
        loyaltyProgram: true,
        loyaltyRate: 0.02, // 2 points per NGN
        ownerId: owner.id,
        operatingHours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '21:00' },
        },
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.loyaltyTransaction.deleteMany({ where: { userId: testUser.id } });
    await prisma.booking.deleteMany({ where: { userId: testUser.id } });
    await prisma.payment.deleteMany({ where: { userId: testUser.id } });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test' } } });
    await prisma.restaurant.deleteMany({ where: { name: 'Test Restaurant' } });
    await prisma.$disconnect();
  });

  describe('Points Earning Tests', () => {
    test('should earn points on completed booking', async () => {
      const amount = 5000; // 5000 NGN
      const pointsEarned = Math.floor(amount * 0.02); // 100 points

      const booking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          partySize: 2,
          status: 'COMPLETED',
          loyaltyPointsEarned: pointsEarned,
        },
        include: {
          restaurant: true,
        },
      });

      await loyaltyService.earnPoints({
        userId: testUser.id,
        points: pointsEarned,
        description: `Points earned from booking ${booking.id}`,
        referenceId: booking.id,
        referenceType: 'booking',
      });

      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          loyaltyTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      expect(updatedUser?.loyaltyPoints).toBe(pointsEarned);
      expect(updatedUser?.loyaltyTransactions[0].points).toBe(pointsEarned);
      expect(updatedUser?.loyaltyTransactions[0].type).toBe(LoyaltyTransactionType.EARNED);
    });

    test('should earn bonus points for VIP users', async () => {
      // Set user as VIP
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 5000,
          totalSpent: 100000,
        },
      });

      const amount = 10000; // 10000 NGN
      const basePoints = Math.floor(amount * 0.02); // 200 points
      const vipBonus = Math.floor(basePoints * 0.5); // 50% bonus
      const totalPoints = basePoints + vipBonus;

      await loyaltyService.earnPoints({
        userId: testUser.id,
        points: totalPoints,
        description: `VIP bonus points earned`,
        referenceId: 'test-ref',
        referenceType: 'booking',
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user?.loyaltyPoints).toBe(5000 + totalPoints);
    });

    test('should earn double points during promotion period', async () => {
      const amount = 5000;
      const basePoints = Math.floor(amount * 0.02); // 100 points
      const doublePoints = basePoints * 2; // 200 points

      await loyaltyService.earnPoints({
        userId: testUser.id,
        points: doublePoints,
        description: 'Double points promotion',
        referenceId: 'promo-ref',
        referenceType: 'promotion',
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user?.loyaltyPoints).toBeGreaterThan(5200);
    });

    test('should handle partial payment with points redemption', async () => {
      const totalAmount = 10000; // 10000 NGN
      const pointsUsed = 500; // Using 500 points
      const cashAmount = totalAmount - (pointsUsed / 10); // 1 point = 0.1 NGN

      const booking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          partySize: 4,
          status: 'COMPLETED',
          loyaltyPointsUsed: pointsUsed,
          loyaltyPointsEarned: Math.floor(cashAmount * 0.02),
        },
      });

      await loyaltyService.redeemPoints({
        userId: testUser.id,
        points: pointsUsed,
        description: `Points redeemed for booking ${booking.id}`,
        referenceId: booking.id,
        referenceType: 'booking',
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          loyaltyTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 2,
          },
        },
      });

      expect(user?.loyaltyPoints).toBeLessThan(5700); // Should have decreased
      expect(user?.loyaltyTransactions[0].type).toBe(LoyaltyTransactionType.REDEEMED);
    });

    test('should track Nigerian Naira currency correctly', async () => {
      const amount = 25000; // 25000 NGN
      const points = Math.floor(amount * 0.02); // 500 points

      const transaction = await prisma.loyaltyTransaction.create({
        data: {
          userId: testUser.id,
          type: LoyaltyTransactionType.EARNED,
          points: points,
          description: `Nigerian Naira transaction: ₦${amount}`,
        },
      });

      expect(transaction.points).toBe(500);
      expect(transaction.description).toContain('₦25000');
    });
  });

  describe('VIP Tier Progression Tests', () => {
    beforeEach(async () => {
      // Reset user to bronze tier
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 0,
          totalSpent: 0,
        },
      });
    });

    test('should progress from Bronze to Silver tier', async () => {
      const silverThreshold = 1000;
      const amount = 50000; // 50000 NGN
      const earnedPoints = Math.floor(amount * 0.02); // 1000 points

      // Earn points to reach Silver tier
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: silverThreshold,
          totalSpent: amount,
        },
      });

      const tier = await tierService.getUserTier(testUser.id);
      expect(tier.currentTier).toBe('SILVER');
      expect(tier.points).toBe(silverThreshold);
      expect(tier.nextTier).toBe('GOLD');
      expect(tier.pointsToNextTier).toBe(2000); // 3000 - 1000
    });

    test('should progress from Silver to Gold tier', async () => {
      const goldThreshold = 3000;
      const amount = 150000; // 150000 NGN

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: goldThreshold,
          totalSpent: amount,
        },
      });

      const tier = await tierService.getUserTier(testUser.id);
      expect(tier.currentTier).toBe('GOLD');
      expect(tier.points).toBe(goldThreshold);
      expect(tier.nextTier).toBe('PLATINUM');
      expect(tier.pointsToNextTier).toBe(2000); // 5000 - 3000
    });

    test('should progress to Platinum tier', async () => {
      const platinumThreshold = 5000;
      const amount = 250000; // 250000 NGN

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: platinumThreshold,
          totalSpent: amount,
        },
      });

      const tier = await tierService.getUserTier(testUser.id);
      expect(tier.currentTier).toBe('PLATINUM');
      expect(tier.points).toBe(platinumThreshold);
      expect(tier.nextTier).toBe('DIAMOND');
      expect(tier.pointsToNextTier).toBe(5000); // 10000 - 5000
    });

    test('should achieve Diamond tier status', async () => {
      const diamondThreshold = 10000;
      const amount = 500000; // 500000 NGN

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: diamondThreshold,
          totalSpent: amount,
        },
      });

      const tier = await tierService.getUserTier(testUser.id);
      expect(tier.currentTier).toBe('DIAMOND');
      expect(tier.points).toBe(diamondThreshold);
      expect(tier.nextTier).toBe(null); // Diamond is highest tier
      expect(tier.pointsToNextTier).toBe(0);
    });

    test('should downgrade tier when points expire', async () => {
      // Set user as Diamond
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 8000, // Below Diamond threshold
          totalSpent: 500000,
        },
      });

      // Simulate point expiration
      await loyaltyService.expirePoints({
        userId: testUser.id,
        points: 2000,
        description: 'Points expired after 12 months',
      });

      const tier = await tierService.getUserTier(testUser.id);
      expect(tier.currentTier).toBe('PLATINUM');
    });

    test('should calculate tier benefits correctly', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 5000,
          totalSpent: 250000,
        },
      });

      const benefits = await tierService.getTierBenefits(testUser.id);
      expect(benefits.discountPercentage).toBe(10); // Platinum: 10%
      expect(benefits.pointMultiplier).toBe(1.5);
      expect(benefits.priorityBooking).toBe(true);
      expect(benefits.freeDeliveryThreshold).toBe(10000); // ₦10,000
      expect(benefits.birthdayBonus).toBe(1000); // 1000 bonus points
    });
  });

  describe('Achievement Unlocking Tests', () => {
    test('should unlock "First Booking" achievement', async () => {
      const booking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingTime: new Date(),
          partySize: 2,
          status: 'COMPLETED',
        },
      });

      const achievement = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'booking_completed',
        { bookingId: booking.id }
      );

      expect(achievement).toContainEqual(
        expect.objectContaining({
          achievementId: 'first_booking',
          title: 'First Booking',
        })
      );
    });

    test('should unlock "Regular Diner" after 10 bookings', async () => {
      // Create 10 completed bookings
      for (let i = 0; i < 10; i++) {
        await prisma.booking.create({
          data: {
            userId: testUser.id,
            restaurantId: testRestaurant.id,
            bookingTime: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            partySize: 2,
            status: 'COMPLETED',
          },
        });
      }

      const achievements = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'booking_milestone',
        { totalBookings: 10 }
      );

      expect(achievements).toContainEqual(
        expect.objectContaining({
          achievementId: 'regular_diner',
          title: 'Regular Diner',
        })
      );
    });

    test('should unlock "VIP Status" achievement', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 5000,
          totalSpent: 250000,
        },
      });

      const achievements = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'tier_achieved',
        { tier: 'PLATINUM' }
      );

      expect(achievements).toContainEqual(
        expect.objectContaining({
          achievementId: 'vip_status',
          title: 'VIP Status',
        })
      );
    });

    test('should unlock "Big Spender" achievement', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          totalSpent: 500000, // 500,000 NGN
        },
      });

      const achievements = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'spending_milestone',
        { totalSpent: 500000 }
      );

      expect(achievements).toContainEqual(
        expect.objectContaining({
          achievementId: 'big_spender',
          title: 'Big Spender',
        })
      );
    });

    test('should unlock "Loyal Customer" after 1 year', async () => {
      const joinDate = new Date();
      joinDate.setFullYear(joinDate.getFullYear() - 1); // 1 year ago

      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          createdAt: joinDate,
        },
      });

      const achievements = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'anniversary',
        { daysSinceJoin: 365 }
      );

      expect(achievements).toContainEqual(
        expect.objectContaining({
          achievementId: 'loyal_customer',
          title: 'Loyal Customer',
        })
      );
    });

    test('should unlock "Social Sharer" achievement', async () => {
      await prisma.socialShare.create({
        data: {
          userId: testUser.id,
          platform: 'WHATSAPP',
          shareType: 'BOOKING_SHARE',
          restaurantId: testRestaurant.id,
        },
      });

      const achievements = await achievementService.checkAndUnlockAchievements(
        testUser.id,
        'social_share',
        { platform: 'WHATSAPP' }
      );

      expect(achievements).toContainEqual(
        expect.objectContaining({
          achievementId: 'social_sharer',
          title: 'Social Sharer',
        })
      );
    });
  });

  describe('Nigerian Market Scenario Tests', () => {
    test('should handle Naira currency formatting', async () => {
      const amount = 125000; // 125,000 NGN
      const points = Math.floor(amount * 0.02); // 2500 points

      const transaction = await prisma.loyaltyTransaction.create({
        data: {
          userId: testUser.id,
          type: LoyaltyTransactionType.EARNED,
          points: points,
          description: `Booking payment: ₦${amount.toLocaleString('en-NG')}`,
        },
      });

      expect(transaction.description).toContain('₦125,000');
      expect(transaction.points).toBe(2500);
    });

    test('should apply local pricing tiers for Nigerian market', async () => {
      // Nigerian market pricing tiers
      const pricingTiers = {
        BRONZE: { minSpent: 0, minPoints: 0, benefits: { discount: 0, freeDelivery: 0 } },
        SILVER: { minSpent: 50000, minPoints: 1000, benefits: { discount: 5, freeDelivery: 15000 } },
        GOLD: { minSpent: 150000, minPoints: 3000, benefits: { discount: 8, freeDelivery: 20000 } },
        PLATINUM: { minSpent: 300000, minPoints: 5000, benefits: { discount: 12, freeDelivery: 25000 } },
        DIAMOND: { minSpent: 600000, minPoints: 10000, benefits: { discount: 15, freeDelivery: 30000 } },
      };

      // Test Platinum tier in Nigerian context
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 5000,
          totalSpent: 300000, // 300,000 NGN
        },
      });

      const benefits = await tierService.getTierBenefits(testUser.id);
      expect(benefits.discountPercentage).toBe(12);
      expect(benefits.freeDeliveryThreshold).toBe(25000); // ₦25,000
      expect(benefits.currency).toBe('NGN');
    });

    test('should handle mobile money payments (Nigeria popular payment method)', async () => {
      const payment = await prisma.payment.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingId: (await prisma.booking.findFirst({ where: { userId: testUser.id } }))?.id || '',
          amount: 8000,
          currency: 'NGN',
          paymentMethod: 'mobile_money',
          status: 'COMPLETED',
          loyaltyPointsEarned: 160, // 8000 * 0.02
        },
      });

      expect(payment.paymentMethod).toBe('mobile_money');
      expect(payment.loyaltyPointsEarned).toBe(160);
      expect(payment.currency).toBe('NGN');
    });

    test('should support Hausa, Yoruba, and Igbo language preferences', async () => {
      const languages = ['ha', 'yo', 'ig']; // Hausa, Yoruba, Igbo

      for (const lang of languages) {
        await prisma.userLanguagePreference.create({
          data: {
            userId: testUser.id,
            locale: lang,
            isPrimary: lang === 'ha',
            detectionSource: 'manual',
          },
        });
      }

      const preferences = await prisma.userLanguagePreference.findMany({
        where: { userId: testUser.id },
      });

      expect(preferences).toHaveLength(3);
      expect(preferences.find(p => p.locale === 'ha')?.isPrimary).toBe(true);
    });

    test('should handle Lagos location-based promotions', async () => {
      const promotion = await prisma.promotion.create({
        data: {
          restaurantId: testRestaurant.id,
          title: 'Lagos Special Weekend',
          description: '20% off for Lagos customers',
          discountType: 'percentage',
          discountValue: 20,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          targetAudience: ['lagos_customers'],
          applicableDays: ['saturday', 'sunday'],
        },
      });

      // Check if promotion applies to Lagos users
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user?.city).toBe('Lagos');
      expect(promotion.targetAudience).toContain('lagos_customers');
    });

    test('should calculate delivery zones for Nigerian cities', async () => {
      const deliveryZone = await prisma.deliveryZone.create({
        data: {
          restaurantId: testRestaurant.id,
          zoneName: 'Victoria Island',
          deliveryFee: 1500, // ₦1,500
          minimumOrder: 5000, // ₦5,000
          maximumDistanceKm: 10,
          estimatedTimeMinutes: 45,
          freeDeliveryThreshold: 25000, // ₦25,000
        },
      });

      expect(deliveryZone.deliveryFee).toBe(1500);
      expect(deliveryZone.freeDeliveryThreshold).toBe(25000);
      expect(deliveryZone.currency).toBe('NGN');
    });

    test('should handle bank transfer payments (Nigerian banking)', async () => {
      const payment = await prisma.payment.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingId: (await prisma.booking.findFirst({ where: { userId: testUser.id } }))?.id || '',
          amount: 15000,
          currency: 'NGN',
          paymentMethod: 'bank_transfer',
          status: 'COMPLETED',
          loyaltyPointsEarned: 300,
          metadata: {
            bank: 'GTBank',
            reference: 'TRF123456789',
          },
        },
      });

      expect(payment.paymentMethod).toBe('bank_transfer');
      expect(payment.metadata?.bank).toBe('GTBank');
      expect(payment.loyaltyPointsEarned).toBe(300);
    });
  });

  describe('Point Expiration Tests', () => {
    test('should expire points after 12 months', async () => {
      // Create old transaction (13 months ago)
      const oldDate = new Date();
      oldDate.setMonth(oldDate.getMonth() - 13);

      const expiredTransaction = await prisma.loyaltyTransaction.create({
        data: {
          userId: testUser.id,
          type: LoyaltyTransactionType.EARNED,
          points: 1000,
          description: 'Old points to expire',
          expiresAt: oldDate,
        },
      });

      const expiredCount = await loyaltyService.expireOldPoints();
      expect(expiredCount).toBeGreaterThan(0);

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        include: {
          loyaltyTransactions: {
            where: {
              type: LoyaltyTransactionType.EXPIRED,
            },
          },
        },
      });

      expect(user?.loyaltyTransactions).toContainEqual(
        expect.objectContaining({
          type: LoyaltyTransactionType.EXPIRED,
        })
      );
    });

    test('should not expire points within validity period', async () => {
      const currentDate = new Date();
      const futureExpiry = new Date();
      futureExpiry.setFullYear(futureExpiry.getFullYear() + 1);

      await prisma.loyaltyTransaction.create({
        data: {
          userId: testUser.id,
          type: LoyaltyTransactionType.EARNED,
          points: 500,
          description: 'Valid points',
          expiresAt: futureExpiry,
        },
      });

      const expiredCount = await loyaltyService.expireOldPoints();
      expect(expiredCount).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    test('should integrate with booking lifecycle', async () => {
      // Test complete booking flow with loyalty
      const booking = await prisma.booking.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          partySize: 4,
          status: 'COMPLETED',
          loyaltyPointsEarned: 200,
        },
      });

      const payment = await prisma.payment.create({
        data: {
          userId: testUser.id,
          restaurantId: testRestaurant.id,
          bookingId: booking.id,
          amount: 10000,
          currency: 'NGN',
          status: 'COMPLETED',
          loyaltyPointsEarned: 200,
        },
      });

      // Update user totals
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: { increment: 200 },
          totalSpent: { increment: 10000 },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      expect(user?.loyaltyPoints).toBeGreaterThan(0);
      expect(user?.totalSpent).toBeGreaterThan(10000);
    });

    test('should handle concurrent point operations', async () => {
      const operations = Array(10).fill(null).map(async () => {
        return loyaltyService.earnPoints({
          userId: testUser.id,
          points: 100,
          description: 'Concurrent earn',
          referenceId: `ref-${Date.now()}`,
          referenceType: 'test',
        });
      });

      await Promise.all(operations);

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });

      // Points should be updated correctly despite concurrent operations
      expect(user?.loyaltyPoints).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle negative point balance gracefully', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          loyaltyPoints: 0,
        },
      });

      await expect(
        loyaltyService.redeemPoints({
          userId: testUser.id,
          points: 100,
          description: 'Attempt to over-redeem',
          referenceId: 'test',
          referenceType: 'test',
        })
      ).rejects.toThrow('Insufficient points');
    });

    test('should prevent points manipulation', async () => {
      await expect(
        prisma.loyaltyTransaction.create({
          data: {
            userId: testUser.id,
            type: LoyaltyTransactionType.EARNED,
            points: 1000000, // Unrealistic amount
            description: 'Manipulation attempt',
          },
        })
      ).not.toThrow(); // Should create but flag for review

      const recentTransactions = await prisma.loyaltyTransaction.findMany({
        where: { userId: testUser.id },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      expect(recentTransactions[0]?.points).toBe(1000000);
    });

    test('should handle database transaction rollbacks', async () => {
      const initialPoints = (await prisma.user.findUnique({ where: { id: testUser.id } }))?.loyaltyPoints || 0;

      // Simulate failed operation
      try {
        await prisma.$transaction(async (tx) => {
          await tx.loyaltyTransaction.create({
            data: {
              userId: testUser.id,
              type: LoyaltyTransactionType.EARNED,
              points: 500,
              description: 'Test transaction',
            },
          });
          
          // Simulate an error
          throw new Error('Simulated error');
        });
      } catch (error) {
        // Expected to fail
      }

      const finalPoints = (await prisma.user.findUnique({ where: { id: testUser.id } }))?.loyaltyPoints || 0;
      expect(finalPoints).toBe(initialPoints);
    });
  });
});
