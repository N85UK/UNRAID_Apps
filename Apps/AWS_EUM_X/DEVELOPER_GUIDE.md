# Developer Quick Start Guide

## Prerequisites
- Node.js 20+ installed
- AWS account with Pinpoint SMS enabled
- IAM credentials with required permissions (see `iam/README.md`)
- Docker (optional, for container testing)

## Local Development Setup

### 1. Install Dependencies
```bash
cd Apps/AWS_EUM_X
npm install
```

### 2. Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
NODE_ENV=development
LOG_LEVEL=debug
PORT=3000
DATA_DIR=./data
SENDS_ENABLED=false
SENDS_SIMULATE=true
```

### 3. Start Development Server
```bash
npm run dev
```

Server starts on http://localhost:3000

### 4. Test Endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Readiness Check:**
```bash
curl http://localhost:3000/ready
```

**Test AWS Credentials:**
```bash
curl -X POST http://localhost:3000/api/test/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "accessKeyId": "AKIA...",
    "secretAccessKey": "...",
    "region": "us-east-1"
  }'
```

**DryRun Send:**
```bash
curl -X POST http://localhost:3000/api/test/dry-run \
  -H "Content-Type: application/json" \
  -d '{
    "DestinationPhoneNumber": "+1234567890",
    "MessageBody": "Test message"
  }'
```

## Testing

### Run Smoke Tests
```bash
npm run smoke
```

### Run Linter
```bash
npm run lint
```

### Generate Support Bundle
```bash
npm run support-bundle
```

## Docker Development

### Build Image
```bash
docker build -t aws-eum-x:dev .
```

### Run Container
```bash
docker run -d \
  --name aws-eum-x-dev \
  -p 3000:80 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=us-east-1 \
  -e NODE_ENV=development \
  -v $(pwd)/data:/app/data \
  aws-eum-x:dev
```

### View Logs
```bash
docker logs -f aws-eum-x-dev
```

### Stop Container
```bash
docker stop aws-eum-x-dev
docker rm aws-eum-x-dev
```

## Project Structure

```
Apps/AWS_EUM_X/
├── server.js              # Main Express application
├── config/
│   ├── logger.js          # Pino logger with redaction
│   └── schema.json        # Validation schemas
├── lib/
│   └── message-estimator.js  # SMS part calculator
├── iam/
│   ├── minimal-policy.json   # IAM policy template
│   └── README.md            # IAM setup guide
├── test/
│   └── smoke-test.js      # Automated tests
├── support/
│   └── generate-bundle.js # Support bundle generator
├── views/
│   └── first-run.ejs      # First-run wizard
├── public/                # Static assets (CSS, JS, images)
└── data/                  # Runtime data (history, config)
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `server.js` | Main application entry point |
| `config/logger.js` | Logging configuration and redaction |
| `lib/message-estimator.js` | SMS encoding and part calculation |
| `my-aws-eum-x.xml` | Unraid template |
| `Dockerfile` | Container build configuration |
| `package.json` | Dependencies and scripts |

## Development Workflow

### 1. Make Changes
Edit source files (`server.js`, `config/*`, `lib/*`, etc.)

### 2. Test Locally
```bash
npm run dev
# Test endpoints with curl or browser
```

### 3. Run Tests
```bash
npm run smoke
```

### 4. Check Logs
Logs are output to console in development (pretty format).

### 5. Build Docker Image
```bash
docker build -t aws-eum-x:test .
```

### 6. Test Container
```bash
docker run --rm -p 3000:80 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  aws-eum-x:test
```

## Environment Variables

### Required
- `AWS_ACCESS_KEY_ID` - IAM access key
- `AWS_SECRET_ACCESS_KEY` - IAM secret key

### Optional
- `AWS_REGION` (default: `us-east-1`)
- `NODE_ENV` (default: `production`)
- `LOG_LEVEL` (default: `info`)
- `PORT` (default: `80`)
- `DATA_DIR` (default: `/app/data`)
- `SENDS_ENABLED` (default: `false`)
- `SENDS_SIMULATE` (default: `true`)
- `RATE_LIMIT_PARTS_PER_SECOND` (default: `1.0`)
- `RATE_LIMIT_MAX_QUEUE_SIZE` (default: `200`)

## Debugging

### Enable Verbose Logging
```bash
LOG_LEVEL=debug npm run dev
```

Or even more verbose:
```bash
LOG_LEVEL=trace npm run dev
```

### Check AWS Connectivity
```bash
curl http://localhost:3000/probe/aws | jq
```

### Inspect Queue Status
```bash
curl http://localhost:3000/api/queue/status | jq
```

### View Last Sends
```bash
curl http://localhost:3000/api/last-sends | jq
```

## Common Issues

### "AWS client not initialized"
- Check `.env` file exists and has valid credentials
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set

### "Data directory not writable"
- Ensure `./data` directory exists: `mkdir -p data`
- Check permissions: `chmod 755 data`

### Port already in use
- Change `PORT` in `.env` to an available port
- Or kill the process using port 3000: `lsof -ti:3000 | xargs kill`

### Module not found
- Run `npm install` to install dependencies
- Check `package.json` has correct dependencies

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run tests: `npm run smoke`
4. Commit with descriptive message
5. Push and create pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## Resources

- **AWS Pinpoint SMS API:** https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/
- **Pino Logging:** https://getpino.io/
- **Express.js:** https://expressjs.com/
- **Audit Document:** [AUDIT.md](AUDIT.md)
- **README:** [README.md](README.md)

## Next Steps

1. Complete first-run wizard at http://localhost:3000
2. Test with DryRun sends (no charges)
3. Review logs for secret redaction
4. Generate support bundle: `npm run support-bundle`
5. Read the full [README.md](README.md) for API documentation

---

Happy coding! 🚀
