# Contributing to UnRaid Apps

Thank you for your interest in contributing to the UnRaid Apps project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Standards](#development-standards)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be Respectful**: Treat all contributors with respect and kindness
- **Be Inclusive**: Welcome developers of all skill levels and backgrounds
- **Be Constructive**: Provide helpful feedback and suggestions
- **Be Patient**: Remember that everyone is volunteering their time
- **Be Professional**: Maintain a professional tone in all communications

## Getting Started

### Prerequisites

- Git installed on your development machine
- Node.js 20+ (LTS) for AWS EUM projects
- Docker for testing containers
- UNRAID server for testing (recommended)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/UnRiaid_Apps.git
   cd UnRiaid_Apps
   ```

## Development Setup

### AWS EUM Development

```bash
cd Apps/AWS_EUM
# Follow specific setup instructions in AWS_EUM/README.md
```

### Environment Configuration

Create a `.env` file in the appropriate project directory with required environment variables (see `.env.example` if available).

## Contributing Guidelines

### Types of Contributions

- **Bug Fixes**: Fix existing issues or bugs
- **Feature Enhancements**: Add new features or improve existing ones
- **Documentation**: Improve documentation, README files, or code comments
- **Testing**: Add or improve test coverage
- **Performance**: Optimize code for better performance
- **Security**: Address security vulnerabilities or improvements

### Before You Start

1. Check existing issues to avoid duplicate work
2. Create an issue to discuss major changes before implementation
3. Ensure your development environment is properly set up
4. Read the relevant documentation for the component you're working on

## Pull Request Process

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-number-description
```

### 2. Make Your Changes

- Follow the coding standards outlined below
- Write clear, concise commit messages
- Include tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

- Run existing tests: `npm test`
- Test on UNRAID if possible
- Verify plugin installation and functionality
- Check for any breaking changes

### 4. Update Documentation

- Update README.md if necessary
- Add or update code comments
- Update CHANGELOG.md with your changes
- Include any new environment variables or configuration

### 5. Submit Pull Request

- Push your branch to your fork
- Create a pull request with a clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Wait for review and address feedback

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass and new tests are included
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated
- [ ] No merge conflicts
- [ ] PR description clearly explains the changes

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

- **Environment**: UNRAID version, plugin version, browser
- **Steps to Reproduce**: Clear, numbered steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error logs or console output

### Feature Requests

For feature requests, please include:

- **Use Case**: Why is this feature needed?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other ways to achieve the goal
- **Additional Context**: Any other relevant information

## Development Standards

### Code Style

- **TypeScript/JavaScript**: Follow ESLint configuration
- **PHP**: Follow PSR-12 coding standards
- **Shell Scripts**: Follow Google Shell Style Guide
- **Indentation**: 2 spaces for JS/TS, 4 spaces for PHP
- **Naming**: Use camelCase for variables, PascalCase for classes

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

- `feat(plugin): add file upload progress indicator`
- `fix(webgui): resolve status display issue`
- `docs(readme): update installation instructions`

### Testing

- Write unit tests for new functions
- Include integration tests for major features
- Test on actual UNRAID systems when possible
- Verify plugin installation and uninstallation

### Security

- Never commit sensitive information (passwords, API keys)
- Validate all user inputs
- Follow secure coding practices
- Report security vulnerabilities privately

### Documentation

- Comment complex code logic
- Update README files for new features
- Include JSDoc comments for functions
- Provide examples for new APIs

## Plugin-Specific Guidelines

### AWS EUM Projects

- Implement proper CSRF protection
- Use background task queue for large operations

### AWS EUM

- Follow AWS best practices
- Implement proper IAM controls
- Use environment variables for configuration
- Include proper error handling and logging

## Getting Help

### Community Support

- GitHub Issues: For bug reports and feature requests
- GitHub Discussions: For questions and general discussion
- Code Review: All pull requests receive thorough review

### Resources

- [UNRAID Plugin Development Guide](https://unraid.net/community)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Recognition

Contributors are recognized in:

- CHANGELOG.md for significant contributions
- README.md acknowledgments
- GitHub contributors page

## License

By contributing to this project, you agree that your contributions will be licensed under the same MIT License that covers the project. See [LICENSE](LICENSE) file for details.

---

Thank you for contributing to UnRaid Apps! Your efforts help make UNRAID systems more powerful and user-friendly.
