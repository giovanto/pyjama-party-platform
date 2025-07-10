# 🤖 Claude Context Summary for V3 Development

> **FOR NEXT SESSION**: This document provides complete context for continuing V3 development when Claude loses conversation history.

## 📍 **Current State & Branch Info**

**Active Branch**: `v3-nextjs-implementation`  
**Created**: July 10, 2025  
**Purpose**: Migrate V1 production-ready features to Next.js architecture

```bash
# To continue development:
git checkout v3-nextjs-implementation
# All documentation is in this branch
```

## 🎯 **Project Overview**

**Goal**: Create V3 (Next.js) by combining:
- **V1 Strengths**: Production-ready features, complete UI/UX, working locally with great graphics
- **V2 Improvements**: Modern React/TypeScript architecture, testing framework, Supabase integration

**Migration Strategy**: Direct V1 → V3 (skip V2 completion)

## 📊 **Version Analysis Summary**

### **V1 (Production Ready)**
- **Location**: `v1/` folder
- **Tech**: Vanilla HTML/CSS/JavaScript + Express + SQLite
- **Status**: ✅ Complete and polished
- **Features**: All working perfectly with excellent UX
- **Assets**: `v1/frontend/assets/bot-logo.svg`

### **V2 (Incomplete)**
- **Location**: `src/` folder  
- **Tech**: Vite + React + TypeScript + Supabase
- **Status**: ❌ Incomplete (missing styling, features)
- **Value**: Architecture patterns and testing setup

### **V3 (Target)**
- **Tech**: Next.js 15 + React 19 + TypeScript + Supabase + Tailwind
- **Timeline**: 14 weeks (refined from 10)
- **Requirement**: 100% V1 feature parity

## 📋 **Key Documentation Files**

1. **`V3_IMPLEMENTATION_GUIDE.md`** - Complete 14-week development plan
2. **`V1_FEATURE_INVENTORY.md`** - Every V1 feature that must be preserved
3. **`CLAUDE_CONTEXT_SUMMARY.md`** - This file (session context)

## 🏗️ **V3 Architecture Decisions**

**Technology Stack**:
```
Frontend: Next.js 15 + React 19 + TypeScript
Styling: Tailwind CSS + CSS Modules (for V1 animations)
Database: Supabase (PostgreSQL with RLS)
Maps: Mapbox GL JS (same as V1)
Deployment: Vercel
Testing: Vitest + Testing Library + Playwright
State: React Context + Custom Hooks
```

**Project Structure**:
```
pajama-party-v3/
├── src/app/          # Next.js App Router
├── components/       # React components  
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
├── styles/          # Component styles
└── types/           # TypeScript types
```

## 🎯 **Critical V1 Features to Preserve**

### **Must-Have Components**:
1. **Event Banner** - Countdown to Sept 26, 2025
2. **Dream Form** - Name, origin station (autocomplete), destination, email
3. **Interactive Map** - Mapbox with origins, destinations, connecting lines
4. **Floating Navigation** - Scroll-triggered, section highlighting
5. **Community Stats** - Total dreams, active stations, communities forming
6. **Dreamers List** - Recent submissions with auto-refresh
7. **Discord Integration** - Community buttons and messages

### **Critical V1 Files to Reference**:
- `v1/frontend/index.html` - Complete HTML structure
- `v1/frontend/styles/main.css` - Brand colors and base styles
- `v1/frontend/styles/improvements.css` - Animations and interactions
- `v1/frontend/scripts/main.js` - PajamaPartyApp class
- `v1/frontend/scripts/form.js` - PajamaPartyForm class
- `v1/frontend/scripts/map.js` - PajamaPartyMap class
- `v1/frontend/scripts/api.js` - PajamaPartyAPI class
- `v1/backend/server.js` - Express + SQLite server

### **Critical V1 API Endpoints**:
```
GET  /api/dreams          # Get all dreams for map
POST /api/dreams          # Submit new dream  
GET  /api/stations/search # Station autocomplete
GET  /api/stats           # Platform statistics
GET  /api/community/:station # Community info
GET  /api/health          # Health check
```

## 📅 **14-Week Timeline Overview**

**Phase 1 (Weeks 1-2)**: Foundation - Next.js setup, configuration, design system  
**Phase 2 (Weeks 3-4)**: Core Components - Layout, header, floating nav, event banner  
**Phase 3 (Weeks 5-6)**: Form System - Dream form, validation, autocomplete  
**Phase 4 (Weeks 7-8)**: Map Integration - Mapbox, data visualization  
**Phase 5 (Weeks 9-10)**: Community Features - Stats, dreamers list, Discord  
**Phase 6 (Weeks 11-12)**: API Layer - Next.js routes, Supabase integration  
**Phase 7 (Weeks 13-14)**: Styling & Polish - V1 design replication  
**Phase 8 (Week 14)**: Production Deployment - Vercel, monitoring

## 🔑 **Critical Implementation Details**

### **V1 Brand Colors** (Must preserve exactly):
```css
--color-primary: #008f39;      /* BoT Green */
--color-secondary: #92d051;    /* BoT Light Green */  
--color-accent: #2271b3;       /* BoT Blue */
--color-dark: #1a1a1a;         /* Dark Text */
```

### **V1 Timing Values** (Critical for UX):
- Autocomplete debounce: 300ms
- Scroll debounce: 100ms  
- Dreamers list refresh: 30 seconds
- Stats refresh: 60 seconds
- Countdown update: 1 hour
- API timeout: 30 seconds

### **V1 Database Schema** (Port to Supabase):
```sql
-- Dreams table (30-day expiration)
-- Stations table (autocomplete data)
-- Stats table (platform metrics)
```

### **V1 Configuration** (Environment variables):
```
MAPBOX_ACCESS_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## 🧪 **Testing Strategy**

**Component Tests**: All React components with V1 behavior validation  
**E2E Tests**: Complete user journeys matching V1 exactly  
**Performance Tests**: Lighthouse scores ≥90, load time ≤ V1  
**Visual Tests**: Pixel-perfect comparison with V1

## 🚀 **Deployment Strategy**

**Platform**: Vercel (optimized for Next.js)  
**Database**: Supabase production instance  
**Domain**: TBD (current: pajama-party.back-on-track.eu)  
**Monitoring**: Error tracking and performance monitoring

## ⚠️ **Critical Success Factors**

1. **Zero Feature Loss** - Every V1 feature must work identically
2. **Pixel Perfect Design** - V1 styling must be replicated exactly  
3. **Performance Parity** - V3 must be as fast or faster than V1
4. **Comprehensive Testing** - 90%+ coverage, E2E validation
5. **Phased Development** - Complete each phase fully before next

## 🎯 **Immediate Next Steps**

When starting the next session:

1. **Review Documentation**: Read `V3_IMPLEMENTATION_GUIDE.md` completely
2. **Examine V1**: Study all V1 files to understand current implementation
3. **Start Phase 1**: Create Next.js project following the guide
4. **Test Setup**: Verify all tools and dependencies work
5. **Follow Timeline**: Stick to the 14-week plan for success

## 💡 **Key Insights from Analysis**

- **V1 is actually excellent** - Don't underestimate its quality
- **V2 has good patterns** - Use its architecture concepts  
- **Direct migration is best** - Avoid V1→V2→V3 complexity
- **14 weeks is realistic** - With proper planning and execution
- **Documentation is critical** - These files are your blueprint

## 📞 **User Expectations**

**User (Giovanni) wants**:
- V3 with Next.js for production deployment on Vercel
- Combine V1's production-ready polish with V2's modern architecture  
- Complete feature preservation - nothing lost from V1
- Professional, scalable codebase for long-term maintenance
- Perfect user experience matching V1's quality

**User is ready to start development in next session using this documentation as the guide.**

---

**This summary provides all context needed to continue V3 development without missing any critical details from the analysis session!** 🎯