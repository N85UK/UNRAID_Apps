FROM node:20-alpine

# Small, secure Node runtime image for AWS_EUM_X
ENV NODE_ENV=production
WORKDIR /app

# Install CA certs and timezone data for HTTPS
RUN apk add --no-cache ca-certificates tzdata && update-ca-certificates || true

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

# Create non-root user and data directory
RUN addgroup -S appuser && adduser -S appuser -G appuser && \
    mkdir -p /app/data && chown -R appuser:appuser /app

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- --timeout=5 http://127.0.0.1:80/health || exit 1

CMD ["node", "server.js"]

LABEL org.opencontainers.image.title="AWS EUM X" \
      org.opencontainers.image.description="AWS End User Messaging - modern, secure, observable Unraid app" \
      org.opencontainers.image.vendor="N85UK"
