// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
  }),
}))

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    table: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    waitlistEntry: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    loyaltyTransaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userPreference: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    analyticsEvent: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    userSession: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    giftCard: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    menuCategory: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    menuItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    promotion: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    restaurantStaff: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    apiKey: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    systemConfig: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  })),
}))

// Mock external APIs
jest.mock('@/lib/external-apis', () => ({
  GoogleMapsService: {
    geocodeAddress: jest.fn(),
    searchNearbyRestaurants: jest.fn(),
    getPlaceDetails: jest.fn(),
    calculateDistance: jest.fn(),
  },
  YelpService: {
    searchRestaurants: jest.fn(),
    getBusinessDetails: jest.fn(),
    getBusinessReviews: jest.fn(),
  },
  StripeService: {
    createPaymentIntent: jest.fn(),
    createCustomer: jest.fn(),
    refundPayment: jest.fn(),
    createSetupIntent: jest.fn(),
    createSubscription: jest.fn(),
    handleWebhook: jest.fn(),
  },
  NotificationService: {
    sendSMS: jest.fn(),
    sendWhatsApp: jest.fn(),
    sendEmail: jest.fn(),
    sendBulkEmail: jest.fn(),
  },
  WeatherService: {
    getCurrentWeather: jest.fn(),
    getForecast: jest.fn(),
  },
  RecommendationService: {
    getRestaurantRecommendations: jest.fn(),
  },
  CacheService: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flush: jest.fn(),
    invalidatePattern: jest.fn(),
  },
  AnalyticsService: {
    trackEvent: jest.fn(),
    getAnalytics: jest.fn(),
  },
}))

// Mock authentication service
jest.mock('@/lib/auth', () => ({
  AuthService: {
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
    generateSecureToken: jest.fn(),
    generateTokens: jest.fn(),
    verifyToken: jest.fn(),
    createSession: jest.fn(),
    invalidateSession: jest.fn(),
    cleanupExpiredSessions: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    setupTwoFactor: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    verifyTwoFactorCode: jest.fn(),
    requestPasswordReset: jest.fn(),
    changePassword: jest.fn(),
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
  },
  RoleService: {
    hasPermission: jest.fn(),
    requirePermission: jest.fn(),
    filterByPermission: jest.fn(),
  },
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  loggers: {
    auth: {
      login: jest.fn(),
      loginFailed: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      passwordChange: jest.fn(),
      twoFactorEnabled: jest.fn(),
    },
    booking: {
      created: jest.fn(),
      confirmed: jest.fn(),
      cancelled: jest.fn(),
      noShow: jest.fn(),
      completed: jest.fn(),
    },
    payment: {
      initiated: jest.fn(),
      completed: jest.fn(),
      failed: jest.fn(),
      refunded: jest.fn(),
    },
    restaurant: {
      created: jest.fn(),
      updated: jest.fn(),
      verified: jest.fn(),
    },
    security: {
      suspiciousActivity: jest.fn(),
      rateLimitExceeded: jest.fn(),
      unauthorizedAccess: jest.fn(),
    },
    performance: {
      slowQuery: jest.fn(),
      cacheHit: jest.fn(),
      cacheMiss: jest.fn(),
    },
  },
  requestLogger: jest.fn(),
}))

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
    flushall: jest.fn(),
    disconnect: jest.fn(),
  }))
})

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    setupIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
    },
    subscriptions: {
      create: jest.fn(),
      retrieve: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }))
})

// Mock Twilio
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  }))
})

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  decode: jest.fn(),
}))

// Mock speakeasy
jest.mock('speakeasy', () => ({
  generateSecret: jest.fn(),
  totp: {
    verify: jest.fn(),
  },
}))

// Mock QRCode
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  addHours: jest.fn((date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000)),
  addMinutes: jest.fn((date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)),
  format: jest.fn((date, format) => date.toISOString()),
  parseISO: jest.fn((dateString) => new Date(dateString)),
  isAfter: jest.fn(),
  isBefore: jest.fn(),
  isEqual: jest.fn(),
  startOfDay: jest.fn(),
  endOfDay: jest.fn(),
}))

// Global test utilities
global.mockPrismaClient = () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    restaurant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    booking: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
    $connect: jest.fn(),
    $transaction: jest.fn(),
  }
  return mockPrisma
}

global.mockAuthUser = (overrides = {}) => ({
  userId: 'test-user-id',
  email: 'test@example.com',
  role: 'CUSTOMER',
  sessionId: 'test-session-id',
  ...overrides,
})

global.mockRequest = (overrides = {}) => ({
  json: jest.fn(),
  headers: {
    get: jest.fn(),
  },
  url: 'http://localhost:3000/api/test',
  ...overrides,
})

global.mockResponse = () => ({
  json: jest.fn(),
  status: jest.fn(),
})

// Console error suppression for tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Increase timeout for integration tests
jest.setTimeout(30000)
