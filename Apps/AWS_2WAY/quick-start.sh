#!/bin/bash

# AWS Two-Way SMS - Quick Start Script
# This script sets up the application quickly for testing

set -e

echo "╔═══════════════════════════════════════════════╗"
echo "║   AWS Two-Way SMS - Quick Start               ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "📝 Please edit .env with your AWS credentials:"
    echo "   nano .env"
    echo ""
    echo "Then run this script again."
    exit 0
fi

# Source .env
set -a
source .env
set +a

# Check for required variables
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ "$AWS_ACCESS_KEY_ID" = "your_access_key_here" ]; then
    echo "❌ AWS_ACCESS_KEY_ID not configured in .env"
    echo "   Please edit .env with your AWS credentials"
    exit 1
fi

if [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ "$AWS_SECRET_ACCESS_KEY" = "your_secret_key_here" ]; then
    echo "❌ AWS_SECRET_ACCESS_KEY not configured in .env"
    echo "   Please edit .env with your AWS credentials"
    exit 1
fi

echo "✅ Environment configuration valid"
echo ""

# Check if npm modules are installed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Create data directory
if [ ! -d data ]; then
    echo "📁 Creating data directory..."
    mkdir -p data
    echo "✅ Data directory created"
    echo ""
fi

# Initialize database
echo "🗄️  Initializing database..."
node scripts/init-database.js
echo ""

# Ask to start server
echo "🚀 Ready to start the application!"
echo ""
read -p "Start server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting AWS Two-Way SMS..."
    echo ""
    npm start
else
    echo ""
    echo "To start manually, run:"
    echo "  npm start"
    echo ""
    echo "Or with Docker:"
    echo "  docker-compose up -d"
    echo ""
fi
