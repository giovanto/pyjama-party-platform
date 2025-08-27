# 🚂 European Night Train Advocacy Platform

> **Where would you like to wake up tomorrow?**
>
> A progressive disclosure platform that transforms destination inspiration into climate activism, organizing the September 26, 2025 Europe-wide Pajama Party for night trains.

[![Platform](https://img.shields.io/badge/Platform-Production_Ready-green)]()
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)
[![Multilingual](https://img.shields.io/badge/Languages-EN_DE_FR-blue)]()

## 🎯 **Platform Purpose**

The **Pajama Party Platform** serves the [Back-on-Track Action Group](https://back-on-track.eu) by converting European travel dreams into climate activism through a carefully designed progressive disclosure user journey:

1. **Inspiration**: Interactive map with 726 European destinations
2. **Aspiration**: Beautiful destination showcases with climate benefits
3. **Connection**: Train route planning with OpenRailMaps integration
4. **Education**: Introduction to the night train revival movement
5. **Participation**: September 26, 2025 pajama party registration
6. **Community**: Post-conversion engagement and organizing

## 🌍 **September 26, 2025: European Pajama Party**

Synchronized pajama parties at train stations across Europe, featuring:
- 🎧 **Silent Disco**: Synchronized music across all participating stations
- 📺 **Live Streams**: Eurovision-style connectivity between cities
- 🌱 **Climate Action**: Advocacy for sustainable European transport
- 🎪 **Community Power**: Grassroots organizing for night train networks

## 🏗️ **Architecture Overview**

### **Progressive Disclosure User Journey**
```
Map Inspiration → Dream Destination → Train Connection → Movement Info → Participation → Community
```

### **Technology Stack**
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Mapbox GL JS with TripHop places data (726 European destinations)
- **Train Data**: OpenRailMaps API integration for station information
- **Deployment**: Linux server at `pyjama-party.back-on-track.eu`

### **Multilingual Support**
- **Phase 1**: English, German, French
- **Phase 2**: Spanish, Italian, Dutch  
- **Phase 3**: Portuguese, Polish, Czech
- **Implementation**: JSONB database storage + Next.js i18n

## 📁 **Project Structure**

```
pajama-party-platform/
├── 📋 Project Documentation
│   ├── docs/SYSTEM_ARCHITECTURE.md     # Complete system design
│   ├── docs/DEPLOYMENT_GUIDE.md        # Production deployment
│   └── docs/DEVELOPMENT_GUIDE.md       # Development workflow
│
├── 🗄️ Database & Data
│   ├── data/places-setup.sql           # TripHop places schema
│   ├── data/triphop-places.json        # 726 European destinations
│   └── setup-database.sql              # Current schema (legacy)
│
├── 🌐 Application
│   ├── app/                            # Next.js 14 app router
│   │   ├── page.tsx                    # Map-centric homepage
│   │   ├── dream/[placeId]/page.tsx    # Destination showcase
│   │   └── api/                        # RESTful API endpoints
│   │
│   ├── src/components/                 # React components
│   │   ├── map/PlaceSelectionMap.tsx   # Interactive map
│   │   ├── forms/DreamForm.tsx         # Participation forms
│   │   └── layout/                     # Header, nav, footer
│   │
│   └── src/lib/                        # Utilities & config
│
├── 🧪 Testing
│   ├── tests/e2e/                      # Playwright E2E tests
│   ├── tests/api/                      # API integration tests
│   └── tests/components/               # Component unit tests
│
└── 🛠️ Scripts & Config
    ├── scripts/fetch-places.js         # TripHop data fetcher
    └── [config files]                  # Next.js, Tailwind, etc.
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 20+ 
- PostgreSQL 15+
- Mapbox account (for maps)
- Supabase project (for database)

### **Installation**
```bash
# Clone and install
git clone [repository-url]
cd pajama-party-platform
npm install

# Environment setup
cp .env.example .env.local
# Add your API keys (see docs/DEPLOYMENT_GUIDE.md)

# Database setup
psql -d your_database < data/places-setup.sql

# Development server
npm run dev
```

### **Environment Variables**
```bash
# Required
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_token
DATABASE_URL=postgresql://user:pass@localhost:5432/pyjama_party
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional
OPENRAILMAPS_API_KEY=your_key
SENTRY_DSN=your_sentry_dsn
```

## 📊 **Core Features**

### **🗺️ Interactive Destination Map**
- 726 European places from TripHop data
- Search functionality with autocomplete
- Responsive design with touch optimization
- Beautiful imagery and descriptions

### **🚂 Train Route Planning**
- OpenRailMaps integration for station data
- Route visualization and feasibility
- Climate impact calculations
- Sustainable travel advocacy

### **🎉 Event Coordination**
- Participation level selection (dream only, join party, organize)
- Critical mass detection for stations
- Discord community integration
- Organizer resource distribution

### **🌐 Multilingual Content**
- Database-driven translations
- Localized URLs and SEO
- Cultural adaptation for different regions
- Translation management interface

## 🧪 **Testing Strategy**

```bash
# Unit tests (Vitest)
npm run test

# Integration tests
npm run test:api

# End-to-end tests (Playwright)
npm run test:e2e

# Performance testing
npm run test:performance
```

## 📈 **Deployment**

The platform is designed for deployment at `pyjama-party.back-on-track.eu`:

```bash
# Production build
npm run build

# Deploy to server
npm run deploy

# See docs/DEPLOYMENT_GUIDE.md for complete instructions
```

## 📋 **Development Status**

### **✅ Completed**
- [x] System architecture design
- [x] Database schema with multilingual support
- [x] TripHop places data integration (726 destinations)
- [x] Progressive disclosure user journey design
- [x] Testing strategy framework

### **🚧 In Progress**
- [ ] Core page implementations
- [ ] API endpoint development  
- [ ] OpenRailMaps integration
- [ ] Multilingual content system
- [ ] Form validation and error handling

### **📋 Planned**
- [ ] Production deployment pipeline
- [ ] Performance optimization
- [ ] SEO and social sharing
- [ ] Analytics and monitoring
- [ ] Community features

## 📚 **Documentation**

- **[System Architecture](docs/SYSTEM_ARCHITECTURE.md)**: Complete technical design
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)**: Production setup
- **[Development Guide](docs/DEVELOPMENT_GUIDE.md)**: Local development
- **[API Documentation](docs/API_REFERENCE.md)**: RESTful endpoints
- **[User Journey](docs/USER_JOURNEY.md)**: Progressive disclosure flow

## 🤝 **Contributing**

This platform serves the Back-on-Track Action Group's climate activism mission. See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

### **Key Principles**
- **Privacy First**: GDPR compliant, minimal data collection
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Core Web Vitals optimization
- **Sustainability**: Efficient hosting and green practices

## 📄 **License**

[License details - to be determined by Back-on-Track Action Group]

## 🌍 **Community**

- **Discord**: [Back-on-Track Community](https://discord.gg/wyKQZCwP)
- **Website**: [back-on-track.eu](https://back-on-track.eu)
- **Event Info**: September 26, 2025 Pajama Party

---

*Building the movement for sustainable European transport, one dream route at a time.*
