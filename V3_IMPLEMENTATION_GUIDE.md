# 🚀 V3 Next.js Implementation Guide - Pajama Party Platform

> **CRITICAL**: This document contains the complete V1 → V3 migration plan. V1 is production-ready with excellent UI/UX. V2 has modern architecture but incomplete features. V3 combines the best of both.

## 📋 **Executive Summary**

**Goal**: Migrate from V1 (vanilla HTML/CSS/SQLite) to V3 (Next.js/TypeScript/Supabase) while preserving ALL V1 features and polish.

**Timeline**: 14 weeks (refined from original 10 weeks for quality assurance)
**Current Branch**: `v3-nextjs-implementation`
**Strategy**: Direct V1 → V3 migration with zero feature loss

## 🎯 **V1 Features That MUST Be Preserved**

### **Complete Feature Inventory**
- ✅ Dream submission form with real-time validation
- ✅ Station autocomplete with debounced search
- ✅ Interactive Mapbox map showing origins/destinations/lines
- ✅ Community stats (total dreams, active stations, communities)
- ✅ Real-time dreamers list with auto-refresh
- ✅ Countdown timer to September 26, 2025
- ✅ Floating navigation with scroll detection
- ✅ Event banner with pulse animation
- ✅ Discord community integration
- ✅ Success/error messaging with smooth animations
- ✅ Loading states for all async operations
- ✅ Offline detection and user feedback
- ✅ Responsive design with mobile optimization
- ✅ Back-on-Track brand colors and typography
- ✅ Accessibility features and focus states

### **V1 Technical Architecture (To Port)**
```
v1/
├── frontend/
│   ├── index.html              # Complete HTML structure
│   ├── styles/
│   │   ├── main.css           # Brand colors, typography, layout
│   │   └── improvements.css   # Animations, interactions
│   ├── scripts/
│   │   ├── main.js           # PajamaPartyApp class - app initialization
│   │   ├── form.js           # PajamaPartyForm class - form handling
│   │   ├── map.js            # PajamaPartyMap class - Mapbox integration
│   │   ├── api.js            # PajamaPartyAPI class - API client
│   │   └── config.js         # Configuration constants
│   └── assets/
│       └── bot-logo.svg      # Back-on-Track logo
└── backend/
    └── server.js             # Express + SQLite server
```

### **V1 Database Schema (SQLite)**
```sql
-- Dreams table
CREATE TABLE dreams (
  id TEXT PRIMARY KEY,
  dreamer_name TEXT NOT NULL,
  origin_station TEXT NOT NULL,
  origin_country TEXT,
  origin_lat REAL,
  origin_lng REAL,
  destination_city TEXT NOT NULL,
  destination_country TEXT,
  destination_lat REAL,
  destination_lng REAL,
  email TEXT,
  email_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);

-- Stations table
CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  type TEXT DEFAULT 'station',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stats table
CREATE TABLE stats (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **V1 API Endpoints (To Replicate)**
```javascript
GET  /api/dreams          // Get all dreams for map
POST /api/dreams          // Submit new dream
GET  /api/stations/search // Search stations (autocomplete)
GET  /api/stats           // Get platform statistics
GET  /api/community/:station // Get community info
GET  /api/health          // Health check
```

## 🏗️ **V3 Technology Stack**

```
Frontend: Next.js 15 + React 19 + TypeScript
Styling: Tailwind CSS + CSS Modules (for V1 animations)
Database: Supabase (PostgreSQL with RLS)
Maps: Mapbox GL JS (same as V1)
Deployment: Vercel
Testing: Vitest + Testing Library + Playwright
Quality: ESLint + Prettier + Husky
State: React Context + Custom Hooks
UI: Headless UI + Custom Components
```

## 📁 **V3 Project Structure**

```
pajama-party-v3/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API routes (port V1 backend)
│   │   │   ├── dreams/route.ts       # Dreams endpoint
│   │   │   ├── stations/search/route.ts # Station search
│   │   │   └── stats/route.ts        # Statistics
│   │   ├── globals.css               # Global styles + V1 CSS variables
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page (port V1 index.html)
│   ├── components/                   # React components
│   │   ├── ui/                       # Base components
│   │   │   ├── Button.tsx            # Port V1 button styles
│   │   │   ├── Input.tsx             # Port V1 input styles
│   │   │   └── Modal.tsx             # Port V1 modal styles
│   │   ├── forms/                    # Form components
│   │   │   ├── DreamForm.tsx         # Port PajamaPartyForm class
│   │   │   └── StationAutocomplete.tsx # Port autocomplete logic
│   │   ├── map/                      # Map components
│   │   │   └── MapComponent.tsx      # Port PajamaPartyMap class
│   │   ├── community/                # Community features
│   │   │   ├── CommunityStats.tsx    # Port V1 stats display
│   │   │   ├── DreamersList.tsx      # Port V1 dreamers list
│   │   │   └── DiscordButton.tsx     # Port V1 Discord integration
│   │   └── layout/                   # Layout components
│   │       ├── Header.tsx            # Port V1 header
│   │       ├── Footer.tsx            # Port V1 footer
│   │       ├── FloatingNav.tsx       # Port V1 floating nav
│   │       └── EventBanner.tsx       # Port V1 event banner
│   ├── hooks/                        # Custom hooks
│   │   ├── useDreams.ts             # Data fetching (port V1 API calls)
│   │   ├── useForm.ts               # Form handling
│   │   ├── useMapbox.ts             # Map management
│   │   └── useCountdown.ts          # Countdown timer
│   ├── lib/                         # Utilities
│   │   ├── config.ts                # Port V1 config.js
│   │   ├── supabase.ts              # Database client
│   │   └── utils.ts                 # Helper functions
│   ├── styles/                      # Component styles
│   │   ├── brand.css                # V1 brand colors
│   │   └── animations.css           # V1 animations
│   └── types/                       # TypeScript types
│       └── index.ts                 # Data types
├── public/                          # Static assets
│   └── assets/                      # Port V1 assets
└── tests/                          # Test files
    ├── components/                  # Component tests
    ├── hooks/                       # Hook tests
    └── e2e/                        # End-to-end tests
```

## 📅 **14-Week Implementation Timeline**

### **Phase 1: Foundation (Weeks 1-2)**

#### **Week 1: Project Setup**
```bash
# Create Next.js project
npx create-next-app@latest pajama-party-v3 --typescript --tailwind --eslint --app

# Install core dependencies
npm install @supabase/supabase-js mapbox-gl @headlessui/react
npm install @types/mapbox-gl framer-motion date-fns
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D prettier eslint-config-prettier husky lint-staged
npm install -D @playwright/test
```

**Deliverables Week 1:**
- [ ] Next.js project created and configured
- [ ] All dependencies installed
- [ ] Git setup with proper .gitignore
- [ ] ESLint/Prettier configuration
- [ ] Basic folder structure created

#### **Week 2: Configuration & Design System**
```typescript
// lib/config.ts - Port V1 config.js exactly
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  mapbox: {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
  },
  app: {
    countdownTarget: '2025-09-26T00:00:00Z',
    discordInvite: 'https://discord.gg/back-on-track',
  },
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.vercel.app/api' 
      : 'http://localhost:3000/api',
    timeout: 30000,
  }
}

// styles/brand.css - Port V1 main.css variables exactly
:root {
  --color-primary: #008f39;      /* BoT Green */
  --color-secondary: #92d051;    /* BoT Light Green */
  --color-accent: #2271b3;       /* BoT Blue */
  --color-dark: #1a1a1a;         /* Dark Text */
  --color-light: #f8f9fa;        /* Light Background */
  /* ... all V1 colors */
}

// tailwind.config.js - Extend with V1 brand
module.exports = {
  theme: {
    extend: {
      colors: {
        'bot-green': '#008f39',
        'bot-light-green': '#92d051',
        'bot-blue': '#2271b3',
        // ... all V1 colors
      },
      fontFamily: {
        'mark': ['Mark Pro', 'system-ui'],
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
      }
    }
  }
}
```

**Deliverables Week 2:**
- [ ] Supabase project created and configured
- [ ] Environment variables set up
- [ ] Brand colors and typography configured
- [ ] Tailwind extended with V1 design system
- [ ] Basic layout components created

### **Phase 2: Core Components (Weeks 3-4)**

#### **Week 3: Layout Components**
```typescript
// components/layout/Header.tsx - Port V1 header exactly
interface HeaderProps {
  showFloatingNav?: boolean;
}

export function Header({ showFloatingNav }: HeaderProps) {
  return (
    <header className="header bg-white border-b border-gray-200">
      <div className="header__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="header__logo">
            <Image 
              src="/assets/bot-logo.svg" 
              alt="Back-on-Track" 
              width={120} 
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <nav className="header__nav hidden md:flex space-x-8">
            <a href="#about" className="header__link text-gray-700 hover:text-bot-green">
              About
            </a>
            <a href="#community" className="header__link text-gray-700 hover:text-bot-green">
              Community
            </a>
            <a 
              href="https://back-on-track.eu" 
              className="header__link--primary bg-bot-green text-white px-4 py-2 rounded-md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Back-on-Track
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

// components/layout/FloatingNav.tsx - Port V1 floating nav logic
export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  
  useEffect(() => {
    // Port V1 scroll detection logic exactly
    const handleScroll = () => {
      const scrollY = window.scrollY
      const isScrollingDown = scrollY > lastScrollY.current
      const isScrolledPastHero = scrollY > 300
      
      if (isScrolledPastHero && !isScrollingDown) {
        setIsVisible(true)
      } else if (!isScrolledPastHero || isScrollingDown) {
        setIsVisible(false)
      }
      
      lastScrollY.current = scrollY
    }
    
    // Port V1 active section detection
    const updateActiveSection = () => {
      const sections = ['hero', 'map', 'community', 'about']
      // ... port V1 logic exactly
    }
    
    window.addEventListener('scroll', debounce(handleScroll, 100))
    window.addEventListener('scroll', debounce(updateActiveSection, 100))
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', updateActiveSection)
    }
  }, [])
  
  return (
    <nav className={`floating-nav ${isVisible ? 'visible' : ''}`}>
      {/* Port V1 floating nav HTML exactly */}
    </nav>
  )
}

// components/layout/EventBanner.tsx - Port V1 countdown timer
export function EventBanner() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>()
  
  useEffect(() => {
    const targetDate = new Date('2025-09-26T00:00:00Z')
    
    const updateCountdown = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        setTimeLeft({ days })
      } else {
        setTimeLeft({ days: 0 })
      }
    }
    
    // Update immediately and then every hour (port V1 logic)
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000 * 60 * 60)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="event-banner bg-gradient-to-r from-bot-green to-bot-blue text-white py-4 animate-pulse-soft">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-lg font-medium">
            European Train Adventure Challenge
          </span>
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <span className="font-mono text-xl">
              {timeLeft?.days.toString().padStart(3, '0')} days left
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Deliverables Week 3:**
- [ ] Header component with exact V1 styling
- [ ] Floating navigation with scroll detection
- [ ] Event banner with countdown timer
- [ ] Footer component
- [ ] Root layout component

#### **Week 4: Form Components Foundation**
```typescript
// components/forms/DreamForm.tsx - Start porting PajamaPartyForm class
interface DreamFormData {
  dreamerName: string;
  originStation: string;
  destinationCity: string;
  email?: string;
}

export function DreamForm() {
  const {
    data,
    errors,
    isSubmitting,
    handleSubmit,
    validateField,
    selectedOrigin,
    selectedDestination
  } = useDreamForm()
  
  return (
    <form onSubmit={handleSubmit} className="dream-form">
      {/* Port V1 form HTML structure exactly */}
      <div className="dream-form__field">
        <label htmlFor="dreamerName" className="dream-form__label">
          What's your name?
        </label>
        <input
          id="dreamerName"
          type="text"
          value={data.dreamerName}
          onChange={(e) => handleFieldChange('dreamerName', e.target.value)}
          onBlur={() => validateField('dreamerName')}
          className={`dream-form__input ${errors.dreamerName ? 'error' : ''}`}
          placeholder="Enter your name"
          required
        />
        {errors.dreamerName && (
          <div className="field-error">{errors.dreamerName}</div>
        )}
      </div>
      
      {/* Port all other form fields exactly */}
    </form>
  )
}

// hooks/useDreamForm.ts - Port PajamaPartyForm logic
export function useDreamForm() {
  const [data, setData] = useState<DreamFormData>({
    dreamerName: '',
    originStation: '',
    destinationCity: '',
    email: ''
  })
  
  const [errors, setErrors] = useState<Partial<DreamFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOrigin, setSelectedOrigin] = useState<Station | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  
  // Port all PajamaPartyForm validation methods
  const validateName = (name: string): string | null => {
    if (!name.trim()) return 'Please enter your name'
    if (name.length < 2) return 'Name must be at least 2 characters long'
    return null
  }
  
  const validateOrigin = (origin: string): string | null => {
    if (!origin.trim()) return 'Please enter your origin station'
    return null
  }
  
  const validateDestination = (destination: string): string | null => {
    if (!destination.trim()) return 'Please enter your dream destination'
    return null
  }
  
  const validateEmail = (email: string): string | null => {
    if (email && !isValidEmail(email)) {
      return 'Please enter a valid email address'
    }
    return null
  }
  
  // Port all other PajamaPartyForm methods...
  
  return {
    data,
    errors,
    isSubmitting,
    selectedOrigin,
    selectedDestination,
    handleSubmit,
    validateField,
    handleFieldChange
  }
}
```

**Deliverables Week 4:**
- [ ] Dream form component structure
- [ ] Form validation hook with V1 logic
- [ ] Input components with V1 styling
- [ ] Error handling and display
- [ ] Loading states

### **Phase 3: Form System Complete (Weeks 5-6)**

#### **Week 5: Autocomplete & Validation**
```typescript
// components/forms/StationAutocomplete.tsx - Port V1 autocomplete exactly
interface StationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (station: Station) => void;
  placeholder: string;
  error?: string;
}

export function StationAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  error 
}: StationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Port V1 autocomplete cache
  const autocompleteCache = useRef(new Map<string, Station[]>())
  
  // Port V1 debounced search logic exactly
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      if (autocompleteCache.current.has(query)) {
        setSuggestions(autocompleteCache.current.get(query)!)
        setShowSuggestions(true)
        return
      }
      
      setIsLoading(true)
      try {
        const stations = await searchStations(query)
        autocompleteCache.current.set(query, stations)
        setSuggestions(stations)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error searching stations:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )
  
  useEffect(() => {
    if (value.length >= 2) {
      debouncedSearch(value)
    } else {
      setShowSuggestions(false)
    }
  }, [value, debouncedSearch])
  
  return (
    <div className="autocomplete-container">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`dream-form__input ${error ? 'error' : ''}`}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((station, index) => (
            <div
              key={`${station.name}-${station.country}-${index}`}
              className="suggestion-item"
              onClick={() => {
                onSelect(station)
                setShowSuggestions(false)
              }}
            >
              <div className="suggestion-item__name">{station.name}</div>
              <div className="suggestion-item__country">{station.country}</div>
            </div>
          ))}
        </div>
      )}
      
      {isLoading && (
        <div className="autocomplete-loading">Searching...</div>
      )}
      
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}

// lib/api.ts - Port V1 API client exactly
class ApiClient {
  private baseURL: string;
  private timeout: number;
  
  constructor() {
    this.baseURL = config.api.baseUrl;
    this.timeout = config.api.timeout;
  }
  
  // Port V1 fetchWithTimeout exactly
  private async fetchWithTimeout(url: string, options: RequestInit = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }
  
  // Port all V1 API methods exactly
  async searchStations(query: string): Promise<Station[]> {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}/stations/search?q=${encodeURIComponent(query)}`
      );
      return response || [];
    } catch (error) {
      console.error('Error searching stations:', error);
      return [];
    }
  }
  
  async submitDream(dreamData: DreamData): Promise<DreamResponse> {
    return this.fetchWithTimeout(`${this.baseURL}/dreams`, {
      method: 'POST',
      body: JSON.stringify(dreamData)
    });
  }
  
  async getDreams(): Promise<Dream[]> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/dreams`);
    return response || [];
  }
  
  async getStats(): Promise<Stats> {
    const response = await this.fetchWithTimeout(`${this.baseURL}/stats`);
    return response || {};
  }
  
  async getCommunityInfo(station: string): Promise<CommunityInfo | null> {
    try {
      return await this.fetchWithTimeout(
        `${this.baseURL}/community/${encodeURIComponent(station)}`
      );
    } catch (error) {
      console.error('Error fetching community info:', error);
      return null;
    }
  }
  
  async checkHealth(): Promise<HealthCheck | null> {
    try {
      return await this.fetchWithTimeout(`${this.baseURL}/health`);
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }
}

export const apiClient = new ApiClient();
```

**Deliverables Week 5:**
- [ ] Station autocomplete with caching
- [ ] API client with V1 methods
- [ ] Debounced search implementation
- [ ] Error handling for all API calls
- [ ] Form completion and submission

#### **Week 6: Form Integration & Testing**
```typescript
// Complete form integration with API
// Add comprehensive form testing
// Implement success/error messaging exactly like V1
// Add loading states and animations
```

**Deliverables Week 6:**
- [ ] Complete form functionality
- [ ] API integration working
- [ ] Form validation complete
- [ ] Success/error messaging
- [ ] Form tests written

### **Phase 4: Map Integration (Weeks 7-8)**

#### **Week 7: Mapbox Setup**
```typescript
// components/map/MapComponent.tsx - Port PajamaPartyMap class exactly
'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  dreams: Dream[];
  onDreamAdd?: (dream: Dream) => void;
}

export function MapComponent({ dreams, onDreamAdd }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Port V1 map initialization exactly
    mapboxgl.accessToken = config.mapbox.accessToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Same as V1
      center: [13.4, 52.5], // Europe center (same as V1)
      zoom: 4,
      minZoom: 2,
      maxZoom: 18
    });
    
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());
    
    map.current.on('load', () => {
      addDataSources();
      addLayers();
      addInteractions();
      setIsInitialized(true);
    });
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Port all V1 map methods exactly
  const addDataSources = () => {
    if (!map.current) return;
    
    // Origins source (same as V1)
    map.current.addSource('origins', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
    // Destinations source (same as V1)
    map.current.addSource('destinations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
    
    // Lines source (same as V1)
    map.current.addSource('dream-lines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  };
  
  const addLayers = () => {
    if (!map.current) return;
    
    // Port V1 layer configuration exactly
    map.current.addLayer({
      id: 'dream-lines',
      type: 'line',
      source: 'dream-lines',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#2271b3', // V1 blue color
        'line-width': 2,
        'line-opacity': 0.7
      }
    });
    
    // Origins layer (V1 green)
    map.current.addLayer({
      id: 'origins',
      type: 'circle',
      source: 'origins',
      paint: {
        'circle-radius': 8,
        'circle-color': '#008f39',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });
    
    // Destinations layer (V1 blue)
    map.current.addLayer({
      id: 'destinations',
      type: 'circle',
      source: 'destinations',
      paint: {
        'circle-radius': 10,
        'circle-color': '#2271b3',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    });
  };
  
  const addInteractions = () => {
    if (!map.current) return;
    
    // Port V1 hover effects exactly
    map.current.on('mouseenter', 'origins', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });
    
    map.current.on('mouseleave', 'origins', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
    
    // Port V1 popup logic exactly
    map.current.on('click', 'origins', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const properties = e.features[0].properties;
      const coordinates = e.features[0].geometry.coordinates.slice();
      
      new mapboxgl.Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(`
          <div class="map-popup">
            <h3 class="map-popup__title">${properties.station}</h3>
            <p class="map-popup__info">${properties.country}</p>
            <p class="map-popup__description">
              ${properties.dreamers_count} ${properties.dreamers_count === 1 ? 'dreamer' : 'dreamers'} from this station
            </p>
          </div>
        `)
        .addTo(map.current!);
    });
    
    // Same for destinations...
  };
  
  // Port V1 updateMapData exactly
  useEffect(() => {
    if (!isInitialized || !map.current) return;
    
    updateMapData(dreams);
  }, [dreams, isInitialized]);
  
  const updateMapData = (dreams: Dream[]) => {
    // Port V1 map data processing exactly
    const originFeatures: any[] = [];
    const destinationFeatures: any[] = [];
    const lineFeatures: any[] = [];
    
    // Group dreams by origin and destination (same logic as V1)
    const originGroups = new Map();
    const destinationGroups = new Map();
    
    dreams.forEach(dream => {
      // Port V1 grouping logic exactly...
    });
    
    // Update map sources (same as V1)
    if (map.current?.getSource('origins')) {
      (map.current.getSource('origins') as mapboxgl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features: originFeatures
      });
    }
    
    // Same for destinations and lines...
  };
  
  return (
    <div className="map-container">
      <div 
        ref={mapContainer} 
        className="map"
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}

// hooks/useMapbox.ts - Map management hook
export function useMapbox() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadDreams();
    
    // Auto-refresh every 30 seconds (same as V1)
    const interval = setInterval(loadDreams, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const loadDreams = async () => {
    try {
      const dreams = await apiClient.getDreams();
      setDreams(dreams);
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addDream = (dream: Dream) => {
    setDreams(prev => [...prev, dream]);
  };
  
  return { dreams, isLoading, addDream };
}
```

**Deliverables Week 7:**
- [ ] Mapbox integration complete
- [ ] Map layers and sources setup
- [ ] Basic map interactions
- [ ] Data visualization working
- [ ] Map styling matches V1

#### **Week 8: Map Features & Performance**
```typescript
// Complete map popup functionality
// Add map performance optimizations
// Implement dream visualization exactly like V1
// Add map resize handling
// Test map on mobile devices
```

**Deliverables Week 8:**
- [ ] Complete map functionality
- [ ] Popups working like V1
- [ ] Performance optimized
- [ ] Mobile responsive
- [ ] Map tests written

### **Phase 5: Community Features (Weeks 9-10)**

#### **Week 9: Community Stats & Dreamers List**
```typescript
// components/community/CommunityStats.tsx - Port V1 stats exactly
export function CommunityStats() {
  const { stats, isLoading } = useStats();
  
  if (isLoading) {
    return <div className="stats-loading">Loading stats...</div>;
  }
  
  return (
    <div className="community-stats">
      <div className="stat-item">
        <div className="stat-number" id="totalDreams">
          {stats.total_dreams || 0}
        </div>
        <div className="stat-label">Dreams Shared</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-number" id="totalStations">
          {stats.active_stations || 0}
        </div>
        <div className="stat-label">Active Stations</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-number" id="totalCommunities">
          {Math.floor((stats.active_stations || 0) / 3)}
        </div>
        <div className="stat-label">Communities Forming</div>
      </div>
    </div>
  );
}

// components/community/DreamersList.tsx - Port V1 dreamers list exactly
export function DreamersList() {
  const { dreams } = useDreams();
  
  // Port V1 dreamers list logic exactly
  const recentDreamers = dreams.slice(-20).reverse();
  
  return (
    <div className="dreamers-list">
      <h3 className="dreamers-list__title">Recent Dreamers</h3>
      <div className="dreamers-list__container">
        {recentDreamers.length === 0 ? (
          <div className="dreamers-list__item">
            No dreamers yet. Be the first!
          </div>
        ) : (
          recentDreamers.map((dream, index) => (
            <div key={index} className="dreamers-list__item">
              <span className="dreamers-list__name">
                {escapeHtml(dream.dreamer_name || 'Anonymous')}
              </span>
              <span className="dreamers-list__destination">
                → {escapeHtml(dream.destination_city || 'Unknown')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// components/community/DiscordButton.tsx - Port V1 Discord integration
export function DiscordButton({ communityMessage }: { communityMessage?: string }) {
  return (
    <div className="discord-integration">
      {communityMessage && (
        <div className="community-message">
          <div className="community-message__icon">🎉</div>
          <div className="community-message__text">{communityMessage}</div>
        </div>
      )}
      
      <a 
        href={config.app.discordInvite}
        className="discord-button"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="discord-button__icon">💬</span>
        <span className="discord-button__text">Join Discord Community</span>
      </a>
    </div>
  );
}

// hooks/useStats.ts - Stats management
export function useStats() {
  const [stats, setStats] = useState<Stats>({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadStats();
    
    // Refresh stats every 60 seconds (same as V1)
    const interval = setInterval(loadStats, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const loadStats = async () => {
    try {
      const stats = await apiClient.getStats();
      setStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return { stats, isLoading };
}
```

**Deliverables Week 9:**
- [ ] Community stats component
- [ ] Dreamers list with auto-refresh
- [ ] Discord integration
- [ ] Stats API integration
- [ ] Community features testing

#### **Week 10: Community Polish & Integration**
```typescript
// Complete community message generation
// Add community animations and polish
// Integrate with form submission
// Add community tests
```

**Deliverables Week 10:**
- [ ] Complete community features
- [ ] Community messages working
- [ ] Integration with form
- [ ] Polish and animations
- [ ] Comprehensive testing

### **Phase 6: API Layer (Weeks 11-12)**

#### **Week 11: Next.js API Routes**
```typescript
// app/api/dreams/route.ts - Port V1 dreams endpoint exactly
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Port V1 query exactly: get active dreams
    const { data: dreams, error } = await supabase
      .from('dreams')
      .select(`
        dreamer_name,
        origin_station,
        origin_country,
        origin_lat,
        origin_lng,
        destination_city,
        destination_country,
        destination_lat,
        destination_lng,
        created_at
      `)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 });
    }
    
    return NextResponse.json(dreams || []);
  } catch (error) {
    console.error('Error in dreams GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Port V1 validation exactly
    const body = await request.json();
    const {
      dreamer_name,
      origin_station,
      origin_country,
      origin_lat,
      origin_lng,
      destination_city,
      destination_country,
      destination_lat,
      destination_lng,
      email
    } = body;
    
    // Validate required fields (same as V1)
    if (!dreamer_name || dreamer_name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Dreamer name must be at least 2 characters long' },
        { status: 400 }
      );
    }
    
    if (!origin_station || origin_station.trim().length < 1) {
      return NextResponse.json(
        { error: 'Origin station is required' },
        { status: 400 }
      );
    }
    
    if (!destination_city || destination_city.trim().length < 1) {
      return NextResponse.json(
        { error: 'Destination city is required' },
        { status: 400 }
      );
    }
    
    // Validate email if provided (same as V1)
    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Insert dream (30-day expiration like V1)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    const { data: dream, error } = await supabase
      .from('dreams')
      .insert({
        dreamer_name: dreamer_name.trim(),
        origin_station: origin_station.trim(),
        origin_country,
        origin_lat,
        origin_lng,
        destination_city: destination_city.trim(),
        destination_country,
        destination_lat,
        destination_lng,
        email: email?.trim() || null,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to save dream' }, { status: 500 });
    }
    
    // Generate community message (port V1 logic)
    const community_message = generateCommunityMessage(origin_station);
    
    return NextResponse.json({
      id: dream.id,
      message: 'Dream submitted successfully!',
      community_message
    });
    
  } catch (error) {
    console.error('Error in dreams POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Port V1 community message generation exactly
function generateCommunityMessage(station: string): string {
  const messages = [
    `2 people from ${station} want to organize a pajama party!`,
    `Join 3 other dreamers from ${station} planning night train adventures!`,
    `${station} has an active community of night train enthusiasts!`,
    `Connect with fellow travelers from ${station} on our Discord!`
  ];
  
  return messages[Math.floor(Math.random() * messages.length)];
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// app/api/stations/search/route.ts - Port V1 station search exactly
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Port V1 fuzzy search logic exactly
    const { data: stations, error } = await supabase
      .from('stations')
      .select('name, country, lat, lng')
      .or(`name.ilike.%${query}%,country.ilike.%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(20);
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to search stations' }, { status: 500 });
    }
    
    return NextResponse.json(stations || []);
  } catch (error) {
    console.error('Error in stations search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/stats/route.ts - Port V1 stats exactly
export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get total active dreams
    const { count: totalDreams } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .or('expires_at.is.null,expires_at.gt.now()');
    
    // Get unique stations
    const { data: uniqueStations } = await supabase
      .from('dreams')
      .select('origin_station')
      .or('expires_at.is.null,expires_at.gt.now()');
    
    const activeStations = new Set(
      uniqueStations?.map(d => d.origin_station) || []
    ).size;
    
    return NextResponse.json({
      total_dreams: totalDreams || 0,
      active_stations: activeStations,
    });
  } catch (error) {
    console.error('Error in stats GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// app/api/health/route.ts - Port V1 health check
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '3.0.0-nextjs'
  });
}
```

**Deliverables Week 11:**
- [ ] All API routes implemented
- [ ] Database integration working
- [ ] V1 functionality replicated
- [ ] Error handling complete
- [ ] API validation matching V1

#### **Week 12: Supabase Setup & Data Migration**
```sql
-- Supabase schema setup (enhanced from V2 schema)
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Dreams table (port V1 SQLite schema)
CREATE TABLE IF NOT EXISTS dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dreamer_name VARCHAR(255) NOT NULL CHECK (length(trim(dreamer_name)) >= 2),
    origin_station VARCHAR(255) NOT NULL CHECK (length(trim(origin_station)) >= 2),
    origin_country VARCHAR(2),
    origin_lat DECIMAL(10, 8) CHECK (origin_lat >= -90 AND origin_lat <= 90),
    origin_lng DECIMAL(11, 8) CHECK (origin_lng >= -180 AND origin_lng <= 180),
    destination_city VARCHAR(255) NOT NULL CHECK (length(trim(destination_city)) >= 2),
    destination_country VARCHAR(2),
    destination_lat DECIMAL(10, 8) CHECK (destination_lat >= -90 AND destination_lat <= 90),
    destination_lng DECIMAL(11, 8) CHECK (destination_lng >= -180 AND destination_lng <= 180),
    email VARCHAR(255) CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    CONSTRAINT dreams_expires_at_check CHECK (expires_at > created_at)
);

-- Stations table (enhanced from V1)
CREATE TABLE IF NOT EXISTS stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL CHECK (length(trim(name)) >= 2),
    country VARCHAR(2) NOT NULL CHECK (length(country) = 2),
    country_name VARCHAR(255) NOT NULL CHECK (length(trim(country_name)) >= 2),
    city VARCHAR(255) CHECK (city IS NULL OR length(trim(city)) >= 2),
    lat DECIMAL(10, 8) NOT NULL CHECK (lat >= -90 AND lat <= 90),
    lng DECIMAL(11, 8) NOT NULL CHECK (lng >= -180 AND lng <= 180),
    station_type VARCHAR(50) DEFAULT 'station',
    searchable TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_expires_at ON dreams(expires_at);
CREATE INDEX IF NOT EXISTS idx_dreams_origin_station ON dreams(origin_station);
CREATE INDEX IF NOT EXISTS idx_stations_searchable_trgm ON stations USING gin(searchable gin_trgm_ops);

-- Row Level Security
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

-- Policies for public access (same as V1 SQLite behavior)
CREATE POLICY "Public read access to active dreams" ON dreams
    FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Public insert access to dreams" ON dreams
    FOR INSERT WITH CHECK (
        length(trim(dreamer_name)) >= 2 AND
        length(trim(origin_station)) >= 2 AND
        length(trim(destination_city)) >= 2
    );

CREATE POLICY "Public read access to active stations" ON stations
    FOR SELECT USING (is_active = TRUE);
```

**Migration Script:**
```typescript
// scripts/migrate-v1-to-supabase.ts
// Script to migrate V1 SQLite data to Supabase
// (Only run this once during migration)

import { createClient } from '@supabase/supabase-js';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateData() {
  // Open V1 SQLite database
  const db = new sqlite3.Database('./v1/data/pajama-party.db');
  const dbGet = promisify(db.get.bind(db));
  const dbAll = promisify(db.all.bind(db));
  
  try {
    // Migrate dreams
    const dreams = await dbAll('SELECT * FROM dreams');
    console.log(`Migrating ${dreams.length} dreams...`);
    
    for (const dream of dreams) {
      const { error } = await supabase
        .from('dreams')
        .insert({
          dreamer_name: dream.dreamer_name,
          origin_station: dream.origin_station,
          origin_country: dream.origin_country,
          origin_lat: dream.origin_lat,
          origin_lng: dream.origin_lng,
          destination_city: dream.destination_city,
          destination_country: dream.destination_country,
          destination_lat: dream.destination_lat,
          destination_lng: dream.destination_lng,
          email: dream.email,
          created_at: dream.created_at,
          expires_at: dream.expires_at
        });
      
      if (error) {
        console.error('Error migrating dream:', error);
      }
    }
    
    // Migrate stations
    const stations = await dbAll('SELECT * FROM stations');
    console.log(`Migrating ${stations.length} stations...`);
    
    for (const station of stations) {
      const { error } = await supabase
        .from('stations')
        .insert({
          external_id: station.id,
          name: station.name,
          country: station.country.slice(0, 2), // Ensure 2-char country code
          country_name: station.country,
          lat: station.lat,
          lng: station.lng,
          station_type: station.type || 'station',
          searchable: `${station.name} ${station.country}`,
          is_active: true,
          created_at: station.created_at
        });
      
      if (error) {
        console.error('Error migrating station:', error);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    db.close();
  }
}

// Run migration
migrateData();
```

**Deliverables Week 12:**
- [ ] Supabase database setup complete
- [ ] V1 data migrated to Supabase
- [ ] All API endpoints working
- [ ] Database performance optimized
- [ ] Migration scripts documented

### **Phase 7: Styling & Polish (Weeks 13-14)**

#### **Week 13: Complete V1 Styling Migration**
```css
/* styles/v1-migration.css - Port all V1 styles exactly */

/* Brand colors from V1 main.css */
:root {
  --color-primary: #008f39;      /* BoT Green */
  --color-secondary: #92d051;    /* BoT Light Green */
  --color-accent: #2271b3;       /* BoT Blue */
  --color-dark: #1a1a1a;         /* Dark Text */
  --color-light: #f8f9fa;        /* Light Background */
  --color-white: #ffffff;
  --color-gray-100: #f8f9fa;
  --color-gray-200: #e9ecef;
  --color-gray-300: #dee2e6;
  --color-gray-400: #ced4da;
  --color-gray-500: #6c757d;
  --color-gray-600: #495057;
  --color-gray-700: #343a40;
  --color-gray-800: #212529;
  --color-error: #dc3545;
  --color-success: #28a745;
  --color-warning: #ffc107;

  /* Typography from V1 */
  --font-family: 'Mark Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Spacing from V1 */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;

  /* Borders and shadows from V1 */
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;
  --border-radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Transitions from V1 */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Port V1 animations exactly */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Header styles from V1 */
.header {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
}

.header__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 4rem;
}

.header__logo img {
  height: 2rem;
  width: auto;
}

.header__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.header__link {
  color: var(--color-gray-700);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.header__link:hover {
  color: var(--color-primary);
}

.header__link--primary {
  background: var(--color-primary);
  color: var(--color-white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.header__link--primary:hover {
  background: #006d2c;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* Event banner from V1 */
.event-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
  color: var(--color-white);
  padding: var(--spacing-md) 0;
  text-align: center;
  animation: pulse 2s ease-in-out infinite;
}

.event-banner__content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.event-banner__text {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.event-banner__countdown {
  background: rgba(255, 255, 255, 0.2);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-full);
  font-family: ui-monospace, 'SF Mono', monospace;
  font-size: var(--font-size-xl);
  font-weight: 700;
  backdrop-filter: blur(4px);
}

/* Floating navigation from V1 */
.floating-nav {
  position: fixed;
  bottom: var(--spacing-xl);
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  background: var(--color-white);
  border-radius: var(--border-radius-2xl);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  z-index: 40;
  opacity: 0;
  transition: all var(--transition-base);
}

.floating-nav.visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.floating-nav__item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-xl);
  text-decoration: none;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.floating-nav__item:hover,
.floating-nav__item.active {
  background: var(--color-primary);
  color: var(--color-white);
  transform: translateY(-2px);
}

.floating-nav__icon {
  font-size: var(--font-size-base);
}

/* Form styles from V1 */
.dream-form {
  background: var(--color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-2xl);
  max-width: 600px;
  margin: 0 auto;
}

.dream-form__title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.dream-form__field {
  margin-bottom: var(--spacing-lg);
}

.dream-form__label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-sm);
}

.dream-form__input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
  background: var(--color-white);
}

.dream-form__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 143, 57, 0.1);
}

.dream-form__input.error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.dream-form__button {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-lg);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.dream-form__button:hover:not(:disabled) {
  background: #006d2c;
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.dream-form__button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Suggestions dropdown from V1 */
.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-top: none;
  border-radius: 0 0 var(--border-radius-md) var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.suggestion-item {
  padding: var(--spacing-md);
  cursor: pointer;
  border-bottom: 1px solid var(--color-gray-100);
  transition: background-color var(--transition-fast);
}

.suggestion-item:hover {
  background: var(--color-gray-50);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item__name {
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-xs);
}

.suggestion-item__country {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* Map styles from V1 */
.map-container {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  background: var(--color-gray-100);
}

.map {
  width: 100%;
  height: 500px;
}

.map-popup {
  font-family: var(--font-family);
}

.map-popup__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: var(--spacing-xs);
}

.map-popup__info {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-sm);
}

.map-popup__description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
}

/* Community stats from V1 */
.community-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin: var(--spacing-2xl) 0;
}

.stat-item {
  background: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  text-align: center;
  transition: transform var(--transition-fast);
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-number {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  font-family: ui-monospace, 'SF Mono', monospace;
}

.stat-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Dreamers list from V1 */
.dreamers-list {
  background: var(--color-white);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
}

.dreamers-list__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-dark);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.dreamers-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--color-gray-100);
  animation: slideUp var(--transition-base);
}

.dreamers-list__item:last-child {
  border-bottom: none;
}

.dreamers-list__name {
  font-weight: 600;
  color: var(--color-dark);
}

.dreamers-list__destination {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* Error and success messages from V1 */
.field-error {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  animation: slideUp var(--transition-fast);
}

.success-message {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-lg) 0;
  animation: slideUp var(--transition-base);
}

.form-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-lg) 0;
  animation: slideUp var(--transition-base);
}

/* Discord integration from V1 */
.discord-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: #5865f2;
  color: var(--color-white);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.discord-button:hover {
  background: #4752c4;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.community-message {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  margin: var(--spacing-lg) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  animation: slideUp var(--transition-base);
}

.community-message__icon {
  font-size: var(--font-size-xl);
}

/* Loading states from V1 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design from V1 */
@media (max-width: 768px) {
  .header__nav {
    display: none; /* Simplified mobile nav */
  }
  
  .event-banner__content {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .floating-nav {
    bottom: var(--spacing-md);
    left: var(--spacing-md);
    right: var(--spacing-md);
    transform: translateY(100px);
  }
  
  .floating-nav.visible {
    transform: translateY(0);
  }
  
  .floating-nav__item {
    flex: 1;
    justify-content: center;
  }
  
  .dream-form {
    margin: var(--spacing-md);
    padding: var(--spacing-xl);
  }
  
  .community-stats {
    grid-template-columns: 1fr;
    margin: var(--spacing-xl) var(--spacing-md);
  }
  
  .map {
    height: 300px;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**Deliverables Week 13:**
- [ ] All V1 styles ported exactly
- [ ] Responsive design working
- [ ] Animations and transitions complete
- [ ] Accessibility features included
- [ ] Brand consistency verified

#### **Week 14: Final Polish & Testing**
```typescript
// Complete visual regression testing
// Performance optimization
// Accessibility testing
// Cross-browser testing
// Mobile testing
// Final bug fixes
```

**Deliverables Week 14:**
- [ ] Pixel-perfect match to V1
- [ ] All animations working
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Mobile responsive
- [ ] Cross-browser tested

### **Phase 8: Production Deployment (Week 14)**

#### **Final Deployment Checklist**
```bash
# Vercel deployment configuration
# vercel.json
{
  "framework": "nextjs",
  "regions": ["fra1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN": "@mapbox-token"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}

# Production deployment steps
1. Environment variables configured in Vercel
2. Supabase production database ready
3. Domain configured (if custom domain)
4. Error monitoring setup (Sentry)
5. Analytics setup (if needed)
6. Performance monitoring active
```

## 🧪 **Testing Strategy**

### **Component Testing**
```typescript
// tests/components/DreamForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DreamForm } from '@/components/forms/DreamForm';

describe('DreamForm', () => {
  it('validates required fields exactly like V1', async () => {
    render(<DreamForm />);
    
    const submitButton = screen.getByRole('button', { name: /add my dream/i });
    fireEvent.click(submitButton);
    
    // Should show V1 validation messages
    await waitFor(() => {
      expect(screen.getByText('Please enter your name')).toBeInTheDocument();
      expect(screen.getByText('Please enter your origin station')).toBeInTheDocument();
      expect(screen.getByText('Please enter your dream destination')).toBeInTheDocument();
    });
  });
  
  it('submits form successfully like V1', async () => {
    // Test successful form submission
    // Verify API call structure matches V1
    // Check success message matches V1
  });
  
  it('handles autocomplete exactly like V1', async () => {
    // Test station autocomplete
    // Verify debouncing behavior
    // Check caching functionality
  });
});
```

### **E2E Testing**
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test('complete user journey matches V1', async ({ page }) => {
  await page.goto('/');
  
  // Verify page loads with all V1 elements
  await expect(page.locator('.event-banner')).toBeVisible();
  await expect(page.locator('.dream-form')).toBeVisible();
  await expect(page.locator('.map-container')).toBeVisible();
  
  // Test form submission
  await page.fill('#dreamerName', 'Test Dreamer');
  await page.fill('#originStation', 'Berlin Hauptbahnhof');
  await page.fill('#destinationStation', 'Barcelona');
  
  await page.click('[data-testid="submit-button"]');
  
  // Verify success message appears
  await expect(page.locator('.success-message')).toBeVisible();
  
  // Verify dream appears on map
  await expect(page.locator('.mapboxgl-marker')).toBeVisible();
});

test('floating navigation works like V1', async ({ page }) => {
  await page.goto('/');
  
  // Scroll down to trigger floating nav
  await page.evaluate(() => window.scrollTo(0, 400));
  
  // Verify floating nav appears
  await expect(page.locator('.floating-nav.visible')).toBeVisible();
  
  // Test navigation clicks
  await page.click('[href="#community"]');
  
  // Verify smooth scroll to section
  await expect(page.locator('#community')).toBeInViewport();
});
```

### **Performance Testing**
```typescript
// tests/performance/lighthouse.test.ts
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';

test('Lighthouse scores match or exceed V1', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const result = await lighthouse('http://localhost:3000', {
    port: 9222,
    output: 'json',
    preset: 'desktop'
  });
  
  // Verify performance metrics
  expect(result.lhr.categories.performance.score).toBeGreaterThan(0.9);
  expect(result.lhr.categories.accessibility.score).toBeGreaterThan(0.9);
  expect(result.lhr.categories.seo.score).toBeGreaterThan(0.9);
  
  await browser.close();
});
```

## 📊 **Success Metrics**

### **Functional Requirements**
- [ ] 100% feature parity with V1
- [ ] All API endpoints working identically
- [ ] Database operations consistent with V1
- [ ] User experience identical to V1

### **Performance Requirements**
- [ ] Page load time ≤ V1 performance
- [ ] Map rendering ≤ V1 speed
- [ ] Form submission ≤ V1 response time
- [ ] Lighthouse score ≥ 90 (all categories)

### **Quality Requirements**
- [ ] 90%+ test coverage
- [ ] Zero TypeScript errors
- [ ] Zero ESLint errors
- [ ] WCAG AA accessibility compliance

### **Technical Requirements**
- [ ] Successful Vercel deployment
- [ ] Supabase production database active
- [ ] All environment variables configured
- [ ] Error monitoring functional

## 🚀 **Next Steps**

1. **Review this complete plan** - Ensure all requirements are captured
2. **Set up development environment** - Follow Phase 1 setup instructions
3. **Start with Phase 1** - Create Next.js project and basic configuration
4. **Follow the timeline** - Complete each phase before moving to the next
5. **Test continuously** - Implement tests as you build each component
6. **Document progress** - Update this guide with any changes or learnings

## 📚 **Key Files to Reference**

During implementation, constantly reference these V1 files:
- `v1/frontend/index.html` - Complete page structure
- `v1/frontend/styles/main.css` - Brand colors and base styles
- `v1/frontend/styles/improvements.css` - Animations and interactions
- `v1/frontend/scripts/main.js` - App initialization and global logic
- `v1/frontend/scripts/form.js` - Form handling and validation
- `v1/frontend/scripts/map.js` - Map functionality and data visualization
- `v1/frontend/scripts/api.js` - API client and error handling
- `v1/backend/server.js` - API endpoints and business logic

## 🛡️ **Critical Success Factors**

1. **Preserve every V1 feature** - Do not skip anything, no matter how small
2. **Match V1 styling exactly** - Pixel-perfect replication is required
3. **Maintain V1 performance** - New architecture should not slow things down
4. **Test everything thoroughly** - Comprehensive testing prevents regressions
5. **Follow the timeline** - Each phase builds on the previous one
6. **Document as you go** - Update this guide with any changes or discoveries

---

**This implementation guide is your complete roadmap to creating V3. Follow it step by step to ensure success!** 🎯