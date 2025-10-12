# Deployment Guide

This guide covers deployment options for the Restaurant Booking System.

## Prerequisites

- PostgreSQL database
- API keys for external services (see `.env.example`)
- Node.js 18+ runtime environment

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see Environment Variables section)
5. Deploy

### 3. Database Setup

Use a managed PostgreSQL service like:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [PlanetScale](https://planetscale.com)

## Docker Deployment

### 1. Build the Image

```bash
docker build -t restaurant-booking .
```

### 2. Run with Environment Variables

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e JWT_SECRET="your-jwt-secret" \
  -e STRIPE_SECRET_KEY="your-stripe-key" \
  restaurant-booking
```

### 3. Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/restaurant_booking
      - JWT_SECRET=your-jwt-secret
      - STRIPE_SECRET_KEY=your-stripe-key
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=restaurant_booking
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up -d
```

## AWS EC2 Deployment

### 1. Launch EC2 Instance

- Use Ubuntu 22.04 LTS
- Open ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Configure security groups

### 2. Setup Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone your repository
git clone YOUR_REPOSITORY_URL
cd restaurant-booking-system

# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "restaurant-booking" -- start
pm2 startup
pm2 save
```

### 3. Setup Nginx (Optional)

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/restaurant-booking
```

Nginx config:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/restaurant-booking /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables

Required environment variables for production:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"

# External APIs
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
YELP_API_KEY="your-yelp-api-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Twilio
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# SendGrid
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Weather API (optional)
WEATHER_API_KEY="your-weather-api-key"

# App URLs
NEXTAUTH_URL="https://yourdomain.com"
APP_URL="https://yourdomain.com"
```

## Post-Deployment Setup

### 1. Database Migration

```bash
npm run db:push
npm run db:seed  # Optional: adds sample data
```

### 2. Webhook Configuration

Configure Stripe webhook endpoint:
- URL: `https://yourdomain.com/api/payments/webhook`
- Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. SSL Certificate (Production)

For AWS/VPS deployments, use Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Monitoring and Maintenance

### Health Checks

The application provides health check endpoints:
- `/api/health` - Basic health check
- `/api/auth/me` - Authentication check

### Logging

- Application logs: Check PM2 logs with `pm2 logs`
- Database logs: Check PostgreSQL logs
- External API errors: Monitor API response rates

### Backup

Regular database backups are recommended:

```bash
# PostgreSQL backup
pg_dump DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure database exists

2. **External API Failures**
   - Verify API keys are correct
   - Check API rate limits
   - Review API documentation for changes

3. **Build Failures**
   - Ensure Node.js version compatibility
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

### Support

For deployment issues, check:
1. Application logs
2. Database connectivity
3. Environment variable configuration
4. External service status pages
