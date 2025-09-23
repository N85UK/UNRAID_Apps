# Use Node LTS
FROM node:20-bullseye-slim

# Create app directory
WORKDIR /app

# Copy package.json and install
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production

# Copy app source
COPY . .

# Ensure data dir exists
RUN mkdir -p /app/data

EXPOSE 80
CMD ["node", "server.js"]
