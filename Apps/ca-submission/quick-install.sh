#!/bin/bash

# AWS EUM - Quick Install Script
# This script helps you install AWS EUM on UNraid manually

echo "🚀 AWS EUM Quick Installer"
echo "=========================="
echo ""

# Check if running on UNraid
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. This script is for UNraid servers with Docker installed."
    exit 1
fi

# Get user input
read -p "Enter your AWS Access Key ID: " AWS_ACCESS_KEY_ID
read -p "Enter your AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
read -p "Enter your AWS Region (default: eu-west-2): " AWS_REGION
AWS_REGION=${AWS_REGION:-eu-west-2}
read -p "Enter port to run on (default: 80): " PORT
PORT=${PORT:-80}
read -p "Enter originators (optional, format: Name:+1234567890,Name2:+0987654321): " ORIGINATORS

echo ""
echo "📋 Configuration Summary:"
echo "  AWS Access Key ID: ${AWS_ACCESS_KEY_ID:0:8}..."
echo "  AWS Region: $AWS_REGION"
echo "  Port: $PORT"
if [ -n "$ORIGINATORS" ]; then
    echo "  Originators: $ORIGINATORS"
fi
echo ""

# Create appdata directory
APPDATA_DIR="/mnt/user/appdata/aws-eum"
echo "📁 Creating appdata directory: $APPDATA_DIR"
mkdir -p "$APPDATA_DIR"

# Stop existing container if running
if docker ps -a --format 'table {{.Names}}' | grep -q "^aws-eum$"; then
    echo "🛑 Stopping existing aws-eum container..."
    docker stop aws-eum
    docker rm aws-eum
fi

# Build docker run command
DOCKER_CMD="docker run -d \
  --name aws-eum \
  -p $PORT:80 \
  -e AWS_ACCESS_KEY_ID=\"$AWS_ACCESS_KEY_ID\" \
  -e AWS_SECRET_ACCESS_KEY=\"$AWS_SECRET_ACCESS_KEY\" \
  -e AWS_REGION=\"$AWS_REGION\" \
  -v $APPDATA_DIR:/app/data"

if [ -n "$ORIGINATORS" ]; then
    DOCKER_CMD="$DOCKER_CMD -e ORIGINATORS=\"$ORIGINATORS\""
fi

DOCKER_CMD="$DOCKER_CMD ghcr.io/n85uk/aws-eum:latest"

echo "🐳 Starting container..."
echo "Command: $DOCKER_CMD"
echo ""

# Run the container
if eval "$DOCKER_CMD"; then
    echo ""
    echo "✅ Installation successful!"
    echo ""
    echo "🌐 Access your app at: http://$(hostname -I | awk '{print $1}'):$PORT"
    echo ""
    echo "📊 Check status: docker ps | grep aws-eum"
    echo "📋 View logs: docker logs aws-eum"
    echo "🛑 Stop app: docker stop aws-eum"
    echo ""
    echo "📖 Full documentation: https://github.com/N85UK/UnRiaid_Apps/tree/main/AWS_EUM"
else
    echo ""
    echo "❌ Installation failed. Check the error messages above."
    echo "💡 Make sure your AWS credentials are correct and you have Docker permissions."
    exit 1
fi