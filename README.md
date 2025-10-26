# 🍽️ Restaurant Booking System - Enhanced Edition

[![CI/CD Pipeline](https://github.com/your-repo/restaurant-booking-system/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/your-repo/restaurant-booking-system/actions)
[![Coverage](https://codecov.io/gh/your-repo/restaurant-booking-system/branch/main/graph/badge.svg)](https://codecov.io/gh/your-repo/restaurant-booking-system)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A comprehensive, production-ready restaurant booking platform built with modern technologies and enterprise-grade features.

## ✨ Features

### 🎯 Core Functionality
- **Multi-Role System**: Customer, Restaurant Owner, Admin, and Staff roles
- **Advanced Booking Management**: Recurring bookings, special events, and party size management
- **Real-Time Updates**: Live notifications and booking status updates
- **Intelligent Search**: AI-powered restaurant discovery with personalized recommendations
- **Waitlist Management**: Automated queue management with position tracking
- **Payment Processing**: Secure Stripe integration with tips and refunds

### 🚀 Advanced Features
- **Loyalty Program**: Points-based rewards system with transaction history
- **Analytics Dashboard**: Comprehensive business intelligence and reporting
- **Two-Factor Authentication**: Enhanced security with TOTP support
- **Multi-Channel Notifications**: Email, SMS, and push notifications
- **Review System**: Multi-dimensional ratings with restaurant responses
- **Menu Management**: Complete digital menu system

### 🔧 Technical Excellence
- **Redis Caching**: Advanced caching strategies for optimal performance
- **Socket.IO Integration**: Real-time communication and live updates
- **Comprehensive Testing**: Unit, integration, and E2E testing
- **CI/CD Pipeline**: Automated testing, security scanning, and deployment
- **Docker Environment**: Complete containerized development setup
- **API Security**: Rate limiting, authentication, and data protection

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand + React Query
- **Real-time**: Socket.IO Client
- **Charts**: Chart.js
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT + 2FA
- **Payments**: Stripe
- **File Storage**: Multer

### External Services
- **Maps**: Google Maps API
- **Reviews**: Yelp API
- **SMS**: Twilio
- **Email**: SendGrid
- **Weather**: Weather API

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Playwright + Cypress
- **Monitoring**: Winston Logging
- **Security**: Helmet + CORS + Rate Limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/restaurant-booking-system.git
cd restaurant-booking-system
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Docker Development (Recommended)
```bash
# Start all services
npm run docker:setup
npm run docker:start

# The application will be available at:
# - App: http://localhost:3000
# - Database Admin: http://localhost:8080
# - Redis: localhost:6379
```

### 4. Manual Setup (Alternative)
```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
📦 restaurant-booking-system/
├── 📁 app/                    # Next.js App Router
│   ├── 📁 api/               # API Routes
│   │   ├── 📁 auth/          # Authentication
│   │   ├── 📁 bookings/      # Booking management
│   │   ├── 📁 search/        # Search & recommendations
│   │   ├── 📁 waitlist/      # Waitlist management
│   │   ├── 📁 analytics/     # Business analytics
│   │   └── 📁 payments/      # Payment processing
│   ├── 📁 login/             # Auth pages
│   └── 📁 restaurants/       # Restaurant pages
├── 📁 components/            # React Components
│   ├── 📁 dashboard/         # Analytics dashboard
│   ├── 📁 realtime/          # Real-time components
│   ├── 📁 restaurant/        # Restaurant components
│   └── 📁 ui/                # Reusable UI components
├── 📁 lib/                   # Core Libraries
│   ├── 📄 redis.ts          # Caching service
│   ├── 📄 socket.ts         # Real-time communication
│   ├── 📄 notifications.ts  # Notification system
│   ├── 📄 recommendation.ts # AI recommendations
│   └── 📄 middleware.ts     # API middleware
├── 📁 hooks/                 # Custom React Hooks
├── 📁 prisma/                # Database
│   ├── 📄 schema.prisma     # Database schema
│   └── 📄 seed.ts           # Sample data
├── 📁 __tests__/             # Test Suite
├── 📁 .github/workflows/     # CI/CD Pipeline
├── 📄 docker-compose.yml    # Docker services
└── 📁 docs/                  # Documentation
```

## 🧪 Testing

### Run Test Suite
```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Coverage
We maintain >80% test coverage across:
- API endpoints
- Service layer
- Database operations
- Real-time features
- Authentication flows

## 📊 API Documentation

Comprehensive API documentation is available:
- **Local**: http://localhost:3000/api/docs (when running)
- **Documentation**: [API Reference](docs/API_REFERENCE.md)
- **Postman Collection**: Available in `/docs/postman/`

### Quick API Examples

```javascript
// Search restaurants
GET /api/search/enhanced?q=pizza&location=NYC

// Create booking
POST /api/bookings/enhanced
{
  "restaurantId": "rest_123",
  "tableId": "table_456",
  "bookingTime": "2024-01-15T19:00:00Z",
  "partySize": 4
}

// Join waitlist
POST /api/waitlist
{
  "restaurantId": "rest_123",
  "partySize": 2,
  "preferredTime": "2024-01-15T19:00:00Z"
}
```

## 🎯 Key Features Deep Dive

### Real-Time Updates
```javascript
// Connect to real-time updates
const socket = useSocket();

// Listen for booking updates
socket.on('booking:status_updated', (data) => {
  console.log('Booking updated:', data);
});

// Listen for waitlist notifications
socket.on('waitlist:table_available', (data) => {
  console.log('Table available:', data);
});
```

### Advanced Analytics
```javascript
// Get dashboard analytics
const analytics = await fetch('/api/analytics/dashboard?period=30d&comparison=true');

// Response includes:
// - Revenue metrics
// - Booking analytics
// - Customer insights
// - Table utilization
// - Comparison data
```

### Loyalty Program
```javascript
// Use loyalty points in booking
POST /api/bookings/enhanced
{
  "restaurantId": "rest_123",
  "loyaltyPointsToUse": 50,
  // ... other booking data
}

// Points are automatically:
// - Deducted on booking
// - Earned on completion
// - Tracked in transaction history
```

## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Two-factor authentication (TOTP)
- Role-based access control (RBAC)
- Session management with Redis
- Password hashing with bcrypt

### API Security
- Rate limiting per endpoint
- CORS configuration
- Security headers (Helmet)
- Input validation with Zod
- SQL injection prevention
- XSS protection

## 🚀 Deployment

### Docker Production
```bash
# Build production image
docker build -t restaurant-booking-system .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Configure these essential environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Authentication
JWT_SECRET="your-secret-key"

# External Services
STRIPE_SECRET_KEY="sk_live_..."
GOOGLE_MAPS_API_KEY="your-key"
TWILIO_ACCOUNT_SID="your-sid"
SENDGRID_API_KEY="your-key"

# Cache
REDIS_HOST="redis-host"
REDIS_PORT="6379"
```

### CI/CD Pipeline
Automated deployment pipeline includes:
1. **Testing**: Unit, integration, and E2E tests
2. **Security**: Vulnerability scanning and code analysis
3. **Building**: Docker image creation
4. **Deployment**: Automated staging and production deployment

## 📈 Performance Optimizations

### Caching Strategy
- **Redis Caching**: Restaurant data, search results, user sessions
- **Database Optimization**: Proper indexing and query optimization
- **API Response Caching**: Intelligent cache invalidation
- **Static Assets**: Next.js optimization features

### Monitoring
```bash
# View application logs
npm run docker:logs

# Monitor Redis performance
redis-cli --latency

# Database performance
npx prisma studio
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional Commits for commit messages
- Comprehensive test coverage

## 📋 Roadmap

### Phase 1 ✅ (Completed)
- Core booking functionality
- User authentication
- Restaurant management
- Basic payment processing

### Phase 2 ✅ (Completed)
- Real-time features
- Analytics dashboard
- Loyalty program
- Waitlist management
- Advanced search

### Phase 3 🚧 (In Progress)
- Mobile applications
- Advanced AI recommendations
- POS system integration
- Multi-language support

### Phase 4 📋 (Planned)
- Voice ordering integration
- AR menu visualization
- Blockchain loyalty tokens
- IoT table sensors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Reference](docs/API_REFERENCE.md)
- [Docker Development Guide](docs/DOCKER_DEVELOPMENT.md)
- [Implementation Summary](docs/IMPLEMENTATION_SUMMARY.md)

### Getting Help
- 📧 Email: support@restaurant-booking.com
- 💬 Discord: [Join our community](https://discord.gg/restaurant-booking)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/restaurant-booking-system/issues)
- 📖 Wiki: [Project Wiki](https://github.com/your-repo/restaurant-booking-system/wiki)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database toolkit
- [Stripe](https://stripe.com/) - Payment processing
- [Socket.IO](https://socket.io/) - Real-time communication
- [Radix UI](https://www.radix-ui.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

**Built with ❤️ by MiniMax Agent**

*Ready to revolutionize restaurant booking? Get started today!*

[![Deploy with Docker](https://img.shields.io/badge/Deploy%20with-Docker-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![Run on Local](https://img.shields.io/badge/Run%20on-Local-green?logo=node.js&logoColor=white)](#quick-start)
[![View Demo](https://img.shields.io/badge/View-Demo-blue?logo=vercel&logoColor=white)](https://restaurant-booking-demo.vercel.app)
