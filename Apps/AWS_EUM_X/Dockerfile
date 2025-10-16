# =============================================================================
# Stage 1: Build stage
# =============================================================================
FROM node:20-bookworm-slim AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# =============================================================================
# Stage 2: Production stage
# =============================================================================
FROM node:20-bookworm-slim

# Metadata
LABEL org.opencontainers.image.title="AWS EUM X" \
      org.opencontainers.image.description="Modern AWS End User Messaging application for Unraid" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="N85UK <hello@git.n85.uk>" \
      org.opencontainers.image.source="https://github.com/N85UK/UNRAID_Apps" \
      org.opencontainers.image.licenses="MIT"

# Install dumb-init for proper signal handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r -g 1001 appuser && \
    useradd -r -g appuser -u 1001 -m -s /bin/bash appuser

# Set working directory
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder --chown=appuser:appuser /build/node_modules ./node_modules

# Copy application files
COPY --chown=appuser:appuser src ./src
COPY --chown=appuser:appuser views ./views
COPY --chown=appuser:appuser public ./public
COPY --chown=appuser:appuser package*.json ./

# Create directories with proper permissions
RUN mkdir -p /app/config /app/data && \
    chown -R appuser:appuser /app/config /app/data

# Set permissions on healthcheck script
RUN chmod +x /app/src/healthcheck.js

# Switch to non-root user
USER appuser

# Environment variables with defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    CONFIG_DIR=/app/config \
    DATA_DIR=/app/data \
    LOG_LEVEL=info \
    APP_VERSION=1.0.0

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node /app/src/healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]
