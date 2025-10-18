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
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    # Simple TCP connection test - if we can connect, the database is likely ready
    if timeout 2 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null; then
        echo "Database port is accessible!"
        # Give it a moment for the database to fully initialize
        sleep 2
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo "ERROR: Cannot connect to database at $DB_HOST:$DB_PORT after $max_attempts attempts"
        echo "Please check:"
        echo "  - Database server is running at $DB_HOST:$DB_PORT"
        echo "  - Network connectivity to database server"
        echo "  - Firewall settings allow connection on port $DB_PORT"
        exit 1
    fi
    
    echo "Waiting for database... ($attempt/$max_attempts)"
    sleep 2
done

# Create database if it doesn't exist (for MariaDB/MySQL)
if [ "$DB_TYPE" = "mariadb" ] || [ "$DB_TYPE" = "mysql" ]; then
    echo "Checking if database '$DB_NAME' exists..."
    
    # Connect to server without specifying database and create if needed
    DB_EXISTS=$(python3 -c "
import pymysql
try:
    conn = pymysql.connect(
        host='$DB_HOST',
        port=$DB_PORT,
        user='$DB_USER',
        password='$DB_PASSWORD'
    )
    cursor = conn.cursor()
    cursor.execute('SHOW DATABASES LIKE \"$DB_NAME\"')
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    print('1' if result else '0')
except Exception as e:
    print(f'Error: {e}')
    exit(1)
" 2>&1)
    
    if [ "$DB_EXISTS" = "0" ]; then
        echo "Database '$DB_NAME' does not exist. Creating..."
        python3 -c "
import pymysql
try:
    conn = pymysql.connect(
        host='$DB_HOST',
        port=$DB_PORT,
        user='$DB_USER',
        password='$DB_PASSWORD'
    )
    cursor = conn.cursor()
    cursor.execute('CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    cursor.close()
    conn.close()
    print('Database created successfully')
except Exception as e:
    print(f'Error creating database: {e}')
    exit(1)
"
        if [ $? -ne 0 ]; then
            echo "ERROR: Failed to create database"
            exit 1
        fi
        echo "Database '$DB_NAME' created successfully!"
    else
        echo "Database '$DB_NAME' already exists."
    fi
elif [ "$DB_TYPE" = "postgresql" ] || [ "$DB_TYPE" = "postgres" ]; then
    echo "PostgreSQL database creation should be done manually or via initialization scripts."
fi

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
