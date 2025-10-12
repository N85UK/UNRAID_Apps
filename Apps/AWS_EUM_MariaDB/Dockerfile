# AWS End User Messaging MariaDB Edition - Docker Image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies (including curl for health checks)
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package.json ./

# Install Node.js dependencies
RUN npm install --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy application source
COPY . .

# Create non-root user for security
RUN addgroup -S appuser && \
    adduser -S -G appuser appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start application
CMD ["node", "server.js"]

# Metadata labels
LABEL maintainer="n85uk" \
      description="AWS End User Messaging with MariaDB - Enterprise Edition" \
      version="2.1.2"
