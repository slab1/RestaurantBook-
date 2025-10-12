# Restaurant Booking System

A comprehensive restaurant booking platform built with Next.js, featuring table reservations, payment processing, and multi-user management.

## Features

### Core Functionality
- **Restaurant Discovery**: Browse restaurants with advanced search and filtering
- **Table Booking**: Real-time availability and instant reservations
- **User Management**: Customer, restaurant owner, and admin roles
- **Payment Processing**: Secure payments and deposits via Stripe
- **Notifications**: SMS and email confirmations via Twilio and SendGrid

### External API Integrations
- **Google Maps API**: Restaurant geolocation and mapping
- **Yelp API**: Restaurant data enrichment and reviews
- **Stripe API**: Payment processing and refunds
- **Twilio API**: SMS notifications
- **SendGrid API**: Email notifications
- **Weather API**: Location-based weather information

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS with ShadCN UI components
- **Language**: TypeScript
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **API Routes**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Next.js built-in image optimization

### External Services
- **Payment**: Stripe
- **SMS**: Twilio
- **Email**: SendGrid
- **Maps**: Google Maps API
- **Restaurant Data**: Yelp API
- **Weather**: OpenWeather API

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys for external services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-booking-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables (see Environment Variables section)

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_booking"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
YELP_API_KEY="your-yelp-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourrestaurant.com"

# Weather API (optional)
WEATHER_API_KEY="your-weather-api-key"

# App URLs
NEXTAUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - List restaurants with search/filter
- `POST /api/restaurants` - Create restaurant (owner/admin)
- `GET /api/restaurants/[id]` - Get restaurant details
- `PUT /api/restaurants/[id]` - Update restaurant (owner/admin)
- `DELETE /api/restaurants/[id]` - Delete restaurant (owner/admin)

### Tables
- `GET /api/restaurants/[id]/tables` - Get restaurant tables
- `POST /api/restaurants/[id]/tables` - Create table (owner/admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PUT /api/bookings/[id]` - Update booking status
- `DELETE /api/bookings/[id]` - Cancel booking

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent

## Database Schema

The system uses the following main entities:

- **Users**: Customer, restaurant owner, and admin accounts
- **Restaurants**: Restaurant information and settings
- **Tables**: Restaurant table management
- **Bookings**: Reservation management
- **Payments**: Payment tracking
- **Reviews**: Customer reviews and ratings
- **OperatingHours**: Restaurant operating schedules

## User Roles

### Customer
- Browse and search restaurants
- Make and manage bookings
- Leave reviews and ratings
- Process payments

### Restaurant Owner
- Manage restaurant information
- Manage tables and availability
- View and manage bookings
- Access analytics dashboard

### Admin
- Full system access
- User management
- Restaurant approval and management
- System analytics and reporting

## Sample Data

The seed script creates sample users:

- **Admin**: admin@restaurant.com / admin123
- **Restaurant Owner**: owner@restaurant.com / owner123
- **Customer**: customer@example.com / customer123

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with sample data

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build image
docker build -t restaurant-booking .

# Run container
docker run -p 3000:3000 --env-file .env restaurant-booking
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ by MiniMax Agent**