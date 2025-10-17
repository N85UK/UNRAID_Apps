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

# Get database password from environment or use default
DB_PASSWORD=${DB_PASSWORD:-changeme}

# Create database and user if they don't exist
echo "Setting up database..."
export PGPASSWORD=postgres
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = 'ucgmax'" | grep -q 1 || \
    psql -h localhost -U postgres -c "CREATE USER ucgmax WITH PASSWORD '$DB_PASSWORD';"

psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ucgmax'" | grep -q 1 || \
    psql -h localhost -U postgres -c "CREATE DATABASE ucgmax OWNER ucgmax;"

psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ucgmax TO ucgmax;"

# Update DATABASE_URL with actual password
export DATABASE_URL="postgresql://ucgmax:${DB_PASSWORD}@localhost/ucgmax"

# Wait a moment for database to be fully ready
sleep 2

# Run database migrations
echo "Running database migrations..."
cd /app
alembic upgrade head || echo "Migrations completed or already up to date"

# Start the application
echo "Starting UCG Max Webhook Receiver..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
