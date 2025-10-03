# Contributing to UNRAID File Manager Plugin

Thank you for considering contributing to the UNRAID File Manager Plugin! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues
1. **Search existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information**:
   - UNRAID version
   - Plugin version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error logs if applicable

### Suggesting Features
1. **Check the roadmap** to see if it's already planned
2. **Create a feature request** with detailed description
3. **Explain the use case** and benefits
4. **Consider implementation complexity**

### Code Contributions

#### Prerequisites
- Node.js 18+
- TypeScript knowledge
- Basic understanding of NestJS framework
- Familiarity with UNRAID plugin development

#### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/unraid-file-manager.git
cd unraid-file-manager

# Install dependencies
npm install

# Start development mode
npm run dev

# Run tests
npm test
```

#### Pull Request Process
1. **Fork the repository** and create a feature branch
2. **Make your changes** following our coding standards
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass**
6. **Submit a pull request** with clear description

## 📝 Coding Standards

### TypeScript Guidelines
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper type annotations
- Follow naming conventions (camelCase, PascalCase)

### Code Style
- Use Prettier for formatting
- Follow ESLint rules
- Write meaningful variable and function names
- Add JSDoc comments for public APIs

### Testing
- Write unit tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies

## 🏗️ Project Structure

```
src/
├── unraid-api/           # Main API module
│   └── modules/
│       └── filemanager/  # File manager functionality
│           ├── auth/     # Authentication & authorization
│           ├── proxy/    # API proxy and middleware
│           └── utils/    # Utility functions
├── webgui/              # PHP web interface files
└── assets/              # Static assets (CSS, images)
```

## 🎯 Development Guidelines

### Backend Development
- Use NestJS decorators and patterns
- Implement proper error handling
- Add logging for debugging
- Follow RESTful API principles

### Frontend Development
- Use modern CSS features
- Ensure mobile responsiveness
- Follow accessibility guidelines
- Test across different browsers

### Security Considerations
- Validate all inputs
- Use proper authentication
- Implement rate limiting
- Sanitize file operations

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.guard.spec.ts

# Generate coverage report
npm run test:coverage
```

### Test Types
- **Unit Tests**: Test individual functions/classes
- **Integration Tests**: Test API endpoints and workflows
- **E2E Tests**: Test complete user scenarios

## 📚 Documentation

### Code Documentation
- Use JSDoc for public APIs
- Include examples in documentation
- Update README for new features
- Keep changelog current

### User Documentation
- Update installation instructions
- Add configuration examples
- Include troubleshooting tips
- Provide usage screenshots

## 🔄 Release Process

### Version Numbering
We use semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
1. Update version in package.json
2. Update CHANGELOG.md
3. Run full test suite
4. Build and test plugin
5. Create GitHub release
6. Update documentation

## 🆘 Getting Help

### Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **UNRAID Forums**: Community support

### Response Times
- **Bug reports**: 1-3 days
- **Feature requests**: 1-7 days
- **Pull requests**: 2-5 days

## 📋 Issue Templates

### Bug Report Template
```markdown
**Bug Description**
A clear description of the bug.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Environment**
- UNRAID Version: [e.g. 6.12.3]
- Plugin Version: [e.g. 1.0.0]
- Browser: [e.g. Chrome 118]

**Additional Context**
Add any other context about the problem here.
```

### Feature Request Template
```markdown
**Feature Description**
A clear description of the feature you'd like to see.

**Use Case**
Explain why this feature would be useful.

**Proposed Solution**
Describe how you envision this feature working.

**Alternative Solutions**
Any alternative approaches you've considered.

**Additional Context**
Add any other context or screenshots about the feature request.
```

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special thanks in major releases

Thank you for contributing to making UNRAID file management better! 🚀