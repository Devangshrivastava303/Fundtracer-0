# Contributing to FundTracer

Thank you for your interest in contributing to FundTracer! We welcome contributions from everyone.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/fundtracer.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "feat: add your feature"`
6. Push to your branch: `git push origin feature/your-feature-name`
7. Create a Pull Request

## 📋 Commit Message Guidelines

Use conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Example:
```
feat(auth): add JWT token refresh endpoint

Implements automatic token refresh mechanism for improved user experience.

Closes #123
```

## 🎯 Code Style

### Python (Backend)
- Follow PEP 8
- Use 4 spaces for indentation
- Use type hints where possible
- Run `black` for formatting

### JavaScript/TypeScript (Frontend)
- Use ESLint configuration provided
- Use Prettier for formatting
- Follow React best practices
- Use TypeScript for type safety

## ✅ Before Submitting a PR

- [ ] Code follows project style guidelines
- [ ] Tests pass: `python manage.py test` (backend) or `npm test` (frontend)
- [ ] No console errors or warnings
- [ ] Commit messages are clear and descriptive
- [ ] Documentation is updated if needed

## 🐛 Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Python/Node version, etc.)

## 💡 Suggesting Features

Feature suggestions should include:
- Clear description of the feature
- Why it would be useful
- Possible implementation approach
- Any relevant examples or mockups

## 📚 Code Review Process

1. Maintainers will review your PR
2. Feedback and change requests may be provided
3. Once approved, your PR will be merged
4. Your contribution will be recognized

## ❓ Questions?

Feel free to open an issue or discussion if you have questions!

---

Thank you for contributing to FundTracer! 🙏
