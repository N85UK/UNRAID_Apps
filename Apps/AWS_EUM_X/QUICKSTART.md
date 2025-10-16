# Quick Start Guide for AWS_EUM_X Development

This is a quick reference for completing the remaining work on AWS_EUM_X.

## What's Been Created ✅

- ✅ Complete backend implementation (server, libs, middleware)
- ✅ Dockerfile with multi-stage build and health check
- ✅ Comprehensive documentation (README, AUDIT, SECURITY, CONTRIBUTING, CHANGELOG)
- ✅ Unraid XML template
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Docker Compose setup
- ✅ IAM policy examples
- ✅ Configuration management

## What Still Needs Work ⚠️

### 1. View Templates (Required)

Create these EJS files in `views/`:

- `index.ejs` - Main dashboard
- `wizard.ejs` - First-run wizard (5 steps)
- `settings.ejs` - Configuration page
- `actions.ejs` - Quick actions (test send, export, clear queue)
- `observability.ejs` - Logs and metrics dashboard
- `error.ejs` - Error page
- `partials/header.ejs` - Common header
- `partials/footer.ejs` - Common footer
- `partials/navigation.ejs` - Navigation menu

**Template Structure Example:**

```ejs
<% include('partials/header') %>
<div class="dashboard">
  <!-- Status tiles -->
  <!-- Send form -->
  <!-- Message history -->
</div>
<% include('partials/footer') %>
```

### 2. Frontend Assets (Required)

#### `public/css/style.css`

Modern, responsive design with:

- CSS custom properties for theming
- Mobile-first responsive layout
- Status badges (green/yellow/red)
- Form validation styling
- Dashboard grid layout

#### `public/js/app.js`

Client-side functionality:

- Form validation
- AJAX requests for sending
- Real-time character count
- Phone number formatting
- Segment calculation preview
- Status dashboard auto-refresh

### 3. Unit Tests (Recommended)

Create `tests/` directory with:

```javascript
// tests/validation.test.js
describe('Phone number validation', () => {
  it('accepts E.164 format', () => {
    expect(validate('+447700900000')).toBe(true);
  });
});

// tests/rate-limiter.test.js
// tests/config.test.js
// tests/message-history.test.js
```

**Coverage Target:** 80%

### 4. Icons (Required for CA Submission)

Create in `icons/`:

- `aws-eum-x.png` (512x512) - For Community Apps
- `aws-eum-x.svg` - Scalable version
- `favicon.ico` - Browser favicon
- `favicon-16x16.png`
- `favicon-32x32.png`

**Design Suggestions:**

- AWS orange/blue color scheme
- SMS/message bubble icon
- Cloud connectivity element

### 5. Build and Test

```bash
# 1. Install dependencies
cd Apps/AWS_EUM_X
npm install

# 2. Run linter
npm run lint:fix

# 3. Run tests (once created)
npm test

# 4. Build Docker image
docker build -t aws-eum-x:test .

# 5. Test locally
docker-compose up -d

# 6. Access UI
open http://localhost:3000

# 7. Complete wizard
# 8. Send test SMS
# 9. Check health endpoint
curl http://localhost:3000/health

# 10. Export configuration
# 11. Stop container
docker-compose down
```

## Quick Development Workflow

### Start Development Server

```bash
npm run dev
# Server starts on http://localhost:3000
# Auto-reloads on code changes
```

### Test AWS Connection

```bash
# Set environment variables
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret

# Run server
npm start

# Check health
curl http://localhost:3000/health | jq
```

### Lint and Format

```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix
npm run format        # Prettier formatting
```

## File Priority for Completion

1. **Critical (Blocking)**
   - `views/index.ejs`
   - `views/wizard.ejs`
   - `public/css/style.css`
   - `public/js/app.js`
   - Icons (PNG + SVG)

2. **Important (Release Quality)**
   - `views/settings.ejs`
   - `views/actions.ejs`
   - `views/observability.ejs`
   - Unit tests
   - Integration tests

3. **Nice to Have (Post-Launch)**
   - Dark mode CSS
   - Advanced visualizations
   - E2E tests
   - Performance optimizations

## Common Commands

```bash
# Docker
docker build -t aws-eum-x .
docker run -d -p 3000:3000 aws-eum-x
docker logs -f aws-eum-x
docker exec -it aws-eum-x sh

# npm
npm install                  # Install deps
npm start                    # Production
npm run dev                  # Development
npm test                     # Run tests
npm run lint                 # Lint
npm run lint:fix             # Fix linting

# Git
git add .
git commit -m "feat: add dashboard UI"
git push origin feature/ui

# Docker Compose
docker-compose up -d         # Start
docker-compose logs -f       # Logs
docker-compose down          # Stop
docker-compose build         # Rebuild
```

## Environment Setup Checklist

- [ ] Node.js 20+ installed
- [ ] Docker installed and running
- [ ] AWS account with Pinpoint enabled
- [ ] IAM user or role with permissions
- [ ] At least one origination identity registered
- [ ] Git configured
- [ ] Editor with ESLint/Prettier plugins

## Testing Checklist Before Release

- [ ] First-run wizard completes successfully
- [ ] Test SMS sends to real number
- [ ] Phone pool auto-discovery works
- [ ] Configuration export/import works
- [ ] Health endpoints return correct status
- [ ] Rate limiter enforces limits
- [ ] Opt-out checking prevents sends
- [ ] Logs redact secrets
- [ ] Container runs as non-root
- [ ] Health check passes
- [ ] CSS responsive on mobile
- [ ] No console errors in browser
- [ ] All links in documentation work
- [ ] Docker image builds successfully
- [ ] Multi-arch builds work (amd64, arm64)

## Community Apps Submission Checklist

- [ ] XML template validated
- [ ] Icons uploaded (512x512 PNG minimum)
- [ ] Docker image published to GHCR
- [ ] README comprehensive
- [ ] CHANGELOG up to date
- [ ] Support URL working (GitHub issues)
- [ ] Project URL working (GitHub repo)
- [ ] No secrets in repository
- [ ] License file present (MIT)
- [ ] CA metadata form completed

## Useful Resources

- **AWS Pinpoint Docs**: <https://docs.aws.amazon.com/pinpoint/>
- **Unraid CA Guidelines**: <https://forums.unraid.net/topic/87144-ca-application-policies-privacy-policy/>
- **Express.js Docs**: <https://expressjs.com/>
- **EJS Docs**: <https://ejs.co/>
- **Pino Logger**: <https://getpino.io/>
- **Joi Validation**: <https://joi.dev/>

## Getting Help

If stuck:

1. Check AUDIT.md for design decisions
2. Review CONTRIBUTING.md for standards
3. Look at AWS_EUM original code for reference
4. Ask in GitHub Discussions

## Estimated Time to Complete

- Views (5 files): 8-12 hours
- CSS: 4-6 hours
- JavaScript: 4-6 hours
- Icons: 2-4 hours
- Tests: 8-12 hours
- Testing/QA: 4-6 hours

Total: 30-46 hours (4-6 days full-time)

---

## Summary

Good luck! You have a solid foundation to build on. 🚀
