# AWS End User Messaging v2.0 - Enhanced Docker Image
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install system dependencies (including curl for health checks)
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better layer caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy application source
COPY . .

# Create non-root user for security
RUN groupadd -r appuser && \
    useradd -r -g appuser -s /bin/bash appuser && \
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
LABEL maintainer="N85UK <hello@git.n85.uk>" \
      version="2.0.0" \
      description="AWS End User Messaging - Enhanced SMS application with UNRAID integration"
