// Set environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing'
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/restaurant_booking_test'
process.env.REDIS_URL = 'redis://localhost:6380/1'

// External API test keys (these should be test/sandbox keys)
process.env.STRIPE_SECRET_KEY = 'sk_test_test-stripe-secret-key'
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_test-stripe-publishable-key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test-webhook-secret'

process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps-api-key'
process.env.YELP_API_KEY = 'test-yelp-api-key'
process.env.WEATHER_API_KEY = 'test-weather-api-key'

process.env.TWILIO_ACCOUNT_SID = 'test-twilio-account-sid'
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-auth-token'
process.env.TWILIO_PHONE_NUMBER = '+1234567890'
process.env.TWILIO_WHATSAPP_NUMBER = '+1234567890'

process.env.SENDGRID_API_KEY = 'test-sendgrid-api-key'
process.env.SENDGRID_FROM_EMAIL = 'test@example.com'
process.env.SENDGRID_FROM_NAME = 'Restaurant Booking Test'

// Logging configuration for tests
process.env.LOG_LEVEL = 'error'

// Disable telemetry in tests
process.env.NEXT_TELEMETRY_DISABLED = '1'

// Test-specific configurations
process.env.DISABLE_NOTIFICATIONS = 'true'
process.env.DISABLE_EXTERNAL_APIS = 'true'
process.env.MOCK_PAYMENTS = 'true'
