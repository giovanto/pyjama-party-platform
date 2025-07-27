# Development Guide

## Local Development Setup

### Prerequisites
- Node.js 20+ 
- PostgreSQL 15+
- Git

### Quick Setup
```bash
# Clone repository
git clone [repository-url]
cd pajama-party-platform

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local
# Edit .env.local with your credentials

# Database setup
npm run db:setup

# Start development server
npm run dev
```

## Environment Variables

Create `.env.local` with:

```bash
# Required for development
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token
DATABASE_URL=postgresql://user:pass@localhost:5432/pyjama_party_dev
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional for full functionality
OPENRAILMAPS_API_KEY=your_openrailmaps_key
SENTRY_DSN=your_sentry_dsn
```

## Development Workflow

### Code Structure
Follow the established patterns in `src/`:
- Components in `src/components/[category]/`
- API routes in `app/api/[endpoint]/`
- Types in `src/types/`
- Utilities in `src/lib/`

### Git Workflow
```bash
# Feature development
git checkout -b feature/your-feature-name
git commit -m "feat: implement your feature"
git push origin feature/your-feature-name

# Create PR for review
```

### Testing
```bash
# Unit tests
npm run test

# Integration tests  
npm run test:api

# E2E tests
npm run test:e2e

# Run all tests
npm run test:all
```

## Architecture Implementation

### Page Structure
Based on the progressive disclosure design:
1. `/` - Map-centric homepage
2. `/dream/:placeId` - Destination showcase
3. `/connect/:placeId` - Train route planning
4. `/pyjama-party` - Movement information
5. `/participate` - Conversion form
6. `/community` - Post-conversion engagement

### API Design
RESTful endpoints following the documented schema:
- `GET /api/places/search` - Search European destinations
- `GET /api/stations/search` - Search train stations
- `POST /api/dreams` - Submit dream routes
- `GET /api/content/:type` - Multilingual content

### Database Schema
PostgreSQL with JSONB for multilingual content:
- `places` - TripHop destinations with translations
- `stations` - OpenRailMaps train station data
- `dreams` - User submitted routes
- `content` - CMS content with translations

## Key Development Principles

### Progressive Disclosure
Each page should focus on one primary action:
- Homepage: Place selection only
- Dream page: Inspiration + subtle movement intro
- Connect page: Route planning + benefits
- Info page: Full movement explanation
- Form page: Simple conversion

### Multilingual First
All user-facing content must be translatable:
- Use JSONB for database content
- Implement `getLocalizedContent()` helper
- Test with multiple languages

### Performance First
- Use Next.js Image component for all images
- Implement proper caching strategies
- Monitor Core Web Vitals

### Privacy First
- Minimal data collection
- GDPR compliance by design
- Clear consent mechanisms

## Common Tasks

### Adding a New Page
1. Create page in `app/[route]/page.tsx`
2. Add metadata export for SEO
3. Implement responsive design
4. Add to navigation if needed
5. Write tests

### Adding API Endpoint
1. Create route in `app/api/[endpoint]/route.ts`
2. Implement validation with Zod
3. Add error handling
4. Write API tests
5. Update documentation

### Adding Multilingual Content
1. Update database schema if needed
2. Add content keys to admin interface
3. Implement translation workflow
4. Test with multiple languages
5. Update content migration scripts

### Performance Optimization
1. Analyze with Lighthouse
2. Optimize images and assets
3. Implement caching where appropriate
4. Monitor Core Web Vitals
5. Test on mobile devices

## Troubleshooting

### Common Issues
- **Map not loading**: Check Mapbox token
- **Database connection**: Verify DATABASE_URL
- **Build errors**: Check TypeScript types
- **Test failures**: Ensure test database is set up

### Debug Mode
```bash
# Enable debug logging
DEBUG=true npm run dev

# Database query logging
DATABASE_LOGGING=true npm run dev
```

### Performance Debugging
```bash
# Bundle analysis
npm run analyze

# Performance profiling
npm run dev -- --profile
```

## Contributing Guidelines

### Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Use meaningful commit messages

### Testing Requirements
- Write tests for new features
- Maintain test coverage above 80%
- Test multilingual functionality
- Include E2E tests for user journeys

### Documentation
- Update this guide for new processes
- Document API changes
- Include examples in code comments
- Update architecture docs for major changes

## Resources

- [System Architecture](SYSTEM_ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Project Roadmap](../ROADMAP.md)