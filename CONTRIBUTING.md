# Contributing to Pajama Party Platform

Thank you for your interest in contributing to the Pajama Party Platform! This project is part of Back-on-Track's mission to bring back night trains across Europe through grassroots activism and community building.

## How to Contribute

### Reporting Issues

1. **Check existing issues** first to avoid duplicates
2. **Use the issue template** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce the problem
   - Expected vs actual behavior
   - Screenshots or videos if applicable
   - Your environment (OS, browser, Node.js version)

### Submitting Code Changes

1. **Fork the repository** and create a feature branch
2. **Follow the coding standards** (see below)
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Submit a pull request** with a clear description

### Development Setup

```bash
# Clone the repository
git clone https://github.com/back-on-track/pajama-party-platform.git
cd pajama-party-platform

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

### Coding Standards

- **JavaScript**: Use ES6+ features, follow ESLint configuration
- **HTML/CSS**: Use semantic HTML, follow BEM methodology for CSS
- **Commits**: Use conventional commit messages (feat:, fix:, docs:, etc.)
- **Code Style**: Run `npm run lint` before committing

### Community Guidelines

- **Be respectful** and inclusive in all interactions
- **Focus on the mission** of sustainable transport and community building
- **Follow the Code of Conduct** (see CODE_OF_CONDUCT.md)
- **Help others** learn and contribute

### Areas for Contribution

- **Frontend Development**: React/TypeScript, UI/UX improvements
- **Backend Development**: Node.js, API design, database optimization
- **Documentation**: User guides, API docs, translations
- **Testing**: Unit tests, integration tests, accessibility testing
- **Design**: Graphics, icons, user experience improvements

### Getting Help

- **Discord**: Join our community server for real-time help
- **Issues**: Create a "question" issue for technical help
- **Email**: Contact the maintainers directly for sensitive issues

### Release Process

1. **MVP Phase**: Basic functionality for Action Group demo
2. **Beta Phase**: Community testing and feedback
3. **Production**: Full launch for September 2025 pajama parties

## Project Structure

```
pajama-party-platform/
├── backend/           # Node.js server and API
├── frontend/          # HTML/CSS/JS frontend
├── docs/             # Documentation and guides
├── scripts/          # Development and deployment scripts
├── tests/            # Test files
└── data/             # Database and station data
```

## Recognition

Contributors will be recognized in:
- **CONTRIBUTORS.md** file
- **About page** on the platform
- **Action Group meetings** and presentations
- **Back-on-Track newsletter** and website

Thank you for helping make European night trains a reality! 🚂✨