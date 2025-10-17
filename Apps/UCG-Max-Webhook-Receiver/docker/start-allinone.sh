#!/bin/bash
set -e

echo "=== UCG Max Webhook Receiver Startup ==="
echo "Waiting for PostgreSQL to be ready..."

# Wait for PostgreSQL to be ready
for i in {1..60}; do
    if pg_isready -h localhost -U postgres > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "ERROR: PostgreSQL failed to start after 60 seconds"
        exit 1
    fi
    echo "Waiting for PostgreSQL... ($i/60)"
    sleep 1
done

# Get database password from environment or use default
DB_PASSWORD=${DB_PASSWORD:-changeme}
echo "Setting up database with user 'ucgmax'..."

# Create database and user if they don't exist
export PGPASSWORD=postgres

# Check and create user
if psql -h localhost -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = 'ucgmax'" | grep -q 1; then
    echo "User 'ucgmax' already exists"
else
    echo "Creating user 'ucgmax'..."
    psql -h localhost -U postgres -c "CREATE USER ucgmax WITH PASSWORD '$DB_PASSWORD';"
fi

# Check and create database
if psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'ucgmax'" | grep -q 1; then
    echo "Database 'ucgmax' already exists"
else
    echo "Creating database 'ucgmax'..."
    psql -h localhost -U postgres -c "CREATE DATABASE ucgmax OWNER ucgmax;"
fi

echo "Granting privileges..."
psql -h localhost -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ucgmax TO ucgmax;"

# Update DATABASE_URL with actual password
export DATABASE_URL="postgresql://ucgmax:${DB_PASSWORD}@localhost/ucgmax"
echo "Database URL configured (password hidden)"

# Wait for database to be fully ready
sleep 3

# Run database migrations
echo "Running database migrations..."
cd /app
if alembic upgrade head; then
    echo "Migrations completed successfully"
else
    echo "Warning: Migration failed or not configured"
fi

# Start the application
echo "Starting UCG Max Webhook Receiver on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
