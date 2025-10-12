#!/bin/bash

# Restaurant Booking System - Docker Development Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to setup environment file
setup_env() {
    if [ ! -f .env.local ]; then
        print_warning ".env.local not found. Creating from example..."
        cp .env.local.example .env.local
        print_warning "Please edit .env.local with your actual API keys and secrets."
    fi
}

# Function to build development images
build_dev() {
    print_status "Building development Docker images..."
    docker-compose -f docker-compose.yml build --no-cache
    print_success "Development images built successfully!"
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose up -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    until docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; do
        sleep 2
    done
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec app npx prisma db push
    docker-compose exec app npx prisma db seed
    
    print_success "Development environment is ready!"
    print_status "Application: http://localhost:3000"
    print_status "Database Admin: http://localhost:8080"
    print_status "Redis: localhost:6379"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to restart development environment
restart_dev() {
    print_status "Restarting development environment..."
    docker-compose restart
    print_success "Development environment restarted!"
}

# Function to view logs
logs_dev() {
    if [ -n "$1" ]; then
        docker-compose logs -f "$1"
    else
        docker-compose logs -f
    fi
}

# Function to run database commands
db_command() {
    case $1 in
        "reset")
            print_status "Resetting database..."
            docker-compose exec app npx prisma db push --force-reset
            docker-compose exec app npx prisma db seed
            print_success "Database reset complete!"
            ;;
        "migrate")
            print_status "Running database migrations..."
            docker-compose exec app npx prisma db push
            print_success "Database migrations complete!"
            ;;
        "seed")
            print_status "Seeding database..."
            docker-compose exec app npx prisma db seed
            print_success "Database seeding complete!"
            ;;
        "studio")
            print_status "Opening Prisma Studio..."
            docker-compose exec app npx prisma studio
            ;;
        *)
            print_error "Unknown database command: $1"
            echo "Available commands: reset, migrate, seed, studio"
            ;;
    esac
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup complete!"
}

# Function to show help
show_help() {
    echo "Restaurant Booking System - Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  setup      Setup environment file"
    echo "  build      Build development Docker images"
    echo "  start      Start development environment"
    echo "  stop       Stop development environment"
    echo "  restart    Restart development environment"
    echo "  logs       View logs (optionally specify service)"
    echo "  db         Database commands (reset|migrate|seed|studio)"
    echo "  cleanup    Clean up Docker resources"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs app"
    echo "  $0 db reset"
}

# Main script logic
case ${1:-help} in
    "setup")
        setup_env
        ;;
    "build")
        check_docker
        setup_env
        build_dev
        ;;
    "start")
        check_docker
        setup_env
        start_dev
        ;;
    "stop")
        check_docker
        stop_dev
        ;;
    "restart")
        check_docker
        restart_dev
        ;;
    "logs")
        check_docker
        logs_dev $2
        ;;
    "db")
        check_docker
        db_command $2
        ;;
    "cleanup")
        check_docker
        cleanup
        ;;
    "help"|*)
        show_help
        ;;
esac
