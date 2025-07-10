# 🚂 Pajama Party Platform - Back-on-Track Action Group

> **Grassroots European activism platform for coordinating synchronized pajama parties across train stations to advocate for sustainable night train networks**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giovanto/pajama-party-platform&project-name=pajama-party&env=NEXT_PUBLIC_MAPBOX_TOKEN,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com)

## 🌟 **September 26th, 2025: European Pajama Party Event**

*"Where would you like to wake up tomorrow?"*

The Pajama Party Platform coordinates **synchronized pajama parties across European train stations** on September 26th, 2025 (19:00-20:00 CEST). This grassroots activism tool serves the Back-on-Track Action Group's mission to advocate for sustainable night train networks through community engagement.

### 🎯 **Two-Tier Engagement System**

**Tier 1: Dream Journey Mapping (Open to All)**
- 🗺️ **Interactive Map** - Visualize dream night train routes across Europe
- 🚂 **Station Search** - Autocomplete for European train stations
- 👥 **Community Building** - Track interest levels by station
- 📊 **Real-time Tracking** - Monitor participation and route popularity

**Tier 2: Event Participation (Email Signup)**
- 🎉 **Critical Mass Detection** - Automatic identification of stations with 2+ participants
- 🎵 **Silent Disco Coordination** - Europe-wide synchronized music listening
- 📹 **Cross-Station Video** - Eurovision-style connectivity between participating stations
- 📋 **Resource Access** - 2025 Party Kit and coordination materials

## 🚀 **Live Demo**

🔗 **[Join the movement →](https://pajama-party-platform.vercel.app)**

![Pajama Party Platform Screenshot](https://via.placeholder.com/800x400/22c55e/ffffff?text=Night+Train+Map+%2B+Community+Features)

## ✨ **Key Features**

### 🗺️ **Interactive European Map**
- Real-time visualization of dream routes
- Station search with autocomplete
- Mapbox integration with smooth animations
- Coordinate-based route planning

### 🚂 **Dream Route Submission**
- Smart station autocomplete
- Coordinate lookup and validation
- Personal story collection
- Email community building

### 👥 **Community Features**
- Real-time campaign statistics
- Top requested routes tracking
- Recent activity feed
- Pajama party organization tools

### 📱 **Modern User Experience**
- Responsive design for all devices
- Smooth animations with Framer Motion
- Accessibility-first components
- Progressive Web App capabilities

## 🛠️ **Tech Stack**

**Frontend & Framework**
- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [React 19](https://reactjs.org/) - Latest React with modern features
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling

**Backend & Database**
- [Supabase](https://supabase.com) - PostgreSQL database with real-time features
- [Vercel](https://vercel.com) - Serverless deployment and API routes
- Modern authentication and Row Level Security

**Mapping & Visualization**
- [Mapbox GL JS](https://mapbox.com) - Interactive maps and routing
- Custom route visualization
- European train station database

**Animation & UX**
- [Framer Motion](https://framer.com/motion) - Smooth animations
- [Headless UI](https://headlessui.dev/) - Accessible components
- Responsive design patterns

## 🚀 **Quick Start**

### 1. **One-Click Deployment**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giovanto/pajama-party-platform&project-name=pajama-party&env=NEXT_PUBLIC_MAPBOX_TOKEN,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 2. **Local Development**

```bash
# Clone the repository
git clone https://github.com/giovanto/pajama-party-platform.git
cd pajama-party-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run database setup
# See docs/SETUP.md for Supabase configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

### 3. **Environment Variables**

```bash
# Required
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 📖 **Documentation**

- 🚀 **[Deployment Guide](./DEPLOYMENT_READY.md)** - Production deployment
- 🔧 **[Development Setup](./SUPABASE_SETUP.md)** - Local development
- 🗄️ **[Database Schema](./setup-database.sql)** - Database structure
- 🧪 **[Testing Guide](./tests/)** - Running tests
- 📊 **[Monitoring](./PRODUCTION_MONITORING.md)** - Production monitoring

## 🧪 **Testing**

```bash
# Run all tests
npm run test:all

# Integration tests only
npm run test:supabase

# API tests only  
npm run test
```

**Current Test Coverage:**
- ✅ 6/6 integration tests passing
- ✅ Database connectivity
- ✅ API endpoints
- ✅ Form submission workflow
- ✅ Station search autocomplete

## 🌍 **Community Impact**

> *"Night trains can reduce aviation emissions by up to 90% for medium-distance European travel"*

### 📊 **Campaign Metrics** *(Example)*
- **🚂 Dream Routes:** 247 submitted
- **👥 Active Dreamers:** 189 community members  
- **🎉 Pajama Parties:** 12 organized across Europe
- **🌍 Countries:** 15+ European countries represented

### 🎯 **Goals**
- **1,000 dream routes** to demonstrate demand
- **500 active community members** advocating for night trains
- **50 pajama parties** at key European train stations
- **Policy impact** through grassroots community action

## 🤝 **Contributing**

We welcome contributions from developers, designers, and climate activists!

### 🛠️ **Development**
- 🐛 [Report bugs](https://github.com/giovanto/pajama-party-platform/issues)
- 💡 [Request features](https://github.com/giovanto/pajama-party-platform/issues)
- 🔧 [Submit pull requests](https://github.com/giovanto/pajama-party-platform/pulls)

### 🌱 **Activism**
- 🚂 Submit your dream night train routes
- 🎉 Organize pajama parties in your city
- 📢 Share the platform with your network
- 🌍 Join the movement for sustainable transport

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🙏 **Acknowledgments**

- **[Back-on-Track](https://back-on-track.eu)** - European night train advocacy
- **Climate activists** across Europe fighting for sustainable transport  
- **Open source community** making tools like Next.js, Supabase, and Mapbox
- **Night train dreamers** who believe in a better way to travel

---

### 🚂 **Ready to dream about your next night train journey?**

**[Join the Movement →](https://pajama-party-platform.vercel.app)**

*Built with ❤️ for the climate and 🚂 for sustainable travel*