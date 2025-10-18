# Generic Webhook Receiver (UCG Max Compatible)

A flexible FastAPI-based webhook receiver designed for UNRAID servers that accepts webhooks from **any source**. Originally built for UCG Max (Universal Call Generator), it now supports generic JSON payloads from any application.

For detailed setup instructions, see [INSTALL.md](INSTALL.md)

## Features

- **Universal Webhook Support**: Accepts any JSON structure from any source
- **Intelligent Field Mapping**: Automatically maps common field names to alert structure
- **Multiple Webhook Sources**: Track alerts by origin (UCG Max, custom apps, etc.)
- **Flexible Authentication**: HMAC-SHA256, Bearer token, or JWT (optional)
- **Rate Limiting**: Configurable request throttling per source
- **Idempotency Support**: Prevent duplicate alerts
- **External Database**: MariaDB, MySQL, or PostgreSQL support
- **Web Dashboard**: React UI for browsing, searching, and filtering alerts
- **CSV Export**: Export alerts with filters
- **Auto-cleanup**: Automated retention policy for old alerts
- **Docker Ready**: Containerized for easy UNRAID deployment

## Quick Start

1. Clone the repository
2. Configure environment variables (see .env.example)
3. Deploy to UNRAID using the provided template
4. Access the UI at `http://your-server:8000`

## Webhook Endpoints

### Generic Webhook (Any JSON)

**Endpoint**: `POST /webhook?webhook_source=myapp`

Accepts any JSON payload and intelligently maps fields:

```bash
curl -X POST 'http://your-server:8000/webhook?webhook_source=myapp' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token' \
  -d '{
    "id": "event-123",
    "message": "Server down",
    "severity": "critical",
    "host": "web-server-01",
    "timestamp": "2025-10-18T12:00:00Z"
  }'
```

**Field Mapping**:
- `id`, `alert_id`, `event_id` → `alert_id`
- `message`, `summary`, `title`, `description` → `summary`
- `severity`, `level`, `priority` → `severity`
- `device`, `host`, `hostname`, `node` → `device`
- `source`, `origin`, `application` → `source`
- `type`, `alert_type`, `event_type`, `category` → `alert_type`

Any fields not recognized are stored in `raw_payload` for reference.

### UCG Max Webhook (Structured)

**Endpoint**: `POST /webhook/ucgmax`

Original endpoint for UCG Max with strict schema validation:

```bash
curl -X POST 'http://your-server:8000/webhook/ucgmax' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token' \
  -d '{
    "alert_id": "ucg-alert-123",
    "source": "UCG Max",
    "device": "router-01",
    "severity": "major",
    "alert_type": "link_down",
    "timestamp": "2025-10-18T12:00:00Z",
    "summary": "Link down on port 5",
    "details": {},
    "raw_payload": {}
  }'
```

## Configuration

### Environment Variables (UNRAID Template)

- `DB_TYPE`: Database type (mariadb, mysql, or postgresql)
- `DB_HOST`: Database server hostname/IP
- `DB_PORT`: Database port (default: 3306 for MariaDB/MySQL, 5432 for PostgreSQL)
- `DB_NAME`: Database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `SECRET_KEY`: JWT secret for admin authentication
- `HMAC_SECRET`: Shared secret for HMAC webhook authentication (optional)
- `BEARER_TOKEN`: Bearer token for webhook authentication (optional)
- `ADMIN_USER` / `ADMIN_PASSWORD`: Dashboard admin credentials
- `ALERT_RETENTION_DAYS`: Days to keep alerts (default: 90)
- `RATE_LIMIT_REQUESTS`: Requests per window (default: 100)
- `RATE_LIMIT_WINDOW`: Window in seconds (default: 60)
- `LOG_LEVEL`: Logging level (DEBUG, INFO, WARNING, ERROR)

### Authentication

**Optional**: Authentication is only enforced if `BEARER_TOKEN` or `HMAC_SECRET` is configured.

For testing or internal use, you can leave these empty to allow unauthenticated webhooks.

For production, configure at least one:
- **Bearer Token**: Simple `Authorization: Bearer <token>` header
- **HMAC-SHA256**: Computed signature in `X-Hub-Signature-256: sha256=<hmac>` header

## Usage Examples

### Example 1: Uptime Robot Webhook

```bash
curl -X POST 'http://your-server:8000/webhook?webhook_source=uptimerobot' \
  -H 'Content-Type: application/json' \
  -d '{
    "monitor_id": "12345",
    "monitor_name": "My Website",
    "monitor_url": "https://example.com",
    "alert_type": "down",
    "alert_reason": "Connection timeout",
    "alert_datetime": "2025-10-18T12:00:00"
  }'
```

### Example 2: GitHub Webhook

```bash
curl -X POST 'http://your-server:8000/webhook?webhook_source=github' \
  -H 'Content-Type: application/json' \
  -d '{
    "action": "opened",
    "issue": {
      "id": 1,
      "title": "Bug report",
      "state": "open"
    },
    "repository": {
      "name": "myrepo",
      "full_name": "user/myrepo"
    }
  }'
```

### Example 3: Custom Application

```bash
curl -X POST 'http://your-server:8000/webhook?webhook_source=myapp' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-secret-token' \
  -d '{
    "event_id": "evt_abc123",
    "severity": "warning",
    "message": "High memory usage detected",
    "hostname": "server-01",
    "timestamp": "2025-10-18T12:00:00Z",
    "details": {
      "memory_percent": 95,
      "threshold": 80
    }
  }'
```

### UCG Max Configuration

To configure UCG Max to send alerts:

1. In UCG Max settings, add a webhook destination
2. URL: `https://your-domain.com/webhook/ucgmax`
3. Method: POST
4. Headers:
   - `X-Hub-Signature-256`: sha256=<hmac_hex> (if using HMAC)
   - Or `Authorization: Bearer <token>`
5. Payload: JSON as specified

Example curl:

```bash
curl -X POST https://your-domain.com/webhook/ucgmax \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=<hmac>" \
  -d '{
    "alert_id": "unique-id",
    "source": "UCG Max",
    "device": "UCG-Max-001",
    "severity": "critical",
    "type": "internet_disconnected",
    "timestamp": "2025-10-17T20:00:00Z",
    "summary": "Internet disconnected on br0.100",
    "details": {
      "latency_ms": 234,
      "packet_loss_pct": 12.5,
      "interface": "br0.100",
      "uptime": "12345s"
    },
    "raw_payload": {}
  }'
```

## Unraid Deployment

1. Import the docker-compose.yml as a stack in Docker
2. Set environment variables in the web service
3. Add labels for Unraid Community Apps compatibility
4. Expose port 8000
5. Use reverse proxy (Nginx/Cloudflare) for TLS

## API Endpoints

- `POST /webhook/ucgmax`: Receive alerts
- `GET /api/alerts`: List alerts with filters
- `GET /api/alerts/{id}`: Get specific alert
- `DELETE /api/alerts/{id}`: Delete alert (admin)
- `GET /api/alerts/export`: Export as CSV
- `GET /api/metrics`: Dashboard metrics

## Development

Backend: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload`

Frontend: `cd frontend && npm install && npm run dev`

Tests: `pytest tests/`

## License

MIT
