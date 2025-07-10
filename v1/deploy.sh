#!/bin/bash

# Pajama Party Platform Deployment Script
# Usage: ./deploy.sh [port]

set -e

PORT=${1:-3000}
echo "🚀 Deploying Pajama Party Platform on port $PORT"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create data directory if it doesn't exist
mkdir -p data

# Set up environment variables
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "✏️  Please edit .env file with your settings:"
    echo "   - Add your Mapbox access token"
    echo "   - Set your Discord invite URL"
    echo "   - Configure other settings as needed"
    echo ""
    echo "Press Enter to continue after editing .env file..."
    read
fi

# Set the port in environment
sed -i "s/PORT=.*/PORT=$PORT/" .env

# Run database cleanup
echo "🧹 Cleaning up database..."
node scripts/cleanup-db.js

# Add some demo data if database is empty
echo "🎭 Adding demo data..."
node scripts/add-demo-data.js

# Start the application
echo "🎉 Starting Pajama Party Platform..."
echo "📍 Platform will be available at:"
echo "   - Local: http://localhost:$PORT"
echo "   - Network: http://$(hostname -I | awk '{print $1}'):$PORT"
echo ""
echo "🌙 Where would you like to wake up tomorrow?"
echo ""

# Start with PM2 if available, otherwise use npm start
if command -v pm2 &> /dev/null; then
    echo "🔄 Starting with PM2..."
    pm2 start backend/server.js --name pajama-party-platform
    pm2 save
    echo "✅ Application started with PM2"
    echo "📊 Use 'pm2 status' to check status"
    echo "🛑 Use 'pm2 stop pajama-party-platform' to stop"
else
    echo "▶️  Starting with npm..."
    npm start
fi