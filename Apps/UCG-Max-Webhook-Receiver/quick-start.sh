#!/bin/bash
# Quick Start Script for UCG Max Webhook Receiver
# This script helps you quickly deploy the application with Docker Compose

set -e

echo "🚀 UCG Max Webhook Receiver - Quick Start"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Generate secure keys if not provided
echo "🔐 Generating secure keys..."
SECRET_KEY=$(openssl rand -hex 32)
HMAC_SECRET=$(openssl rand -hex 32)
BEARER_TOKEN=$(openssl rand -hex 32)

echo ""
echo "✅ Generated Keys (save these securely!):"
echo "   SECRET_KEY: $SECRET_KEY"
echo "   HMAC_SECRET: $HMAC_SECRET"
echo "   BEARER_TOKEN: $BEARER_TOKEN"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://ucgmax:changeme123@db:5432/ucgmax
POSTGRES_DB=ucgmax
POSTGRES_USER=ucgmax
POSTGRES_PASSWORD=changeme123

# Security Keys (CHANGE THESE!)
SECRET_KEY=$SECRET_KEY
HMAC_SECRET=$HMAC_SECRET
BEARER_TOKEN=$BEARER_TOKEN

# Admin Credentials (CHANGE THESE!)
ADMIN_USER=admin
ADMIN_PASSWORD=changeme

# Application Settings
ALERT_RETENTION_DAYS=30
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
LOG_LEVEL=INFO
EOF
    echo "✅ Created .env file with generated keys"
else
    echo "ℹ️  .env file already exists, skipping creation"
fi

# Start services
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "✅ Services started successfully!"
    echo ""
    echo "📊 Access the application:"
    echo "   Web UI: http://localhost:8000"
    echo "   PGAdmin: http://localhost:5050"
    echo ""
    echo "🔐 Default Credentials:"
    echo "   Username: admin"
    echo "   Password: changeme (CHANGE THIS IMMEDIATELY!)"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Access the web UI and change the admin password"
    echo "   2. Configure UCG Max to send webhooks to: http://YOUR-IP:8000/webhook/ucgmax"
    echo "   3. Add the HMAC secret to your UCG Max webhook configuration"
    echo "   4. Test the webhook with the example in README.md"
    echo ""
    echo "📚 Documentation:"
    echo "   Installation Guide: INSTALL.md"
    echo "   API Documentation: API.md"
    echo "   README: README.md"
    echo ""
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi
