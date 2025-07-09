# Technical Architecture: Pajama Party Platform

## System Overview

A privacy-first, mobile-responsive web application that collects European night train destination desires, visualizes them on an interactive map, and facilitates community building for grassroots activism.

## Architecture Principles

### Privacy by Design
- Minimal data collection (station preferences only)
- Anonymous submissions with optional email verification
- No user tracking or behavioral analytics
- GDPR compliance built-in

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern browsers
- Mobile-first responsive design
- Graceful degradation for older devices

### Scalability
- Stateless backend design
- Database optimization for geospatial queries
- CDN-ready static assets
- Horizontal scaling capability

## Technology Stack

### Frontend (MVP)
- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Custom properties, flexbox/grid, responsive design
- **Vanilla JavaScript**: Form handling, map integration, API calls
- **Mapbox GL JS**: Interactive European map visualization

### Frontend (Production)
- **React 18**: Component-based UI, efficient updates
- **TypeScript**: Type safety, better developer experience
- **Styled Components**: CSS-in-JS with BoT brand tokens
- **React Query**: Server state management and caching

### Backend
- **Node.js 18+**: JavaScript runtime environment
- **Express.js**: Web framework, API endpoints
- **PostgreSQL 14+**: Primary database with PostGIS extension
- **Prisma**: Database ORM and migration management

### Infrastructure
- **Docker**: Containerized deployment
- **Nginx**: Reverse proxy, static asset serving
- **Redis**: Session storage, rate limiting
- **PM2**: Process management for Node.js

## Database Design

### Core Tables

```sql
-- European rail stations master data
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    country_code CHAR(2) NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,
    station_type VARCHAR(50) DEFAULT 'regional',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User dream submissions
CREATE TABLE dream_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    email_hash VARCHAR(64), -- SHA-256 hash for verification
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
);

-- Aggregated statistics for advocacy
CREATE TABLE connection_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin_station_id UUID REFERENCES stations(id),
    destination_station_id UUID REFERENCES stations(id),
    submission_count INTEGER DEFAULT 1,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(origin_station_id, destination_station_id)
);

-- Community coordination
CREATE TABLE station_communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id UUID REFERENCES stations(id),
    participant_count INTEGER DEFAULT 0,
    discord_channel_id VARCHAR(255),
    pajama_party_planned BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes and Performance

```sql
-- Geospatial indexes for station lookups
CREATE INDEX idx_stations_coordinates ON stations USING GIST(coordinates);
CREATE INDEX idx_stations_country ON stations(country_code);

-- Query optimization for submissions
CREATE INDEX idx_submissions_origin ON dream_submissions(origin_station_id);
CREATE INDEX idx_submissions_destination ON dream_submissions(destination_station_id);
CREATE INDEX idx_submissions_created ON dream_submissions(created_at);

-- Statistics aggregation
CREATE INDEX idx_stats_connection ON connection_stats(origin_station_id, destination_station_id);
```

## API Design

### RESTful Endpoints

```javascript
// Station search and autocomplete
GET /api/stations/search?q={query}&country={code}
Response: [{ id, name, country, coordinates }]

// Submit dream destination
POST /api/dreams
Body: { originStationId, destinationStationId, email? }
Response: { id, message, verificationRequired }

// Get map visualization data
GET /api/map/data?bounds={bbox}
Response: { 
  origins: [{ stationId, coordinates, count }],
  destinations: [{ stationId, coordinates, count }],
  connections: [{ origin, destination, count }]
}

// Community status for station
GET /api/community/{stationId}
Response: { participantCount, pajamaPartyPlanned, discordChannel }

// Email verification
POST /api/verify
Body: { token }
Response: { success, discordInvite? }
```

### Rate Limiting
```javascript
// Submission limits
POST /api/dreams: 5 requests per hour per IP
POST /api/verify: 10 requests per hour per IP

// Search limits
GET /api/stations/search: 100 requests per hour per IP
GET /api/map/data: 50 requests per hour per IP
```

## Frontend Architecture

### Component Structure (React)
```
src/
├── components/
│   ├── Map/
│   │   ├── EuropeanMap.tsx
│   │   ├── StationPin.tsx
│   │   └── ConnectionLine.tsx
│   ├── Forms/
│   │   ├── DreamForm.tsx
│   │   ├── StationSearch.tsx
│   │   └── EmailVerification.tsx
│   ├── Community/
│   │   ├── StationCommunity.tsx
│   │   ├── DiscordInvite.tsx
│   │   └── PajamaPartyKit.tsx
│   └── Layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── MobileNav.tsx
├── hooks/
│   ├── useMapData.ts
│   ├── useStationSearch.ts
│   └── useCommunityStatus.ts
├── services/
│   ├── api.ts
│   ├── mapbox.ts
│   └── discord.ts
└── styles/
    ├── globals.css
    ├── tokens.css
    └── components/
```

### State Management
```typescript
// Global state with React Context
interface AppState {
  user: {
    submittedDream: boolean;
    email?: string;
    verificationStatus: 'pending' | 'verified' | 'none';
  };
  map: {
    selectedStation?: Station;
    bounds: MapBounds;
    data: MapData;
  };
  community: {
    userStation?: Station;
    participantCount: number;
    discordInvite?: string;
  };
}
```

## Data Processing Pipeline

### Station Data Import
```javascript
// OSM station data processing
const processOSMStations = async () => {
  const osmData = await fetchOSMRailwayStations();
  const europeanStations = filterEuropeanCountries(osmData);
  const cleanedData = validateAndCleanStations(europeanStations);
  await bulkInsertStations(cleanedData);
};
```

### Real-time Aggregation
```sql
-- Trigger for automatic statistics updates
CREATE OR REPLACE FUNCTION update_connection_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO connection_stats (origin_station_id, destination_station_id, submission_count)
  VALUES (NEW.origin_station_id, NEW.destination_station_id, 1)
  ON CONFLICT (origin_station_id, destination_station_id)
  DO UPDATE SET 
    submission_count = connection_stats.submission_count + 1,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER dream_submission_stats
  AFTER INSERT ON dream_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_connection_stats();
```

## Security Implementation

### Input Validation
```javascript
// Station ID validation
const validateStationId = (id) => {
  if (!isUUID(id)) throw new ValidationError('Invalid station ID');
  return sanitizeUUID(id);
};

// Email sanitization
const validateEmail = (email) => {
  const cleaned = sanitizeEmail(email);
  if (!isValidEmail(cleaned)) throw new ValidationError('Invalid email');
  return cleaned;
};
```

### Data Privacy
```javascript
// Email hashing for verification
const hashEmail = (email) => {
  return crypto.createHash('sha256').update(email).digest('hex');
};

// Automatic data cleanup
const cleanupExpiredSubmissions = async () => {
  await db.dreamSubmissions.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
};
```

### CORS and Headers
```javascript
// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  next();
});

// CORS configuration
const corsOptions = {
  origin: ['https://pajama-party.back-on-track.eu'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
};
```

## Performance Optimization

### Database Optimization
```sql
-- Materialized view for map data
CREATE MATERIALIZED VIEW map_visualization AS
SELECT 
  s1.id as origin_id,
  s1.coordinates as origin_coords,
  s2.id as destination_id, 
  s2.coordinates as destination_coords,
  cs.submission_count
FROM connection_stats cs
JOIN stations s1 ON s1.id = cs.origin_station_id
JOIN stations s2 ON s2.id = cs.destination_station_id
WHERE cs.submission_count > 0;

-- Refresh strategy
REFRESH MATERIALIZED VIEW CONCURRENTLY map_visualization;
```

### Caching Strategy
```javascript
// Redis caching for map data
const getMapData = async (bounds) => {
  const cacheKey = `map:${bounds.toString()}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const data = await db.query.getMapDataForBounds(bounds);
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // 5min cache
  
  return data;
};
```

### Frontend Performance
```javascript
// Lazy loading for map components
const EuropeanMap = lazy(() => import('./components/Map/EuropeanMap'));

// Virtual scrolling for station search
const StationSearch = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const { data: stations } = useVirtualizedStationSearch(query);
  
  return (
    <VirtualizedList
      items={stations}
      renderItem={StationItem}
      onSelect={onSelect}
    />
  );
};
```

## Deployment Architecture

### Docker Configuration
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/pajama_party
    depends_on:
      - db
      - redis

  db:
    image: postgis/postgis:14-3.2
    environment:
      POSTGRES_DB: pajama_party
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
```

## Monitoring and Analytics

### Application Monitoring
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    await redis.ping();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Privacy-Compliant Analytics
```javascript
// Simple, anonymous usage tracking
const trackEvent = (event, properties = {}) => {
  const anonymousData = {
    event,
    timestamp: new Date().toISOString(),
    properties: sanitizeProperties(properties)
  };
  
  // Log to structured logs, not external analytics
  logger.info('user_event', anonymousData);
};
```

## Integration Points

### Discord Bot Integration
```javascript
// Discord webhook for community building
const notifyDiscord = async (stationId, participantCount) => {
  if (participantCount >= 2) {
    await discord.sendMessage({
      channel: 'action-group-general',
      content: `🎉 ${participantCount} people from ${station.name} are ready for a pajama party!`
    });
  }
};
```

### Back-on-Track API Integration
```javascript
// Future integration with BoT night train database
const enrichWithNightTrainData = async (connections) => {
  const nightTrainConnections = await botAPI.getNightTrainRoutes();
  return connections.map(conn => ({
    ...conn,
    hasNightTrain: nightTrainConnections.includes(`${conn.origin}-${conn.destination}`)
  }));
};
```

---

**This architecture balances rapid MVP development with production scalability, ensuring the platform can grow from Action Group demo to Europe-wide advocacy tool.**