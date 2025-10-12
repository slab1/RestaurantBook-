#!/bin/bash

# Restaurant Booking System Setup Script
echo "🍽️  Setting up Restaurant Booking System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c 2-)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION is compatible"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual API keys and database URL"
    echo "   You can edit it with: nano .env"
else
    echo "✅ .env file already exists"
fi

# Check if DATABASE_URL is set
if grep -q "^DATABASE_URL=\"postgresql://username:password@localhost:5432/restaurant_booking\"$" .env 2>/dev/null; then
    echo "⚠️  Please update DATABASE_URL in .env with your actual PostgreSQL connection string"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with actual API keys and database URL"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run db:push' to create database tables"
echo "4. Run 'npm run db:seed' to add sample data"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "Happy coding! 🚀"
