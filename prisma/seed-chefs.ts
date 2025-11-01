import { PrismaClient, UserRole, ChefStatus, ChefEventType, ChefServiceType, ChefBookingStatus, DayOfWeek } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, addHours, subDays } from 'date-fns'

const prisma = new PrismaClient()

// Nigerian cities for chef locations
const nigerianCities = [
  { city: 'Lagos', state: 'Lagos', lat: 6.5244, lng: 3.3792 },
  { city: 'Abuja', state: 'FCT', lat: 9.0765, lng: 7.3986 },
  { city: 'Port Harcourt', state: 'Rivers', lat: 4.8156, lng: 7.0498 },
  { city: 'Ibadan', state: 'Oyo', lat: 7.3775, lng: 3.9470 },
  { city: 'Kano', state: 'Kano', lat: 12.0022, lng: 8.5920 },
]

// Chef specialties focusing on Nigerian market
const chefSpecialties = [
  { name: 'Nigerian Cuisine', types: ['Jollof Rice', 'Suya', 'Pepper Soup', 'Egusi Soup', 'Pounded Yam'] },
  { name: 'Italian Cuisine', types: ['Pasta', 'Pizza', 'Risotto', 'Tiramisu'] },
  { name: 'Chinese Cuisine', types: ['Fried Rice', 'Noodles', 'Dim Sum', 'Peking Duck'] },
  { name: 'Continental', types: ['Grilled Meats', 'Salads', 'Steaks', 'Seafood'] },
  { name: 'Pastries & Baking', types: ['Cakes', 'Bread', 'Pastries', 'Desserts'] },
  { name: 'BBQ & Grilling', types: ['Suya', 'Asun', 'Grilled Fish', 'BBQ Chicken'] },
  { name: 'Seafood Specialist', types: ['Fish Pepper Soup', 'Grilled Prawns', 'Crab', 'Lobster'] },
  { name: 'Vegetarian & Vegan', types: ['Plant-Based', 'Organic', 'Healthy Meals'] },
]

// Generate realistic chef profiles
const chefProfiles = [
  {
    firstName: 'Adewale', lastName: 'Ogunleye', specialty: 'Nigerian Cuisine', bio: 'Master of traditional Nigerian dishes with 15 years of experience. Specialized in authentic Yoruba cuisine and modern fusion.',
    experience: 15, hourlyRate: '25000', eventMin: '80000', city: 'Lagos',
  },
  {
    firstName: 'Chioma', lastName: 'Nwosu', specialty: 'Italian Cuisine', bio: 'Italian-trained chef bringing authentic Mediterranean flavors to Nigeria. Expert in fresh pasta and regional Italian cuisine.',
    experience: 12, hourlyRate: '30000', eventMin: '100000', city: 'Abuja',
  },
  {
    firstName: 'Yusuf', lastName: 'Abdullahi', specialty: 'BBQ & Grilling', bio: 'Northern Nigerian BBQ specialist. Famous for the best suya and asun in town. Perfect for outdoor events.',
    experience: 10, hourlyRate: '20000', eventMin: '60000', city: 'Kano',
  },
  {
    firstName: 'Ngozi', lastName: 'Okeke', specialty: 'Pastries & Baking', bio: 'Award-winning pastry chef specializing in wedding cakes, birthday cakes, and artisan bread. French-trained.',
    experience: 8, hourlyRate: '22000', eventMin: '70000', city: 'Lagos',
  },
  {
    firstName: 'Emeka', lastName: 'Eze', specialty: 'Continental', bio: 'Fine dining specialist with experience in 5-star hotels. Expert in modern continental cuisine and plating.',
    experience: 14, hourlyRate: '35000', eventMin: '120000', city: 'Lagos',
  },
  {
    firstName: 'Fatima', lastName: 'Bello', specialty: 'Nigerian Cuisine', bio: 'Northern Nigerian cuisine expert. Specializes in traditional Hausa delicacies and fusion dishes.',
    experience: 9, hourlyRate: '23000', eventMin: '75000', city: 'Abuja',
  },
  {
    firstName: 'Tunde', lastName: 'Adeyemi', specialty: 'Chinese Cuisine', bio: 'Chinese cuisine specialist with training in Beijing. Brings authentic Asian flavors to Nigerian palates.',
    experience: 11, hourlyRate: '28000', eventMin: '90000', city: 'Lagos',
  },
  {
    firstName: 'Blessing', lastName: 'Onyeka', specialty: 'Vegetarian & Vegan', bio: 'Plant-based cuisine innovator. Creating delicious healthy meals that everyone will love.',
    experience: 6, hourlyRate: '20000', eventMin: '65000', city: 'Abuja',
  },
  {
    firstName: 'Olumide', lastName: 'Williams', specialty: 'Seafood Specialist', bio: 'Coastal cuisine expert from Port Harcourt. Fresh seafood prepared in traditional and modern styles.',
    experience: 13, hourlyRate: '32000', eventMin: '105000', city: 'Port Harcourt',
  },
  {
    firstName: 'Amina', lastName: 'Mohammed', specialty: 'Nigerian Cuisine', bio: 'Expert in Northern and Middle Belt cuisine. Known for exceptional pepper soup and tuwo shinkafa.',
    experience: 10, hourlyRate: '24000', eventMin: '78000', city: 'Kano',
  },
  {
    firstName: 'David', lastName: 'Okafor', specialty: 'BBQ & Grilling', bio: 'BBQ master and caterer. Specializes in large events, parties, and outdoor grilling experiences.',
    experience: 7, hourlyRate: '21000', eventMin: '68000', city: 'Ibadan',
  },
  {
    firstName: 'Zainab', lastName: 'Abubakar', specialty: 'Pastries & Baking', bio: 'Specializes in traditional Nigerian pastries and modern desserts. Perfect for weddings and celebrations.',
    experience: 5, hourlyRate: '19000', eventMin: '60000', city: 'Abuja',
  },
  {
    firstName: 'Chidi', lastName: 'Nnamdi', specialty: 'Italian Cuisine', bio: 'Passionate about authentic Italian cuisine. Studied in Rome and brings traditional recipes to life.',
    experience: 9, hourlyRate: '27000', eventMin: '88000', city: 'Lagos',
  },
  {
    firstName: 'Hauwa', lastName: 'Ibrahim', specialty: 'Nigerian Cuisine', bio: 'Traditional Nigerian chef with modern techniques. Expert in all regional Nigerian cuisines.',
    experience: 11, hourlyRate: '26000', eventMin: '85000', city: 'Kano',
  },
  {
    firstName: 'Michael', lastName: 'Oluwaseun', specialty: 'Continental', bio: 'European cuisine specialist. Trained in London and Paris. Brings international standards to your events.',
    experience: 16, hourlyRate: '38000', eventMin: '130000', city: 'Lagos',
  },
  {
    firstName: 'Kemi', lastName: 'Adebayo', specialty: 'Seafood Specialist', bio: 'Seafood specialist from Lagos. Fresh catches prepared with Nigerian and international styles.',
    experience: 8, hourlyRate: '29000', eventMin: '95000', city: 'Lagos',
  },
  {
    firstName: 'Ibrahim', lastName: 'Musa', specialty: 'Chinese Cuisine', bio: 'Asian fusion expert. Combines Chinese techniques with Nigerian ingredients for unique flavors.',
    experience: 7, hourlyRate: '25000', eventMin: '82000', city: 'Abuja',
  },
  {
    firstName: 'Folake', lastName: 'Akinola', specialty: 'Nigerian Cuisine', bio: 'Yoruba cuisine specialist. Famous for the most authentic amala, ewedu, and gbegiri in Lagos.',
    experience: 12, hourlyRate: '27000', eventMin: '90000', city: 'Lagos',
  },
  {
    firstName: 'Uche', lastName: 'Obi', specialty: 'BBQ & Grilling', bio: 'Igbo BBQ specialist. Expert in nkwobi, isi ewu, and all types of grilled meats.',
    experience: 9, hourlyRate: '23000', eventMin: '73000', city: 'Port Harcourt',
  },
  {
    firstName: 'Grace', lastName: 'Emmanuel', specialty: 'Vegetarian & Vegan', bio: 'Health-conscious chef creating nutritious plant-based Nigerian and international dishes.',
    experience: 5, hourlyRate: '21000', eventMin: '67000', city: 'Lagos',
  },
]

async function seedChefs() {
  console.log('👨‍🍳 Seeding chef data...')

  // Create chef users and profiles
  const chefs = []
  for (const profile of chefProfiles) {
    const password = await bcrypt.hash('chef123', 12)
    const cityData = nigerianCities.find(c => c.city === profile.city) || nigerianCities[0]
    
    // Create user account
    const user = await prisma.user.create({
      data: {
        email: `${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@chefs.com`,
        password,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: UserRole.CHEF,
        phone: `+234${Math.floor(Math.random() * 1000000000)}`,
        phoneVerified: true,
        emailVerified: true,
        city: profile.city,
        state: cityData.state,
        country: 'NG',
        preferredLanguage: 'en',
        timezone: 'Africa/Lagos',
      },
    })

    // Create chef profile
    const specialtyData = chefSpecialties.find(s => s.name === profile.specialty) || chefSpecialties[0]
    const chef = await prisma.chef.create({
      data: {
        userId: user.id,
        businessName: `Chef ${profile.firstName} ${profile.lastName}`,
        bio: profile.bio,
        yearsOfExperience: profile.experience,
        specialties: [profile.specialty, ...specialtyData.types.slice(0, 3)],
        certifications: profile.experience > 10 ? ['Culinary Arts Diploma', 'Food Safety Certificate', 'Professional Chef License'] : ['Food Safety Certificate'],
        hourlyRate: profile.hourlyRate,
        eventMinimumCharge: profile.eventMin,
        currency: 'NGN',
        travelRadiusKm: 25,
        status: ChefStatus.VERIFIED,
        isVerified: true,
        isFeatured: profile.experience > 12,
        isPremium: profile.experience > 14,
        rating: 4.0 + Math.random(),
        totalReviews: Math.floor(Math.random() * 50) + 10,
        totalBookings: Math.floor(Math.random() * 100) + 20,
        completedBookings: Math.floor(Math.random() * 90) + 15,
        responseTime: Math.floor(Math.random() * 60) + 10,
        acceptanceRate: 0.75 + Math.random() * 0.2,
        city: profile.city,
        state: cityData.state,
        country: 'NG',
        latitude: cityData.lat + (Math.random() - 0.5) * 0.1,
        longitude: cityData.lng + (Math.random() - 0.5) * 0.1,
        serviceTypes: ['ON_SITE_COOKING', 'MEAL_DELIVERY'],
        eventTypes: ['PRIVATE_DINING', 'BIRTHDAY_PARTY', 'WEDDING', 'CORPORATE_EVENT', 'COOKING_CLASS'],
        minPartySize: 1,
        maxPartySize: profile.specialty === 'BBQ & Grilling' ? 100 : 50,
        availableWeekdays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        minAdvanceBooking: 24,
        maxAdvanceBooking: 90,
        profileImage: `https://ui-avatars.com/api/?name=${profile.firstName}+${profile.lastName}&size=400&background=random`,
        verifiedAt: subDays(new Date(), Math.floor(Math.random() * 365)),
        verifiedBy: 'admin',
        instantBooking: profile.experience > 10,
        requiresDeposit: true,
        depositPercentage: 0.30,
        languages: ['en'],
        isActive: true,
        lastActiveAt: subDays(new Date(), Math.floor(Math.random() * 7)),
      },
    })

    chefs.push({ user, chef, profile })

    // Create weekly availability for chef
    const weekDays = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY]
    for (const day of weekDays) {
      await prisma.chefAvailability.create({
        data: {
          chefId: chef.id,
          dayOfWeek: day,
          isAvailable: true,
          startTime: '09:00',
          endTime: '23:00',
          maxBookingsPerDay: 2,
          isRecurring: true,
        },
      })
    }

    // Create portfolio items
    const portfolioCount = Math.floor(Math.random() * 5) + 3
    for (let i = 0; i < portfolioCount; i++) {
      await prisma.chefPortfolio.create({
        data: {
          chefId: chef.id,
          title: `${specialtyData.types[i % specialtyData.types.length]} Special`,
          description: `Beautiful presentation of ${specialtyData.types[i % specialtyData.types.length]} for a recent event`,
          images: [
            `https://source.unsplash.com/800x600/?${specialtyData.types[i % specialtyData.types.length].replace(' ', '-')},food`,
            `https://source.unsplash.com/800x600/?${profile.specialty.replace(' ', '-')},dish`,
          ],
          eventType: ['Birthday Party', 'Wedding', 'Corporate Event'][Math.floor(Math.random() * 3)],
          cuisine: profile.specialty,
          partySize: Math.floor(Math.random() * 40) + 10,
          eventDate: subDays(new Date(), Math.floor(Math.random() * 180)),
          isPublic: true,
          isFeatured: i === 0 && profile.experience > 12,
          sortOrder: i,
          viewCount: Math.floor(Math.random() * 500) + 50,
          likeCount: Math.floor(Math.random() * 100) + 10,
        },
      })
    }

    console.log(`✅ Created chef: ${profile.firstName} ${profile.lastName} (${profile.specialty})`)
  }

  // Create sample customers for bookings
  const customers = []
  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash('customer123', 12)
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password,
        firstName: `Customer${i}`,
        lastName: 'Test',
        role: UserRole.CUSTOMER,
        phone: `+234${Math.floor(Math.random() * 1000000000)}`,
        phoneVerified: true,
        emailVerified: true,
        city: nigerianCities[i % nigerianCities.length].city,
        state: nigerianCities[i % nigerianCities.length].state,
        country: 'NG',
        preferredLanguage: 'en',
        timezone: 'Africa/Lagos',
      },
    })
    customers.push(customer)
  }

  console.log(`✅ Created ${customers.length} sample customers`)

  // Create sample bookings
  const eventTypes = [ChefEventType.BIRTHDAY_PARTY, ChefEventType.WEDDING, ChefEventType.CORPORATE_EVENT, ChefEventType.PRIVATE_DINING, ChefEventType.COOKING_CLASS]
  const statuses = [ChefBookingStatus.COMPLETED, ChefBookingStatus.CONFIRMED, ChefBookingStatus.PENDING, ChefBookingStatus.ACCEPTED]
  
  let bookingCount = 0
  for (const { chef } of chefs.slice(0, 15)) {
    // Create 2-5 bookings per chef
    const numBookings = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < numBookings; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const eventDate = status === ChefBookingStatus.COMPLETED ? subDays(new Date(), Math.floor(Math.random() * 60) + 1) : addDays(new Date(), Math.floor(Math.random() * 60) + 5)
      const partySize = Math.floor(Math.random() * 30) + 5
      const durationHours = Math.floor(Math.random() * 4) + 3
      const basePrice = Number(chef.hourlyRate) * durationHours
      const platformFee = basePrice * 0.12
      const totalAmount = basePrice + platformFee

      const booking = await prisma.chefBooking.create({
        data: {
          bookingNumber: `CHF${Date.now()}${Math.floor(Math.random() * 1000)}`,
          customerId: customer.id,
          chefId: chef.id,
          eventType,
          serviceType: ChefServiceType.ON_SITE_COOKING,
          eventDate,
          startTime: '18:00',
          endTime: `${18 + durationHours}:00`,
          durationHours,
          partySize,
          eventAddress: `${Math.floor(Math.random() * 100)} Sample Street`,
          eventCity: chef.city,
          eventState: chef.state,
          eventCountry: 'NG',
          cuisinePreference: chef.specialties.slice(0, 2),
          menuDetails: `Customized ${eventType} menu featuring ${chef.specialties[0]}`,
          dietaryRestrictions: [],
          allergies: [],
          equipmentProvided: Math.random() > 0.5,
          equipmentNeeded: [],
          servingStyle: ['buffet', 'plated', 'family-style'][Math.floor(Math.random() * 3)],
          basePrice,
          travelFee: 0,
          equipmentFee: 0,
          subtotal: basePrice,
          platformFee,
          totalAmount,
          currency: 'NGN',
          depositAmount: totalAmount * 0.3,
          depositPaid: status !== ChefBookingStatus.PENDING,
          depositPaidAt: status !== ChefBookingStatus.PENDING ? subDays(eventDate, 7) : null,
          remainingAmount: totalAmount * 0.7,
          fullPayment: status === ChefBookingStatus.COMPLETED,
          fullPaymentAt: status === ChefBookingStatus.COMPLETED ? eventDate : null,
          status,
          requestedAt: subDays(eventDate, 14),
          respondedAt: status !== ChefBookingStatus.PENDING ? subDays(eventDate, 13) : null,
          confirmedAt: [ChefBookingStatus.CONFIRMED, ChefBookingStatus.COMPLETED].includes(status) ? subDays(eventDate, 12) : null,
          completedAt: status === ChefBookingStatus.COMPLETED ? eventDate : null,
          source: 'web',
        },
      })

      // Create rating for completed bookings
      if (status === ChefBookingStatus.COMPLETED && Math.random() > 0.3) {
        const overallRating = Math.floor(Math.random() * 2) + 4 // 4-5 stars
        await prisma.chefRating.create({
          data: {
            bookingId: booking.id,
            customerId: customer.id,
            chefId: chef.id,
            overallRating,
            foodQualityRating: overallRating,
            professionalismRating: overallRating,
            punctualityRating: Math.floor(Math.random() * 2) + 4,
            communicationRating: overallRating,
            valueRating: overallRating,
            comment: `Amazing experience! Chef ${chef.businessName} created an unforgettable dining experience for our ${eventType.toLowerCase().replace('_', ' ')}. Highly recommended!`,
            images: [],
            experienceHighlights: ['Professional', 'Delicious', 'Punctual', 'Creative'],
            isVerified: true,
            isPublic: true,
            wouldRecommend: true,
            wouldBookAgain: true,
          },
        })
      }

      bookingCount++
    }
  }

  console.log(`✅ Created ${bookingCount} sample chef bookings`)
  console.log('✨ Chef warehouse seeding completed!')
}

async function main() {
  try {
    await seedChefs()
  } catch (error) {
    console.error('❌ Error seeding chef data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
