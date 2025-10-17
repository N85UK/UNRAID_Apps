#!/bin/sh
set -e

# UNRAID-compatible entrypoint with PUID/PGID support
# Handles volume permissions for appdata mounts

PUID=${PUID:-99}
PGID=${PGID:-100}

echo "Starting AWS_EUM_X with PUID=${PUID} PGID=${PGID}"

# Create appuser if it doesn't exist with specified UID/GID
if ! id -u appuser > /dev/null 2>&1; then
    echo "Creating appuser with UID=${PUID} GID=${PGID}"
    addgroup -g "${PGID}" appuser 2>/dev/null || true
    adduser -D -u "${PUID}" -G appuser appuser 2>/dev/null || true
fi

# Ensure data directory exists and has correct permissions
if [ ! -d /app/data ]; then
    mkdir -p /app/data
fi

# Fix permissions on data directory
echo "Setting permissions on /app/data"
chown -R "${PUID}:${PGID}" /app/data
chmod -R 755 /app/data

# Switch to appuser and run the application
echo "Starting application as appuser (${PUID}:${PGID})"
exec su-exec "${PUID}:${PGID}" node server.js
