FROM node:20-alpine

# Small, secure Node runtime image for AWS_EUM_X
ENV NODE_ENV=production
WORKDIR /app

# Install CA certs, timezone data, and su-exec for user switching
RUN apk add --no-cache ca-certificates tzdata su-exec && update-ca-certificates || true

# Copy only package files first for caching
COPY package.json package-lock.json* ./

# Install production dependencies: include build deps to compile native modules (better-sqlite3) then remove them
RUN apk add --no-cache --virtual .build-deps build-base python3 sqlite-dev && \
    if [ -f package-lock.json ]; then \
      npm ci --only=production --no-audit --no-fund; \
    else \
      npm install --only=production --no-audit --no-fund; \
    fi && \
    apk del .build-deps

# Copy application files
COPY . .

# Create data directory with open permissions for UNRAID volume mounts
RUN mkdir -p /app/data && chmod 777 /app/data && \
    chmod +x /app/entrypoint.sh

# Note: Running as root initially, entrypoint.sh will switch to PUID/PGID
# This is the UNRAID-standard approach for handling volume permissions

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- --timeout=5 http://127.0.0.1:8080/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["node", "server.js"]

LABEL org.opencontainers.image.title="AWS EUM X" \
      org.opencontainers.image.description="AWS End User Messaging - modern, secure, observable Unraid app" \
      org.opencontainers.image.vendor="N85UK"
