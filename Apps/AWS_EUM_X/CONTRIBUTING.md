# Contributing to AWS EUM X

Thank you for your interest in contributing to AWS EUM X! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Labels](#issue-labels)

## Code of Conduct

Be respectful, inclusive, and professional. We're all here to build something useful together.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**Good bug reports include:**

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Unraid version, Docker version, etc.)
- Logs or screenshots if applicable

### Suggesting Enhancements

Enhancement suggestions are welcome! Please:

- Use a clear, descriptive title
- Explain the use case and benefit
- Provide examples if possible
- Check if someone has already suggested it

### Code Contributions

We welcome pull requests for:

- Bug fixes
- New features (please discuss in an issue first)
- Documentation improvements
- Test coverage increases
- Performance improvements

## Development Setup

### Prerequisites

- **Node.js**: >=20.0.0
- **Docker**: Latest stable version
- **Git**: Latest version
- **Text Editor**: VS Code recommended (devcontainer included)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/N85UK/UNRAID_Apps.git
   cd UNRAID_Apps/Apps/AWS_EUM_X
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials
   ```

4. **Run in development mode**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open <http://localhost:3000>

### Using DevContainer (Recommended)

1. Open project in VS Code
2. Install "Remote - Containers" extension
3. Click "Reopen in Container" when prompted
4. Everything is pre-configured!

### Docker Development Build

```bash
# Build image
docker build -t aws-eum-x:dev .

# Run container
docker run -d \
  --name aws-eum-x-dev \
  -p 3000:3000 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -v $(pwd)/config:/app/config \
  -v $(pwd)/data:/app/data \
  aws-eum-x:dev

# View logs
docker logs -f aws-eum-x-dev
```

## Coding Standards

### JavaScript Style Guide

We use **ESLint** with Prettier for code formatting.

**Key Rules:**

- Semicolons required
- Single quotes for strings
- 2-space indentation
- Max line length: 100 characters
- No unused variables
- Prefer `const` over `let`, avoid `var`

**Run linter:**

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Code Organization

```
src/
├── server.js           # Main application entry point
├── healthcheck.js      # Health check script
├── lib/                # Business logic
│   ├── logger.js       # Structured logging
│   ├── config.js       # Configuration management
│   ├── aws-client.js   # AWS SDK wrapper
│   ├── validation.js   # Input validation schemas
│   ├── rate-limiter.js # Rate limiting logic
│   └── message-history.js # Message storage
├── routes/             # Express route handlers (future)
└── middleware/         # Custom middleware (future)
```

### Naming Conventions

- **Files**: kebab-case (e.g., `aws-client.js`)
- **Functions**: camelCase (e.g., `sendSMS()`)
- **Classes**: PascalCase (e.g., `AWSClient`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Environment Variables**: UPPER_SNAKE_CASE (e.g., `AWS_REGION`)

### Comments

- Use JSDoc for function documentation
- Comment "why", not "what"
- Keep comments up-to-date with code changes

Example:

```javascript
/**
 * Send an SMS message via AWS Pinpoint with rate limiting
 * 
 * @param {Object} params - Message parameters
 * @param {string} params.phoneNumber - E.164 formatted phone number
 * @param {string} params.message - Message body (max 1600 chars)
 * @param {string} params.originationIdentity - ARN or phone number
 * @returns {Promise<Object>} Result with messageId
 * @throws {Error} If validation fails or AWS API errors
 */
async function sendSMS(params) {
  // Implementation
}
```

## Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Writing Tests

**Structure:**

```javascript
const { describe, it, expect } = require('@jest/globals');
const { validate } = require('../src/lib/validation');

describe('validation', () => {
  describe('sendSMS schema', () => {
    it('should validate correct phone number', () => {
      const result = validate('sendSMS', {
        phoneNumber: '+447700900000',
        message: 'Test',
        originationIdentity: 'arn:aws:...'
      });
      
      expect(result.valid).toBe(true);
    });

    it('should reject invalid phone number format', () => {
      const result = validate('sendSMS', {
        phoneNumber: '07700900000', // Missing +
        message: 'Test',
        originationIdentity: 'arn:aws:...'
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('E.164');
    });
  });
});
```

**Coverage Requirements:**

- Minimum 80% coverage for new code
- Critical paths must have 100% coverage (auth, sending, validation)

### Integration Tests

Place integration tests in `tests/integration/`:

```javascript
// tests/integration/health.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Health Endpoints', () => {
  it('GET /health should return 200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

## Pull Request Process

### Before Submitting

1. **Create an issue** first (for features or non-trivial changes)
2. **Fork the repository**
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes**
5. **Write/update tests**
6. **Run linter** (`npm run lint:fix`)
7. **Run tests** (`npm test`)
8. **Update documentation** (README, comments, etc.)
9. **Commit with clear messages** (see [Commit Messages](#commit-messages))

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.

**Examples:**

```
feat(sms): add MMS support with media upload

Implements MMS sending using MediaUrls parameter. Adds file upload
UI and validation for image types (png, jpg, gif).

Closes #123

---

fix(rate-limiter): correct token refill calculation

Token refill was using milliseconds instead of seconds, causing
10x slower refill rate than configured.

Fixes #456
```

### Submitting PR

1. Push to your fork
2. Open PR against `main` branch
3. Fill out PR template (auto-populated)
4. Link related issues
5. Request review from maintainers

### PR Review Process

- At least one approval required
- All tests must pass
- No merge conflicts
- Documentation updated if needed
- Changelog updated for user-facing changes

## Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `priority: high` | High priority |
| `priority: low` | Low priority |
| `security` | Security vulnerability |
| `wontfix` | This will not be worked on |
| `duplicate` | This issue already exists |

## Development Workflow

### Branching Strategy

- `main`: Stable, production-ready code
- `dev`: Development branch (integration)
- `feature/*`: Feature branches (branch from `dev`)
- `hotfix/*`: Urgent fixes (branch from `main`)

### Release Process

1. Create release branch (`release/1.1.0`)
2. Update version in `package.json`
3. Update `CHANGELOG.md`
4. Create PR to `main`
5. After merge, tag release (`git tag v1.1.0`)
6. Build and push Docker images
7. Create GitHub release with notes

## Project Structure

```
AWS_EUM_X/
├── .github/
│   ├── workflows/       # CI/CD pipelines
│   └── ISSUE_TEMPLATE/  # Issue templates
├── src/
│   ├── server.js        # Main app
│   ├── healthcheck.js   # Health check
│   └── lib/             # Business logic
├── views/               # EJS templates
├── public/              # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── tests/               # Test files
│   ├── unit/
│   └── integration/
├── config/              # Volume mount (gitignored)
├── data/                # Volume mount (gitignored)
├── icons/               # App icons
├── Dockerfile           # Production image
├── docker-compose.yml   # Development compose
├── package.json         # Dependencies
├── .eslintrc.js         # Linter config
├── .prettierrc          # Formatter config
├── README.md            # Main documentation
├── CHANGELOG.md         # Version history
├── SECURITY.md          # Security policy
├── CONTRIBUTING.md      # This file
├── LICENSE              # MIT license
└── my-aws-eum-x.xml     # Unraid template
```

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/N85UK/UNRAID_Apps/discussions)
- **Bugs**: [GitHub Issues](https://github.com/N85UK/UNRAID_Apps/issues)
- **Security**: Email <hello@git.n85.uk>

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉
