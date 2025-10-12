# AWS Two-Way SMS - Dockerfile
FROM node:20-alpine

# Set version
ARG VERSION=1.0.2
ENV APP_VERSION=${VERSION}

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ curl

# Create app user and group (let Alpine assign UID automatically)
RUN addgroup -S appuser && \
    adduser -S -G appuser appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# Copy application files
COPY --chown=appuser:appuser . .

# Create data directory
RUN mkdir -p /data && \
    chown -R appuser:appuser /data

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start application
CMD ["node", "server.js"]
