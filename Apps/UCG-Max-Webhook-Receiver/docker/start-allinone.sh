#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if pg_isready -h localhost -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting for PostgreSQL... ($i/30)"
    sleep 1
done

# Create database and user if they don't exist
echo "Setting up database..."
su - postgres -c "psql -c \"CREATE USER ucgmax WITH PASSWORD 'changeme';\" || true"
su - postgres -c "psql -c \"CREATE DATABASE ucgmax OWNER ucgmax;\" || true"
su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE ucgmax TO ucgmax;\" || true"

# Wait a moment for database to be fully ready
sleep 2

# Run database migrations
echo "Running database migrations..."
cd /app
alembic upgrade head || echo "Migrations completed or already up to date"

# Start the application
echo "Starting UCG Max Webhook Receiver..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
