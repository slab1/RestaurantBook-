/**
 * Seed Delivery Platforms
 * Populate database with delivery platform configurations
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const platforms = [
  {
    name: 'uber_eats',
    displayName: 'Uber Eats',
    apiEndpoint: process.env.UBER_EATS_API_ENDPOINT || 'https://api.uber.com/v2/eats',
    commissionRate: 0.30, // 30%
    supportedCountries: ['NG', 'US', 'GB', 'CA', 'AU'],
    isActive: true,
    configuration: {
      features: ['delivery', 'pickup'],
      paymentMethods: ['card', 'cash', 'wallet'],
    },
  },
  {
    name: 'doordash',
    displayName: 'DoorDash',
    apiEndpoint: process.env.DOORDASH_API_ENDPOINT || 'https://openapi.doordash.com',
    commissionRate: 0.25, // 25%
    supportedCountries: ['NG', 'US', 'CA', 'AU'],
    isActive: true,
    configuration: {
      features: ['delivery', 'pickup', 'drive'],
      paymentMethods: ['card', 'cash'],
    },
  },
  {
    name: 'grubhub',
    displayName: 'Grubhub',
    apiEndpoint: process.env.GRUBHUB_API_ENDPOINT || 'https://api.grubhub.com',
    commissionRate: 0.20, // 20%
    supportedCountries: ['NG', 'US'],
    isActive: true,
    configuration: {
      features: ['delivery', 'pickup'],
      paymentMethods: ['card', 'paypal'],
    },
  },
];

async function main() {
  console.log('Seeding delivery platforms...');

  for (const platform of platforms) {
    const result = await prisma.deliveryPlatform.upsert({
      where: { name: platform.name },
      update: platform,
      create: platform,
    });

    console.log(`✓ ${result.displayName} (${result.name})`);
  }

  console.log('\n✅ Delivery platforms seeded successfully!');
  console.log('\nAvailable platforms:');
  console.log('- Uber Eats (30% commission)');
  console.log('- DoorDash (25% commission)');
  console.log('- Grubhub (20% commission)');
}

main()
  .catch((e) => {
    console.error('Error seeding delivery platforms:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
