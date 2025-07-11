# Contributing to Pyjama Party Platform

> **Welcome to the grassroots climate activism community! 🌍🚂**

We're building a platform to advocate for sustainable European night trains through coordinated community action. Your contributions help create tools for meaningful environmental activism.

## 🎯 Mission

The Pyjama Party Platform serves the Back-on-Track Action Group's mission to build European night train networks through grassroots organizing. We believe in:

- **Inclusive activism**: Welcoming newcomers to climate action
- **Collaborative solutions**: Building together for systemic change
- **Sustainable transport**: Reducing aviation emissions through rail alternatives
- **European solidarity**: Connecting activists across borders

## 🚀 Quick Start

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
git clone https://github.com/YOUR-USERNAME/pyjama-party-platform.git
cd pyjama-party-platform
```

### 2. Development Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start development server
npm run dev
```

### 3. Create Your Feature
```bash
# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes
# ...

# Commit your changes
git add .
git commit -m 'feat: add amazing feature'

# Push to your fork
git push origin feature/amazing-feature
```

### 4. Submit Pull Request
- Open a Pull Request on GitHub
- Describe your changes clearly
- Reference any related issues
- Be ready to discuss and iterate

## 🛠️ Development Guide

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **Deployment**: Vercel

### Project Structure
```
pyjama-party-platform/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx           # Main page
│   └── layout.tsx         # App layout
├── src/
│   ├── components/        # React components
│   ├── lib/               # Utilities and configurations
│   └── styles/            # CSS and styling
├── public/                # Static assets
├── docs/                  # Documentation
├── tests/                 # Test files
└── scripts/               # Build and utility scripts
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:api
npm run test:supabase

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Format code
npm run format

# Type checking
npm run type-check
```

## 📝 Contribution Guidelines

### Code Standards
- **TypeScript**: Use strict typing for all new code
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes, avoid inline styles
- **Testing**: Write tests for new features
- **Accessibility**: Ensure ARIA labels and semantic HTML

### Naming Conventions
- **Files**: kebab-case for files and directories
- **Components**: PascalCase for React components
- **Functions**: camelCase for functions and variables
- **Constants**: UPPER_SNAKE_CASE for constants

### Commit Message Format
```
type(scope): brief description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(forms): add city autocomplete for dream routes
fix(api): handle missing station coordinates
docs(readme): update installation instructions
style(components): improve mobile responsiveness
```

## 🎨 Design Guidelines

### UI/UX Principles
- **Accessibility First**: Screen reader compatible, keyboard navigation
- **Mobile Responsive**: Touch-friendly interface for event coordination
- **Progressive Enhancement**: Works without JavaScript for basic features
- **Climate Messaging**: Emphasize environmental impact and activism

### Visual Identity
- **Colors**: Green (#008f39) for climate action, blue (#2271b3) for community
- **Typography**: Mark Pro font family for professional appearance
- **Icons**: Consistent icon system with clear meanings
- **Animation**: Smooth transitions that enhance rather than distract

## 🌍 Community Guidelines

### Code of Conduct
We follow the [Contributor Covenant](CODE_OF_CONDUCT.md). In summary:

- **Be respectful**: Use welcoming and inclusive language
- **Be collaborative**: Accept constructive criticism gracefully
- **Be supportive**: Help newcomers feel welcome
- **Be focused**: Keep discussions relevant to the project

### Climate Action Values
As a climate activism platform, we're committed to:

- **Environmental justice**: Ensuring equitable access to sustainable transport
- **Inclusive activism**: Welcoming people of all backgrounds to climate action
- **Collaborative solutions**: Building coalitions across organizations
- **Respectful dialogue**: Engaging constructively across different perspectives

### Communication Channels
- **GitHub Issues**: Bug reports, feature requests, and questions
- **Pull Requests**: Code contributions and reviews
- **Discord**: Real-time chat with the Back-on-Track Action Group
- **Email**: Direct contact for sensitive or private matters

## 🐛 Reporting Issues

### Bug Reports
When reporting bugs, please include:
- **Description**: What happened vs. what you expected
- **Steps to Reproduce**: Detailed steps to recreate the issue
- **Environment**: Browser, OS, device type
- **Screenshots**: Visual evidence if helpful
- **Error Messages**: Console errors or system messages

### Feature Requests
When requesting features, please include:
- **Problem**: What challenge are you trying to solve?
- **Solution**: How would you like this addressed?
- **Alternatives**: Other approaches you've considered
- **Use Case**: How would this benefit the climate activism mission?

## 🔒 Security

### Reporting Security Issues
Please report security vulnerabilities via email to security@back-on-track.eu rather than creating public issues. Include:
- **Description**: Nature of the security issue
- **Impact**: Potential consequences
- **Steps**: How to reproduce (if applicable)
- **Suggested Fix**: If you have ideas for resolution

### Security Best Practices
- **No Secrets**: Never commit API keys, passwords, or tokens
- **Input Validation**: Always validate user input
- **Dependencies**: Keep dependencies updated
- **Authentication**: Use secure authentication methods

## 📚 Resources

### Documentation
- **[Development Rules](docs/DEVELOPMENT_RULES.md)**: Comprehensive development guidelines
- **[API Documentation](docs/API.md)**: Complete API reference
- **[Architecture Overview](docs/ARCHITECTURE.md)**: System design and components
- **[Troubleshooting](docs/TROUBLESHOOTING.md)**: Common issues and solutions

### External Resources
- **[Back-on-Track](https://back-on-track.eu)**: Main organization website
- **[Next.js Docs](https://nextjs.org/docs)**: Framework documentation
- **[Supabase Docs](https://supabase.com/docs)**: Database and API documentation
- **[Mapbox Docs](https://docs.mapbox.com)**: Mapping and visualization

## 🏆 Recognition

### Contributors
We recognize contributors through:
- **GitHub Contributors**: Automatic recognition on repository
- **Changelog**: Major contributions noted in release notes
- **Community Highlights**: Featured in monthly Action Group updates
- **Climate Impact**: Connection to real-world environmental outcomes

### Becoming a Maintainer
Regular contributors may be invited to become maintainers with:
- **Commit Access**: Direct repository access
- **Issue Triage**: Help manage and prioritize issues
- **Code Review**: Review and approve pull requests
- **Community Building**: Help welcome and guide new contributors

## 🎉 Getting Started

Ready to contribute? Here are some good first issues:

1. **Documentation**: Improve setup instructions or add examples
2. **Translation**: Add support for additional European languages
3. **Testing**: Increase test coverage for components
4. **Accessibility**: Improve screen reader compatibility
5. **UI Polish**: Enhance mobile responsiveness

Look for issues labeled `good first issue` or `help wanted` to get started!

## 📞 Getting Help

Need help getting started?

- **GitHub Discussions**: Ask questions and share ideas
- **Discord**: Join the Back-on-Track Action Group Discord
- **Email**: Contact maintainers directly
- **Documentation**: Check our comprehensive docs

Remember: Everyone started as a beginner. We're here to help you succeed and make meaningful contributions to climate activism!

---

**Thank you for contributing to sustainable transport and climate action! 🌱🚂**