#!/bin/bash
set -e

echo "=== UCG Max Webhook Receiver Startup ==="

# Build DATABASE_URL from environment variables if not already set
if [ -z "$DATABASE_URL" ]; then
    DB_TYPE=${DB_TYPE:-postgresql}
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5432}
    DB_NAME=${DB_NAME:-ucgmax}
    DB_USER=${DB_USER:-ucgmax}
    DB_PASSWORD=${DB_PASSWORD:-changeme}
    
    # Determine the driver based on DB_TYPE
    case "$DB_TYPE" in
        mariadb|mysql)
            DRIVER="mysql+pymysql"
            DB_PORT=${DB_PORT:-3306}
            ;;
        postgresql|postgres)
            DRIVER="postgresql"
            DB_PORT=${DB_PORT:-5432}
            ;;
        *)
            echo "ERROR: Unsupported DB_TYPE: $DB_TYPE"
            echo "Supported types: mariadb, mysql, postgresql"
            exit 1
            ;;
    esac
    
    export DATABASE_URL="${DRIVER}://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
    echo "Database URL configured for $DB_TYPE at $DB_HOST:$DB_PORT/$DB_NAME"
fi

# Wait for database to be ready
echo "Waiting for database to be ready..."
max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if python -c "from sqlalchemy import create_engine; engine = create_engine('$DATABASE_URL'); engine.connect()" 2>/dev/null; then
        echo "Database is ready!"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "ERROR: Database failed to become ready after $max_attempts seconds"
        echo "Please check:"
        echo "  - Database server is running"
        echo "  - Database credentials are correct"
        echo "  - Database name exists"
        echo "  - Network connectivity to database"
        exit 1
    fi
    
    echo "Waiting for database... ($attempt/$max_attempts)"
    sleep 1
done

# Run database migrations
echo "Running database migrations..."
cd /app
if alembic upgrade head; then
    echo "Migrations completed successfully"
else
    echo "ERROR: Migration failed"
    exit 1
fi

# Start the application
echo "Starting UCG Max Webhook Receiver on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
