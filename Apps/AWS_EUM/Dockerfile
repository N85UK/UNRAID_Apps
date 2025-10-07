# AWS End User Messaging v2.0 - Enhanced Docker Image
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /app

# Install security updates and clean up
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application source
COPY . .

# Create non-root user for security
RUN groupadd -r appuser && \
    useradd -r -g appuser -d /app -s /bin/bash appuser && \
    chown -R appuser:appuser /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R appuser:appuser /app/data

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-80}/health || exit 1

# Install curl for health check
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Switch to non-root user
USER appuser

# Expose port
EXPOSE ${PORT:-80}

# Start application
CMD ["node", "server.js"]

# Labels for better container management
LABEL maintainer="N85UK <hello@git.n85.uk>" \
      version="2.0.0" \
      description="AWS End User Messaging - Enhanced SMS application with UNRAID integration" \
      org.opencontainers.image.title="AWS EUM v2.0" \
      org.opencontainers.image.description="Enhanced AWS SMS application with UNRAID integration" \
      org.opencontainers.image.version="2.0.0" \
      org.opencontainers.image.vendor="N85UK" \
      org.opencontainers.image.licenses="MIT"
