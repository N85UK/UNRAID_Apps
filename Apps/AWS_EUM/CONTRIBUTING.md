# Contributing to AWS EUM v3

Thank you for your interest in contributing to AWS End User Messaging v3! This document provides guidelines and workflows for contributing.

## Git Flow Workflow

We use a **Git Flow** branching strategy for development:

### Branch Structure

- **`main`** - Production-ready code. All releases are tagged here.
- **`develop`** - Integration branch for features. Latest development code.
- **`feature/*`** - Feature branches (e.g., `feature/add-mfa-support`)
- **`bugfix/*`** - Bug fix branches (e.g., `bugfix/fix-chart-rendering`)
- **`hotfix/*`** - Urgent production fixes (e.g., `hotfix/security-patch`)
- **`release/*`** - Release preparation branches (e.g., `release/3.1.0`)

### Workflow Steps

#### 1. Starting a New Feature

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name
```

#### 2. Creating a Pull Request

- Create a PR from `feature/your-feature-name` → `develop`
- Fill out the PR template completely
- Wait for automated checks to pass
- Request review from maintainers
- Address any feedback

#### 3. Bug Fixes

```bash
# For non-critical bugs
git checkout develop
git checkout -b bugfix/issue-description

# For critical production bugs
git checkout main
git checkout -b hotfix/critical-issue
```

#### 4. Release Process

```bash
# Create release branch from develop
git checkout develop
git checkout -b release/3.1.0

# Update version numbers (or use automated workflow)
# - package.json
# - server.js (APP_VERSION)
# - Dockerfile

# Test thoroughly
# Merge to main when ready
git checkout main
git merge release/3.1.0
git tag -a v3.1.0 -m "Release v3.1.0"

# Merge back to develop
git checkout develop
git merge release/3.1.0

# Push everything
git push origin main develop v3.1.0
```

## Automated Workflows

### Docker Build & Push

**Trigger:** Push to `main` or `develop`, or create a tag

The GitHub Actions workflow automatically:
1. Extracts version from `package.json`
2. Builds multi-architecture Docker images (amd64, arm64)
3. Pushes to GitHub Container Registry
4. Tags appropriately:
   - `latest` for main branch
   - `develop` for develop branch
   - Version tags (e.g., `3.0.7`, `v3`)

**Manual Trigger:**
Go to **Actions** → **Build and Push AWS EUM v3 Docker Image** → **Run workflow**

### Version Bump

**Manual Workflow:** Go to **Actions** → **Version Bump and Release** → **Run workflow**

Choose:
- **Bump type:** patch, minor, or major
- **Application:** AWS_EUM

This workflow automatically:
1. Bumps version in `package.json`
2. Updates `server.js` and `Dockerfile`
3. Creates a changelog entry
4. Commits changes
5. Creates a Git tag
6. Creates a GitHub Release
7. Triggers Docker build

### Pull Request Checks

**Trigger:** Any PR to `main` or `develop`

Automated checks:
- ✅ Node.js syntax validation
- ✅ Version consistency check
- ✅ Required files verification
- ✅ Docker build test

## Version Management

### Version Number Format

We use **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR** - Breaking changes
- **MINOR** - New features (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

### Consistency Requirements

Version must be consistent in:
1. `package.json` → `"version": "3.0.7"`
2. `server.js` → `const APP_VERSION = '3.0.7';`
3. `Dockerfile` → `version="3.0.7"`

**Automated:** Use the "Version Bump and Release" workflow to ensure consistency.

**Manual:** Update all three files before committing.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **perf:** Performance improvements
- **test:** Adding/updating tests
- **chore:** Maintenance tasks
- **ci:** CI/CD changes

### Examples

```bash
feat(api): add SMS delivery status endpoint

fix(ui): resolve chart expansion issue
Fixes #123

docs(readme): update installation instructions

chore(deps): upgrade express to v4.18.2
```

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Buildx
- Git

### Local Development

```bash
# Clone repository
git clone https://github.com/N85UK/UNRAID_Apps.git
cd UNRAID_Apps/Apps/AWS_EUM

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with your AWS credentials

# Start development server
npm start

# Or use Docker
docker-compose up
```

### Testing

```bash
# Syntax check
node -c server.js

# Run application
npm start

# Build Docker image
docker build -t aws-eum-v3:test .

# Test Docker image
docker run -p 80:80 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e AWS_REGION=eu-west-2 \
  aws-eum-v3:test
```

## Code Style Guidelines

### JavaScript

- Use `const` for constants, `let` for variables
- Use arrow functions for callbacks
- Use template literals for strings
- Add JSDoc comments for functions
- Use meaningful variable names
- Keep functions small and focused

### Docker

- Use official base images
- Run as non-root user
- Multi-stage builds for optimization
- Add health checks
- Use .dockerignore

### Documentation

- Keep README.md up to date
- Document environment variables
- Add inline comments for complex logic
- Update CHANGELOG.md for releases

## Pull Request Guidelines

### Before Submitting

- [ ] Run syntax check: `node -c server.js`
- [ ] Test locally with Docker
- [ ] Update documentation
- [ ] Check version consistency
- [ ] Write meaningful commit messages
- [ ] Add tests if applicable

### PR Template

Fill out all sections in the PR template:
- Description of changes
- Type of change
- Testing performed
- Version information
- Screenshots (if UI changes)

### Review Process

1. Automated checks must pass
2. At least one maintainer approval required
3. No merge conflicts
4. Documentation updated
5. Version bumped (if applicable)

## Release Checklist

- [ ] All tests passing
- [ ] Version bumped appropriately
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Docker image builds successfully
- [ ] Tested in production-like environment
- [ ] Git tag created
- [ ] GitHub Release created
- [ ] Docker image pushed to registry

## Getting Help

- **Issues:** Create a GitHub issue
- **Discussions:** Use GitHub Discussions
- **Security:** See SECURITY.md

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing! 🎉
