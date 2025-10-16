#!/usr/bin/env bash

###############################################################################
# AWS EUM X - UI Page Testing Script
#
# This script validates that all UI pages render correctly in a running
# AWS_EUM_X container. It performs the following checks:
#
# 1. Container health checks (liveness, readiness)
# 2. UI page accessibility (dashboard, settings, actions, observability)
# 3. API endpoint functionality
# 4. Response time benchmarks
#
# Usage:
#   ./scripts/test-ui-pages.sh [container-name] [port]
#
# Examples:
#   ./scripts/test-ui-pages.sh aws-eum-x 8080
#   ./scripts/test-ui-pages.sh my-container 9000
#
# Requirements:
#   - curl
#   - jq (optional, for JSON parsing)
#   - Docker (for container checks)
###############################################################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
CONTAINER_NAME="${1:-aws-eum-x}"
PORT="${2:-8080}"
BASE_URL="http://localhost:${PORT}"

# Test results
PASSED=0
FAILED=0
TOTAL=0

###############################################################################
# Helper Functions
###############################################################################

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_test() {
  echo -e "${YELLOW}▶ $1${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((PASSED++))
  ((TOTAL++))
}

print_failure() {
  echo -e "${RED}❌ $1${NC}"
  ((FAILED++))
  ((TOTAL++))
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

test_endpoint() {
  local name=$1
  local path=$2
  local expected_status=${3:-200}
  local method=${4:-GET}
  
  print_test "Testing $name ($method $path)"
  
  # Make request and capture status code + response time
  response=$(curl -s -o /tmp/test-response.txt -w "%{http_code}:%{time_total}" -X "$method" "${BASE_URL}${path}" 2>/dev/null || echo "000:0")
  status_code=$(echo "$response" | cut -d':' -f1)
  response_time=$(echo "$response" | cut -d':' -f2)
  
  if [ "$status_code" = "$expected_status" ]; then
    print_success "$name returned HTTP $status_code in ${response_time}s"
    
    # Show response preview (first 200 chars)
    if [ -f /tmp/test-response.txt ]; then
      content=$(head -c 200 /tmp/test-response.txt)
      print_info "Preview: ${content:0:100}..."
    fi
  else
    print_failure "$name returned HTTP $status_code (expected $expected_status)"
    
    # Show error response
    if [ -f /tmp/test-response.txt ]; then
      print_info "Response: $(cat /tmp/test-response.txt | head -c 500)"
    fi
  fi
  
  rm -f /tmp/test-response.txt
}

test_html_page() {
  local name=$1
  local path=$2
  
  print_test "Testing $name HTML page ($path)"
  
  # Make request and check for HTML content
  response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${path}" 2>/dev/null)
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "200" ] && echo "$body" | grep -q "<!DOCTYPE html"; then
    print_success "$name page renders correctly"
    
    # Check for key elements
    if echo "$body" | grep -q "<title>"; then
      title=$(echo "$body" | grep -o "<title>[^<]*</title>" | sed 's/<[^>]*>//g')
      print_info "Page title: $title"
    fi
    
    # Count EJS variables (should be 0 in rendered output)
    ejs_vars=$(echo "$body" | grep -o "<%.*%>" | wc -l || echo 0)
    if [ "$ejs_vars" -gt 0 ]; then
      print_failure "Found $ejs_vars unrendered EJS variables"
    fi
  else
    print_failure "$name page did not render (HTTP $status_code or invalid HTML)"
  fi
}

test_json_api() {
  local name=$1
  local path=$2
  local method=${3:-GET}
  
  print_test "Testing $name API ($method $path)"
  
  response=$(curl -s -w "\n%{http_code}" -X "$method" \
    -H "Content-Type: application/json" \
    "${BASE_URL}${path}" 2>/dev/null)
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status_code" = "200" ]; then
    # Check if response is valid JSON
    if echo "$body" | jq . >/dev/null 2>&1; then
      print_success "$name API returned valid JSON"
      
      # Show formatted JSON (first 5 lines)
      print_info "Response: $(echo "$body" | jq -c . | head -c 150)..."
    elif command -v jq >/dev/null 2>&1; then
      print_failure "$name API returned invalid JSON"
      print_info "Response: ${body:0:200}"
    else
      print_success "$name API returned HTTP $status_code"
      print_info "Response: ${body:0:150}... (install jq for JSON validation)"
    fi
  else
    print_failure "$name API returned HTTP $status_code"
  fi
}

###############################################################################
# Main Test Suite
###############################################################################

print_header "AWS EUM X - UI Page Testing"

print_info "Container: $CONTAINER_NAME"
print_info "Port: $PORT"
print_info "Base URL: $BASE_URL"

# Check if container is running
print_header "1. Container Status"

if docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
  print_success "Container '$CONTAINER_NAME' is running"
  
  # Get container details
  uptime=$(docker inspect "$CONTAINER_NAME" --format='{{.State.StartedAt}}' 2>/dev/null || echo "unknown")
  print_info "Started at: $uptime"
  
  # Check container health
  health=$(docker inspect "$CONTAINER_NAME" --format='{{.State.Health.Status}}' 2>/dev/null || echo "none")
  if [ "$health" = "healthy" ]; then
    print_success "Container health: $health"
  elif [ "$health" = "none" ]; then
    print_info "Container health: not configured"
  else
    print_failure "Container health: $health"
  fi
else
  print_failure "Container '$CONTAINER_NAME' is not running"
  print_info "Start the container with: docker run -d --name $CONTAINER_NAME -p $PORT:80 ghcr.io/n85uk/aws-eum-x:latest"
  exit 1
fi

# Test health endpoints
print_header "2. Health Endpoints"

test_json_api "Liveness probe" "/health"
test_json_api "Readiness probe" "/ready"
test_json_api "AWS probe" "/probe/aws"

# Test UI pages
print_header "3. UI Pages"

test_html_page "Dashboard" "/dashboard"
test_html_page "Settings" "/settings"
test_html_page "Actions" "/actions"
test_html_page "Observability" "/observability"

# Test root redirect
print_test "Testing root redirect (/)"
response=$(curl -s -w "\n%{http_code}" -L "${BASE_URL}/" 2>/dev/null)
status_code=$(echo "$response" | tail -n1)
if [ "$status_code" = "200" ]; then
  print_success "Root redirect works (HTTP $status_code)"
else
  print_failure "Root redirect failed (HTTP $status_code)"
fi

# Test API endpoints
print_header "4. API Endpoints"

test_json_api "Queue status" "/api/queue/status"
test_json_api "Last sends" "/api/last-sends"

# Test send SMS (should fail validation without proper data)
print_test "Testing send SMS validation (POST /api/send-sms)"
response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  "${BASE_URL}/api/send-sms" 2>/dev/null)
status_code=$(echo "$response" | tail -n1)

# Expect 400 (validation error) or 503 (not ready)
if [ "$status_code" = "400" ] || [ "$status_code" = "503" ]; then
  print_success "Send SMS validation works (HTTP $status_code)"
else
  print_failure "Send SMS returned unexpected status (HTTP $status_code)"
fi

# Performance benchmarks
print_header "5. Performance Benchmarks"

print_test "Testing response times (10 requests to /health)"
total_time=0
for i in {1..10}; do
  response_time=$(curl -s -o /dev/null -w "%{time_total}" "${BASE_URL}/health" 2>/dev/null)
  total_time=$(echo "$total_time + $response_time" | bc)
done
avg_time=$(echo "scale=4; $total_time / 10" | bc)
print_info "Average response time: ${avg_time}s"

if (( $(echo "$avg_time < 0.1" | bc -l) )); then
  print_success "Response time is excellent (<100ms)"
elif (( $(echo "$avg_time < 0.5" | bc -l) )); then
  print_success "Response time is good (<500ms)"
else
  print_failure "Response time is slow (>${avg_time}s)"
fi

# Static assets
print_header "6. Static Assets"

test_endpoint "CSS stylesheet" "/css/style.css" 200
test_endpoint "JavaScript app" "/js/app.js" 200

# Summary
print_header "Test Summary"

echo ""
echo -e "${BLUE}Total Tests: $TOTAL${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  ✅ All tests passed! AWS EUM X is ready for production.${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}  ❌ Some tests failed. Please review errors above.${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  exit 1
fi
