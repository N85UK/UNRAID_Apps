#!/bin/bash
# Test script for Generic Webhook Receiver
# Tests various webhook formats and sources

SERVER="http://10.0.2.15:8000"
BEARER_TOKEN="6a9961bd8b70ee0d72b0c9164304320786a594b0e997f613e090c81b2601ea62"

echo "=== Testing Generic Webhook Receiver ==="
echo ""

# Test 1: UCG Max Format (Original)
echo "Test 1: UCG Max Webhook"
curl -X POST "${SERVER}/webhook/ucgmax" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "alert_id": "ucg-test-001",
    "source": "UCG Max",
    "device": "router-01",
    "severity": "major",
    "alert_type": "link_down",
    "timestamp": "2025-10-18T15:00:00Z",
    "summary": "Link down on port 5",
    "details": {"port": 5, "interface": "eth0"},
    "raw_payload": {}
  }'
echo -e "\n"

# Test 2: Generic Webhook with Uptime Robot format
echo "Test 2: Uptime Robot Style Webhook"
curl -X POST "${SERVER}/webhook?webhook_source=uptimerobot" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "monitor_id": "12345",
    "monitor_name": "My Website",
    "monitor_url": "https://example.com",
    "alert_type": "down",
    "alert_reason": "Connection timeout",
    "alert_datetime": "2025-10-18T15:00:00Z"
  }'
echo -e "\n"

# Test 3: GitHub-style webhook
echo "Test 3: GitHub Style Webhook"
curl -X POST "${SERVER}/webhook?webhook_source=github" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "action": "opened",
    "issue": {
      "id": 1,
      "title": "Critical Bug: Application Crash",
      "state": "open",
      "severity": "critical"
    },
    "repository": {
      "name": "myapp",
      "full_name": "myorg/myapp"
    }
  }'
echo -e "\n"

# Test 4: Prometheus AlertManager format
echo "Test 4: Prometheus AlertManager Style"
curl -X POST "${SERVER}/webhook?webhook_source=prometheus" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "alerts": [{
      "status": "firing",
      "labels": {
        "alertname": "HighMemoryUsage",
        "severity": "warning",
        "instance": "server-01:9100"
      },
      "annotations": {
        "summary": "High memory usage detected",
        "description": "Memory usage is above 90%"
      },
      "startsAt": "2025-10-18T15:00:00Z"
    }]
  }'
echo -e "\n"

# Test 5: Custom Application webhook
echo "Test 5: Custom Application Webhook"
curl -X POST "${SERVER}/webhook?webhook_source=myapp" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "event_id": "evt_abc123",
    "level": "error",
    "message": "Database connection failed",
    "hostname": "db-server-01",
    "timestamp": "2025-10-18T15:00:00Z",
    "details": {
      "database": "production",
      "error_code": 2003,
      "retry_count": 3
    }
  }'
echo -e "\n"

# Test 6: Minimal webhook (only required fields)
echo "Test 6: Minimal Webhook"
curl -X POST "${SERVER}/webhook?webhook_source=minimal" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${BEARER_TOKEN}" \
  -d '{
    "message": "Something happened",
    "timestamp": "2025-10-18T15:00:00Z"
  }'
echo -e "\n"

echo "=== All tests completed ==="
echo "Check the dashboard at: ${SERVER}"
echo "View alerts: ${SERVER}/api/alerts"
echo "Export CSV: ${SERVER}/api/alerts/export"
