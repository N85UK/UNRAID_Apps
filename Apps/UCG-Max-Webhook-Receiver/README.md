# UCG Max Webhook Receiver

A production-ready webhook receiver for UCG Max alerts, built with FastAPI, PostgreSQL, and React.

## Features

- Secure webhook endpoint with HMAC or Bearer token authentication
- Rate limiting and idempotency support
- PostgreSQL database with optimized indexes
- Responsive React UI for browsing, searching, and filtering alerts
- CSV export functionality
- Automated retention policy for old alerts
- Docker containerized for easy deployment on Unraid

## Quick Start

1. Clone the repository
2. Configure environment variables (see .env.example)
3. Run `docker-compose up --build`
4. Access the UI at http://localhost:8000

## Configuration

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret for admin auth
- `HMAC_SECRET`: Shared secret for webhook HMAC
- `BEARER_TOKEN`: Alternative Bearer token for webhook
- `ADMIN_USER` / `ADMIN_PASSWORD`: Default admin credentials (change immediately)
- `ALERT_RETENTION_DAYS`: Days to keep alerts
- `RATE_LIMIT_REQUESTS`: Requests per window
- `RATE_LIMIT_WINDOW`: Window in seconds
- `LOG_LEVEL`: Logging level

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