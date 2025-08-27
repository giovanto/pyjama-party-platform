# Pyjama Party Platform - Complete System Architecture

## Executive Summary

This document defines the complete production-ready architecture for the European night train advocacy platform at `pyjama-party.back-on-track.eu`. The platform uses progressive disclosure to convert users from destination inspiration to climate activism participation.

## 1. User Journey Architecture

### Entry Points & Discovery
- **Direct Traffic**: Landing on map-centric homepage
- **Search Traffic**: SEO-optimized destination pages
- **Social Sharing**: Individual dream destination cards
- **Campaign Traffic**: Back-on-Track community referrals

### Core User Flow (Happy Path)
```
Homepage (Map) → Dream Destination → Train Connection → Movement Info → Participation Form → Community
```

### Detailed User Journey Map

#### Phase 1: Inspiration (Homepage)
- **Entry**: Full-screen interactive map with "Where would you like to wake up tomorrow?"
- **Interaction**: Search/click European destinations from TripHop data
- **Decision Point**: Select destination or browse more
- **Exit Points**: Social share, bookmark, leave
- **Conversion**: Click destination → Dream page

#### Phase 2: Aspiration (Dream Destination)
- **Experience**: Beautiful destination showcase with imagery/description
- **Introduction**: Subtle Back-on-Track movement introduction
- **Decision Point**: Plan journey vs learn more vs exit
- **Conversion**: "Plan my night train journey" → Connect page

#### Phase 3: Connection (Train Connection)
- **Functionality**: Select origin station using OpenRailMaps data
- **Visualization**: Show potential night train route on map
- **Introduction**: Explain night train benefits (climate, experience)
- **Decision Point**: Join movement vs just dream
- **Conversion**: "Join the movement" → Pyjama Party page

#### Phase 4: Education (Pyjama Party Info)
- **Content**: Full movement explanation, September 26th details
- **Social Proof**: Show other participants, station readiness
- **Decision Point**: Participate vs support only
- **Conversion**: Choose participation level → Participate page

#### Phase 5: Conversion (Participation Form)
- **Form**: Pre-filled route, name, email, participation level
- **Options**: Dream only, join party, organize party
- **Validation**: Email for party participants
- **Completion**: Success confirmation + community invite

#### Phase 6: Community (Post-Conversion)
- **Engagement**: Discord invite, organizer resources
- **Retention**: Route updates, movement progress
- **Amplification**: Social sharing tools, referral system

### Edge Cases & Error Flows
- **No train stations near destination**: Suggest alternative destinations
- **Invalid route**: Show explanation, suggest similar routes
- **Form validation errors**: Clear messaging, progressive enhancement
- **API failures**: Graceful degradation with cached content
- **Mobile experience**: Touch-optimized map, simplified forms

## 2. Complete Page Architecture

### Core User Flow Pages
```
/                    - Homepage (Map + Inspiration)
/dream/:placeId      - Dream Destination Showcase
/connect/:placeId    - Train Connection Planning
/pyjama-party        - Movement & Event Information
/participate         - Participation Form & Conversion
/community           - Post-Conversion Engagement
```

### Information & Educational Pages
```
/about               - Back-on-Track Action Group info
/night-trains        - European night train advocacy
/climate-action      - Climate impact & sustainability
/success-stories     - 2024 results & testimonials
/faq                 - Frequently asked questions
/press               - Media kit & coverage
```

### Legal & Compliance Pages
```
/privacy             - Privacy policy (GDPR compliant)
/terms               - Terms of service
/cookies             - Cookie policy
/data-deletion       - User data deletion request
```

### Support & Utility Pages
```
/contact             - Contact form & information
/feedback            - User feedback collection
/accessibility       - Accessibility statement
/sitemap             - XML sitemap for SEO
```

### Error & System Pages
```
/404                 - Page not found
/500                 - Server error
/maintenance         - Maintenance mode
/offline             - PWA offline page
```

### Admin & Management (Protected)
```
/admin/dashboard     - Analytics & overview
/admin/content       - Content management
/admin/translations  - Multilingual content
/admin/users         - User management
/admin/exports       - Data exports
```

## 3. Database Schema Design (PostgreSQL)

### Core Entities

#### Places Table (TripHop Data)
```sql
CREATE TABLE places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id VARCHAR(100) UNIQUE NOT NULL,
  place_name JSONB NOT NULL, -- Multilingual: {"en": "Vienna", "de": "Wien", "fr": "Vienne"}
  place_country JSONB NOT NULL, -- Multilingual country names
  place_lat DECIMAL(10, 8) NOT NULL,
  place_lon DECIMAL(11, 8) NOT NULL,
  place_brief_desc JSONB, -- Multilingual descriptions
  place_longer_desc JSONB, -- Multilingual long descriptions
  place_image VARCHAR(500),
  image_attribution TEXT,
  meta_title JSONB, -- SEO titles per language
  meta_description JSONB, -- SEO descriptions per language
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_places_coordinates ON places (place_lat, place_lon);
CREATE INDEX idx_places_search_en ON places USING GIN ((place_name->>'en'));
CREATE INDEX idx_places_search_de ON places USING GIN ((place_name->>'de'));
CREATE INDEX idx_places_search_fr ON places USING GIN ((place_name->>'fr'));
```

#### Train Stations Table (OpenRailMaps Data)
```sql
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  osm_id BIGINT UNIQUE, -- OpenStreetMap ID
  name JSONB NOT NULL, -- Multilingual station names
  city JSONB NOT NULL, -- Multilingual city names  
  country VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  station_type VARCHAR(50), -- main, regional, metro
  electrification VARCHAR(50), -- electric, diesel, mixed
  max_speed INTEGER, -- km/h
  platforms INTEGER,
  accessibility_level INTEGER, -- 1-5 scale
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stations_coordinates ON stations (latitude, longitude);
CREATE INDEX idx_stations_country ON stations (country);
CREATE INDEX idx_stations_type ON stations (station_type);
```

#### Routes Table (Potential Connections)
```sql
CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_station_id UUID REFERENCES stations(id),
  to_station_id UUID REFERENCES stations(id),
  distance_km INTEGER,
  estimated_duration_hours DECIMAL(4,2),
  route_exists BOOLEAN DEFAULT FALSE, -- Current night train exists
  route_planned BOOLEAN DEFAULT FALSE, -- Planned by operators
  demand_score INTEGER DEFAULT 0, -- Based on user dreams
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_station_id, to_station_id)
);

-- Indexes
CREATE INDEX idx_routes_demand ON routes (demand_score DESC);
CREATE INDEX idx_routes_existing ON routes (route_exists) WHERE route_exists = TRUE;
```

#### Dreams Table (User Route Requests)
```sql
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id VARCHAR(100) REFERENCES places(place_id),
  from_station_id UUID REFERENCES stations(id),
  to_station_id UUID REFERENCES stations(id),
  dreamer_name VARCHAR(100) NOT NULL,
  dreamer_email VARCHAR(255), -- Optional for dream-only
  why_important TEXT NOT NULL,
  participation_level VARCHAR(50) NOT NULL, -- dream_only, join_party, organize_party
  language VARCHAR(10) DEFAULT 'en', -- User's language preference
  ip_address INET, -- For rate limiting and analytics
  user_agent TEXT, -- For analytics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dreams_participation ON dreams (participation_level);
CREATE INDEX idx_dreams_created_at ON dreams (created_at DESC);
CREATE INDEX idx_dreams_route ON dreams (from_station_id, to_station_id);
CREATE INDEX idx_dreams_email ON dreams (dreamer_email) WHERE dreamer_email IS NOT NULL;
```

#### Content Table (Multilingual CMS)
```sql
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key VARCHAR(255) UNIQUE NOT NULL, -- testimonial_1, faq_trains, etc.
  content_type VARCHAR(50) NOT NULL, -- testimonial, faq, page_content, etc.
  title JSONB, -- Multilingual titles
  body JSONB, -- Multilingual content
  metadata JSONB, -- Additional fields (author, image, etc.)
  published BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_type ON content (content_type, published);
CREATE INDEX idx_content_sort ON content (sort_order);
```

### Performance Optimization
```sql
-- Materialized view for route demand analytics
CREATE MATERIALIZED VIEW route_demand AS
SELECT 
  from_station_id,
  to_station_id,
  COUNT(*) as dream_count,
  AVG(CASE 
    WHEN participation_level = 'organize_party' THEN 3
    WHEN participation_level = 'join_party' THEN 2
    ELSE 1 
  END) as engagement_score
FROM dreams 
GROUP BY from_station_id, to_station_id;

CREATE UNIQUE INDEX idx_route_demand_unique ON route_demand (from_station_id, to_station_id);

-- Refresh strategy: Every hour
CREATE OR REPLACE FUNCTION refresh_route_demand()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY route_demand;
END;
$$ LANGUAGE plpgsql;
```

## 4. API Architecture & Design

### RESTful API Endpoints

#### Places API
```typescript
// GET /api/places/search?q=vienna&lang=en&limit=10
// GET /api/places/:placeId?lang=en
// Response: Place with localized content
interface PlaceResponse {
  place_id: string;
  place_name: string; // Localized
  place_country: string; // Localized
  place_brief_desc: string; // Localized
  place_longer_desc: string; // Localized
  place_image: string;
  coordinates: [number, number];
  meta_title: string; // For SEO
  meta_description: string; // For SEO
}
```

#### Stations API
```typescript
// GET /api/stations/search?q=berlin&country=DE&limit=10
// GET /api/stations/near?lat=52.5&lon=13.4&radius=50
interface StationResponse {
  id: string;
  name: string; // Localized
  city: string; // Localized
  country: string;
  coordinates: [number, number];
  station_type: string;
  accessibility_level: number;
}
```

#### Dreams API
```typescript
// POST /api/dreams
// GET /api/dreams?limit=50&offset=0
interface CreateDreamRequest {
  place_id: string;
  from_station_id?: string;
  to_station_id?: string;
  dreamer_name: string;
  dreamer_email?: string;
  why_important: string;
  participation_level: 'dream_only' | 'join_party' | 'organize_party';
  language: string;
}

interface DreamResponse {
  id: string;
  success: boolean;
  message: string; // Localized
  discord_invite?: string; // For participants
}
```

#### Content API
```typescript
// GET /api/content/:type?lang=en
// For testimonials, FAQs, page content
interface ContentResponse {
  content_key: string;
  title: string; // Localized
  body: string; // Localized
  metadata: any;
}
```

### Authentication Strategy
- **Public APIs**: Rate-limited by IP (100 requests/hour)
- **Admin APIs**: JWT authentication with role-based access
- **Form Submissions**: CSRF protection + honeypot fields

### Rate Limiting Strategy
```typescript
// Redis-based rate limiting
const rateLimits = {
  search: { requests: 30, window: '1m' }, // Search APIs
  submit: { requests: 5, window: '1h' }, // Form submissions
  api: { requests: 100, window: '1h' }, // General API access
  admin: { requests: 1000, window: '1h' } // Admin access
};
```

### Caching Strategy
```typescript
// Cache layers
const cacheStrategy = {
  places: { ttl: '24h', invalidation: 'manual' }, // Static data
  stations: { ttl: '6h', invalidation: 'webhook' }, // OpenRailMaps updates
  content: { ttl: '1h', invalidation: 'on-publish' }, // CMS content
  analytics: { ttl: '15m', invalidation: 'time-based' }, // Stats/counts
  routes: { ttl: '30m', invalidation: 'on-dream-submit' } // Route demand
};
```

## 5. Multilingual Implementation Strategy

### Language Support Priority
1. **Phase 1 (Launch)**: English (en), German (de), French (fr)
2. **Phase 2 (Q2)**: Spanish (es), Italian (it), Dutch (nl)
3. **Phase 3 (Q3)**: Portuguese (pt), Polish (pl), Czech (cs)

### Content Translation Approach
```typescript
// Database storage (JSONB)
{
  "title": {
    "en": "Vienna",
    "de": "Wien", 
    "fr": "Vienne"
  }
}

// Helper function for localized content
function getLocalizedContent(content: any, language: string, fallback = 'en'): string {
  return content[language] || content[fallback] || Object.values(content)[0];
}
```

### Next.js i18n Configuration
```typescript
// next.config.js
const nextConfig = {
  i18n: {
    locales: ['en', 'de', 'fr'],
    defaultLocale: 'en',
    localeDetection: true,
    domains: [
      {
        domain: 'pyjama-party.back-on-track.eu',
        defaultLocale: 'en',
      }
    ]
  }
};
```

### URL Structure
```
/en/dream/vienna_1      - English
/de/traum/vienna_1      - German  
/fr/reve/vienna_1       - French
```

### Translation Management
- **Static Content**: JSON files in `/locales/{lang}/{namespace}.json`
- **Dynamic Content**: Database JSONB with admin interface
- **Workflow**: Export → Translate → Import → Review → Publish

## 6. Testing Strategy

### Unit Testing (Vitest)
```typescript
// Component testing
describe('PlaceSelectionMap', () => {
  test('renders search functionality', () => {});
  test('handles place selection', () => {});
  test('displays error states gracefully', () => {});
});

// API testing  
describe('/api/places/search', () => {
  test('returns localized results', () => {});
  test('handles invalid queries', () => {});
  test('respects rate limits', () => {});
});
```

### Integration Testing (Playwright)
```typescript
// Database integration
test('dream submission creates database record', async () => {
  // Test full API → Database → Response flow
});

// External API integration
test('OpenRailMaps station search', async () => {
  // Test external API reliability
});
```

### End-to-End Testing (Playwright)
```typescript
// Critical user journeys
test('complete dream submission flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="place-vienna"]');
  await page.click('[data-testid="plan-journey"]');
  await page.selectOption('[data-testid="from-station"]', 'berlin-hbf');
  await page.click('[data-testid="join-movement"]');
  await page.fill('[data-testid="name"]', 'Test User');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.click('[data-testid="submit"]');
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});

// Multilingual testing
test('German language flow', async ({ page }) => {
  await page.goto('/de');
  // Test German content and forms
});
```

### Performance Testing (k6)
```javascript
// Load testing critical endpoints
export default function () {
  group('Places Search', () => {
    http.get('https://pyjama-party.back-on-track.eu/api/places/search?q=berlin');
  });
  
  group('Dream Submission', () => {
    http.post('https://pyjama-party.back-on-track.eu/api/dreams', dreamPayload);
  });
}
```

### Testing Data Management
```sql
-- Test data factory
INSERT INTO places (place_id, place_name, place_country, ...) VALUES
  ('test_vienna', '{"en":"Test Vienna"}', '{"en":"Austria"}', ...),
  ('test_berlin', '{"en":"Test Berlin"}', '{"en":"Germany"}', ...);
```

## 7. Production Deployment Plan

### Infrastructure Requirements
```yaml
# Server specifications
server:
  cpu: 4 cores (ARM64 preferred)
  memory: 8GB RAM
  storage: 100GB SSD
  bandwidth: 1TB/month
  location: Europe (Frankfurt/Amsterdam)

# Software stack
stack:
  os: Ubuntu 22.04 LTS
  node: 20.x LTS
  postgresql: 15.x
  nginx: Latest stable
  ssl: Let's Encrypt
```

### Deployment Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /var/www/pyjama-party
            git pull origin main
            npm ci --only=production
            npm run build
            sudo systemctl reload nginx
            sudo systemctl restart pyjama-party
```

### Environment Configuration
```bash
# Production environment variables
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@localhost:5432/pyjama_party
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx
OPENRAILMAPS_API_KEY=xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.eu.mailgun.org
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/pyjama-party.back-on-track.eu
server {
    listen 443 ssl http2;
    server_name pyjama-party.back-on-track.eu;
    
    ssl_certificate /etc/letsencrypt/live/pyjama-party.back-on-track.eu/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pyjama-party.back-on-track.eu/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;
    
    # Static files caching
    location /_next/static {
        alias /var/www/pyjama-party/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backup Strategy
```bash
#!/bin/bash
# Daily automated backups
pg_dump pyjama_party | gzip > /backups/pyjama_party_$(date +%Y%m%d).sql.gz

# Weekly cleanup (keep 4 weeks)
find /backups -name "pyjama_party_*.sql.gz" -mtime +28 -delete

# Monthly full backup to S3
aws s3 cp /backups/pyjama_party_$(date +%Y%m%d).sql.gz s3://pyjama-party-backups/
```

## 8. Performance & SEO Optimization

### Core Web Vitals Targets
```typescript
// Performance budgets
const performanceTargets = {
  LCP: '<2.5s', // Largest Contentful Paint
  FID: '<100ms', // First Input Delay  
  CLS: '<0.1', // Cumulative Layout Shift
  TTFB: '<600ms', // Time to First Byte
  pageSize: '<500KB', // Initial page load
  imageSize: '<200KB' // Per image
};
```

### Image Optimization Strategy
```typescript
// next.config.js
const nextConfig = {
  images: {
    domains: ['triphop.info'],
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  }
};

// Component usage
<Image
  src={place.place_image}
  alt={place.place_name}
  width={1200}
  height={800}
  priority={isAboveFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
/>
```

### SEO Implementation
```typescript
// app/dream/[placeId]/page.tsx
export async function generateMetadata({ params }: { params: { placeId: string } }) {
  const place = await getPlace(params.placeId);
  
  return {
    title: `Dream Destination: ${place.place_name} | Night Train Journey`,
    description: place.place_brief_desc,
    keywords: `night train, ${place.place_name}, ${place.place_country}, sustainable travel, climate action`,
    openGraph: {
      title: `Wake up in ${place.place_name} tomorrow`,
      description: place.place_brief_desc,
      images: [place.place_image],
      type: 'website',
      locale: 'en_US',
      alternateLocale: ['de_DE', 'fr_FR']
    },
    twitter: {
      card: 'summary_large_image',
      title: `Dream destination: ${place.place_name}`,
      description: place.place_brief_desc,
      images: [place.place_image]
    },
    canonical: `https://pyjama-party.back-on-track.eu/dream/${params.placeId}`,
    alternates: {
      languages: {
        'en': `/en/dream/${params.placeId}`,
        'de': `/de/traum/${params.placeId}`,
        'fr': `/fr/reve/${params.placeId}`
      }
    }
  };
}
```

### Structured Data
```typescript
// JSON-LD for rich snippets
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "European Pyjama Party for Night Trains",
  "startDate": "2025-09-26T19:00:00+02:00",
  "endDate": "2025-09-26T21:00:00+02:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Train stations across Europe"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Back-on-Track Action Group",
    "url": "https://back-on-track.eu"
  }
};
```

## 9. Analytics & Monitoring

### Analytics Implementation
```typescript
// Google Analytics 4 + Plausible (privacy-friendly)
const analyticsConfig = {
  ga4: {
    measurementId: 'G-XXXXXXXXXX',
    events: ['dream_submit', 'place_select', 'participation_level']
  },
  plausible: {
    domain: 'pyjama-party.back-on-track.eu',
    apiHost: 'https://plausible.io'
  }
};

// Custom event tracking
function trackEvent(eventName: string, parameters: any) {
  // GA4
  gtag('event', eventName, parameters);
  
  // Plausible
  plausible(eventName, { props: parameters });
}
```

### Conversion Funnel Tracking
```typescript
// Track user progression through funnel
const funnelSteps = [
  'homepage_visit',
  'place_selected', 
  'dream_page_view',
  'connection_started',
  'movement_introduced',
  'participation_form_view',
  'dream_submitted',
  'community_joined'
];
```

### Error Monitoring (Sentry)
```typescript
// Sentry configuration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new BrowserTracing(),
    new Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0
});
```

### Performance Monitoring
```typescript
// Custom performance metrics
function reportWebVitals(metric: any) {
  // Send to analytics
  gtag('event', metric.name, {
    value: Math.round(metric.value),
    event_category: 'Web Vitals',
    non_interaction: true
  });
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
}
```

## 10. Content Migration & Management

### Existing Content Integration
```typescript
// Content mapping from current homepage
const contentMigration = {
  testimonials: '/success-stories', // Dedicated page
  stats: '/about#impact', // About page section
  eventDetails: '/pyjama-party', // Dedicated page
  climateInfo: '/climate-action', // Dedicated page
  aboutBackOnTrack: '/about', // Dedicated page
  discord: '/community' // Post-conversion page
};
```

### Content Management Workflow
```typescript
// Admin interface for content updates
interface ContentManagement {
  testimonials: {
    add: () => void;
    edit: (id: string) => void;
    reorder: () => void;
    translate: (id: string, language: string) => void;
  };
  
  places: {
    updateDescriptions: () => void;
    addImages: () => void;
    manageSEO: () => void;
  };
  
  translations: {
    exportForTranslation: () => void;
    importTranslations: () => void;
    reviewTranslations: () => void;
  };
}
```

## 11. Security & Privacy

### GDPR Compliance
```typescript
// Privacy-first data collection
const dataRetention = {
  dreamData: '30 days', // Auto-delete after event
  emailOptIns: 'Until unsubscribe',
  analytics: '26 months', // GA4 default
  logs: '90 days'
};

// Cookie consent management
const cookieConfig = {
  essential: ['session', 'language'], // No consent needed
  analytics: ['ga4', 'plausible'], // Requires consent
  marketing: [], // None used
};
```

### Security Headers
```typescript
// Next.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 12. Launch Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema implementation
- [ ] Core API endpoints
- [ ] Multilingual infrastructure
- [ ] Basic testing setup

### Phase 2: Core Features (Week 3-4)
- [ ] Complete user flow implementation
- [ ] OpenRailMaps integration
- [ ] Form validation & error handling
- [ ] SEO optimization

### Phase 3: Content & Polish (Week 5-6)
- [ ] Content migration & translation
- [ ] Performance optimization
- [ ] Comprehensive testing
- [ ] Admin interface

### Phase 4: Deployment & Launch (Week 7-8)
- [ ] Production environment setup
- [ ] CI/CD pipeline
- [ ] Monitoring & analytics
- [ ] Soft launch & feedback

### Phase 5: Scale & Optimize (Week 9+)
- [ ] Performance tuning
- [ ] Additional languages
- [ ] Feature enhancements
- [ ] Community features

---

*This architecture balances completeness with maintainability, ensuring the platform can launch successfully while supporting the movement's growth and the September 26, 2025 event.*
