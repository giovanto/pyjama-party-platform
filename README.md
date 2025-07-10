# Pajama Party Platform - European Train Adventure Dreams

A platform for organizing pajama parties to advocate for European night trains.

## Version Structure

- **v1/** - Legacy vanilla HTML/CSS/JS implementation (reference)
- **Current directory** - v2 React + TypeScript implementation (active development)
- **Future v3** - Next.js migration (planned for `v3-nextjs` branch)

## Active Version: v2 (React + TypeScript)

This is the current React + TypeScript implementation with modern architecture.

### Features

- 🎉 **Event Banner** with countdown timer for September 26, 2025
- 🧭 **Floating Navigation** with scroll-based activation
- 🗺️ **Interactive Map** with Mapbox GL integration
- 📝 **Dream Form** with station autocomplete and validation
- 👥 **Community Features** with Back-on-Track action group integration
- 📊 **Statistics Dashboard** with real-time data
- 🎨 **Brand-consistent Design** with Back-on-Track colors and animations

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS Custom Properties + Tailwind utilities  
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS
- **Testing**: Vitest, React Testing Library, MSW
- **Deployment**: Vercel

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Mapbox credentials

# Set up database
npm run db:setup
npm run db:import

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Project Structure

```
├── src/
│   ├── components/          # React components
│   │   ├── EventBanner/     # Event promotion with countdown
│   │   ├── FloatingNav/     # Floating navigation
│   │   ├── Forms/           # Dream form and station search
│   │   ├── Map/             # Mapbox integration
│   │   ├── Community/       # Stats and messaging
│   │   ├── CommunityFeatures/ # Action group integration
│   │   └── Layout/          # Header, Footer, Layout
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   └── styles/              # CSS files
├── api/                     # Vercel serverless functions
├── scripts/                 # Database and utility scripts
└── v1/                      # Legacy implementation (reference)
```

### Key Components

#### EventBanner
Promotes the Europe-wide pajama party event with live countdown timer.

#### FloatingNav  
Smooth scroll navigation that appears/disappears based on scroll direction and highlights active sections.

#### CommunityFeatures
Detailed information about Back-on-Track action group with integration for joining and organizing.

#### Map Integration
Interactive European map showing dream destinations with proper clustering and popups.

### Development

```bash
# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format
```

### Deployment

The project is configured for Vercel deployment with automatic builds on push to main branch.

```bash
# Deploy to Vercel
vercel --prod
```

### Branch Strategy

- `main` - v1 production (vanilla implementation)
- `v2-development` - v2 React implementation (current)
- `v3-nextjs` - Future Next.js migration

---

## v1 Reference (Legacy)

The v1 implementation in `v1/` contains the original vanilla HTML/CSS/JS version with:
- Custom CSS animations and interactions
- Vanilla JavaScript form handling
- Direct Mapbox GL integration
- Node.js backend with SQLite

This serves as reference for feature parity and visual design consistency.

---

**Built with ❤️ for sustainable European travel**

Part of the [Back-on-Track](https://back-on-track.eu) movement for European night trains.