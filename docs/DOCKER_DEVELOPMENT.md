# Docker Development Setup

This guide explains how to set up and use Docker for developing the Restaurant Booking System.

## Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)
- **Git** for version control

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd restaurant-booking-system

# Setup environment variables
npm run docker:setup
# Edit .env.local with your actual API keys
```

### 2. Start Development Environment

```bash
# Build and start all services
npm run docker:build
npm run docker:start
```

### 3. Access Services

- **Application**: http://localhost:3000
- **Database Admin (Adminer)**: http://localhost:8080
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Available Commands

### Environment Management

```bash
# Setup environment file from template
npm run docker:setup

# Build development images
npm run docker:build

# Start all services
npm run docker:start

# Stop all services
npm run docker:stop

# Restart all services
npm run docker:restart

# View logs (all services)
npm run docker:logs

# View logs for specific service
npm run docker:logs -- app
npm run docker:logs -- db
```

### Database Management

```bash
# Reset database (drops all data and recreates)
npm run docker:db:reset

# Run database migrations
npm run docker:db:migrate

# Seed database with sample data
npm run docker:db:seed

# Open Prisma Studio
npm run docker:db:studio
```

### Cleanup

```bash
# Stop containers and remove volumes
npm run docker:cleanup
```

## Services Overview

### Application (app)
- **Container**: `restaurant-booking-app`
- **Port**: 3000
- **Features**: Hot reloading, Node.js debugging (port 9229)
- **Volumes**: Source code mounted for live updates

### Database (db)
- **Container**: `restaurant-booking-db`
- **Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Data**: Persistent volume storage

### Redis (redis)
- **Container**: `restaurant-booking-redis`
- **Image**: Redis 7 Alpine
- **Port**: 6379
- **Usage**: Caching, session storage

### Database Admin (adminer)
- **Container**: `restaurant-booking-adminer`
- **Port**: 8080
- **Usage**: Web-based database management

## Development Workflow

### 1. Code Changes
- All code changes are automatically reflected due to volume mounting
- Next.js hot reloading works seamlessly
- No need to rebuild containers for code changes

### 2. Dependency Changes
If you modify `package.json`:
```bash
npm run docker:build
npm run docker:restart
```

### 3. Database Schema Changes
```bash
# After modifying prisma/schema.prisma
npm run docker:db:migrate
```

### 4. Environment Variables
After changing `.env.local`:
```bash
npm run docker:restart
```

## Debugging

### Application Debugging
- Node.js debugger available on port 9229
- Use VS Code or your preferred debugger
- Attach to `localhost:9229`

### Database Access
```bash
# Connect via adminer (web interface)
# Go to http://localhost:8080
# Server: db
# Username: postgres
# Password: postgres
# Database: restaurant_booking_dev

# Or use command line
docker-compose exec db psql -U postgres -d restaurant_booking_dev
```

### Redis Access
```bash
# Connect to Redis CLI
docker-compose exec redis redis-cli
```

### Container Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs db
docker-compose logs redis

# Follow logs in real-time
docker-compose logs -f app
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Connection Issues
```bash
# Restart database service
docker-compose restart db

# Check database health
docker-compose exec db pg_isready -U postgres
```

### Permission Issues
```bash
# Reset file permissions (Linux/macOS)
sudo chown -R $USER:$USER .

# Or run with sudo if necessary
sudo docker-compose up
```

### Cache Issues
```bash
# Clear Docker build cache
docker system prune -f

# Rebuild without cache
docker-compose build --no-cache
```

## Production vs Development

### Development Features
- Hot reloading enabled
- Debug ports exposed
- Development environment variables
- Source code mounted as volumes
- Adminer included for database management

### Production Differences
- Optimized multi-stage build
- No debug ports
- Production environment variables
- No source code volumes
- Security-focused configuration

## Environment Variables

The development setup uses these key environment variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@db:5432/restaurant_booking_dev"

# Redis
REDIS_URL="redis://redis:6379"

# Development flags
NODE_ENV="development"
DEBUG="1"
NEXT_TELEMETRY_DISABLED="1"
```

See `.env.local.example` for the complete list of required variables.

## Tips for Development

1. **Use Volume Mounts**: Source code changes are immediately reflected
2. **Database Persistence**: Data persists between container restarts
3. **Service Dependencies**: Services start in the correct order
4. **Health Checks**: Database health is monitored
5. **Networking**: All services can communicate using service names

## Troubleshooting

### Cannot Connect to Database
1. Check if database container is running: `docker-compose ps`
2. Verify database health: `docker-compose exec db pg_isready -U postgres`
3. Check logs: `docker-compose logs db`

### Hot Reloading Not Working
1. Ensure volumes are correctly mounted
2. Check if files are being watched: `docker-compose logs app`
3. Restart the app service: `docker-compose restart app`

### Out of Disk Space
1. Clean up Docker resources: `npm run docker:cleanup`
2. Remove unused images: `docker image prune -f`
3. Remove unused volumes: `docker volume prune -f`
