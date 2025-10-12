# AWS Two-Way SMS - Dockerfile
FROM node:20-alpine

# Set version
ARG VERSION=1.0.0
ENV APP_VERSION=${VERSION}

# Create app user and group
RUN addgroup -S appuser && \
    adduser -S -u 1000 -G appuser appuser

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files
COPY --chown=appuser:appuser . .

# Create data directory
RUN mkdir -p /data && \
    chown -R appuser:appuser /data

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start application
CMD ["node", "server.js"]
