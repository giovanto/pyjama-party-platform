# 📋 V1 Feature Inventory - Complete Reference

> **CRITICAL**: This document catalogs EVERY feature in V1 that must be preserved in V3. Use this as a checklist during development.

## 🎯 **Complete Feature List**

### **1. User Interface Components**

#### **Header Component** (`v1/frontend/index.html` lines 31-43)
- ✅ Back-on-Track logo (bot-logo.svg)
- ✅ Navigation links (About, Community)
- ✅ Primary CTA button linking to Back-on-Track website
- ✅ Responsive design with mobile considerations
- ✅ Sticky positioning

#### **Event Banner** (`v1/frontend/scripts/main.js` lines 273-295)
- ✅ Countdown timer to September 26, 2025
- ✅ "European Train Adventure Challenge" text
- ✅ Days remaining display (3-digit format with leading zeros)
- ✅ Pulse animation effect
- ✅ Gradient background (BoT green to blue)
- ✅ Updates every hour automatically
- ✅ Handles timezone correctly

#### **Floating Navigation** (`v1/frontend/scripts/main.js` lines 344-398)
- ✅ Scroll-triggered visibility (appears after 300px scroll)
- ✅ Hide when scrolling down, show when scrolling up
- ✅ Active section highlighting based on scroll position
- ✅ Smooth scroll to sections on click
- ✅ Icons for each section (🌙 Dream, 🗺️ Map, 👥 Community, ℹ️ About)
- ✅ Bottom-center positioning with transform animations
- ✅ Backdrop blur effect
- ✅ Responsive design for mobile

### **2. Dream Submission Form**

#### **Form Structure** (`v1/frontend/scripts/form.js`)
- ✅ Dreamer name field (required, min 2 characters)
- ✅ Origin station field with autocomplete
- ✅ Destination city field with suggestions
- ✅ Optional email field with validation
- ✅ Submit button with loading states

#### **Validation Logic** (`v1/frontend/scripts/form.js` lines 188-285)
- ✅ Real-time validation on field blur
- ✅ Name validation: required, min 2 chars, max 255 chars
- ✅ Origin station validation: required, min 1 char
- ✅ Destination validation: required, min 1 char
- ✅ Email validation: optional, valid email format
- ✅ Error message display with red styling
- ✅ Field error classes for visual feedback

#### **Autocomplete System** (`v1/frontend/scripts/form.js` lines 84-180)
- ✅ Station search with 300ms debouncing
- ✅ Min 2 characters to trigger search
- ✅ Results caching to avoid duplicate API calls
- ✅ Dropdown with station name and country
- ✅ Click to select functionality
- ✅ Keyboard navigation support
- ✅ Hide suggestions on outside click
- ✅ Loading indicator during search

#### **Destination Suggestions** (`v1/frontend/scripts/form.js` lines 101-128)
- ✅ Predefined list of 15 European cities
- ✅ Cities: Barcelona, Prague, Stockholm, Vienna, Venice, Budapest, Copenhagen, Amsterdam, Berlin, Paris, Rome, Madrid, Oslo, Helsinki, Zurich
- ✅ Each with coordinates for map display
- ✅ Fuzzy search by city name or country
- ✅ Max 20 results displayed

#### **Form Submission** (`v1/frontend/scripts/form.js` lines 287-342)
- ✅ Form validation before submission
- ✅ Loading overlay during submission
- ✅ Submit button disabled state with "Adding to map..." text
- ✅ API call with timeout handling
- ✅ Success message display
- ✅ Community message integration
- ✅ Form reset after successful submission
- ✅ Error handling with user-friendly messages
- ✅ Automatic map update with new dream

### **3. Interactive Map**

#### **Map Configuration** (`v1/frontend/scripts/map.js` lines 10-36)
- ✅ Mapbox GL JS integration
- ✅ Light style theme (mapbox://styles/mapbox/light-v11)
- ✅ Center on Europe (13.4, 52.5)
- ✅ Zoom level 4 initial, min 2, max 18
- ✅ Navigation controls (zoom, compass)
- ✅ Fullscreen control
- ✅ Responsive resize handling

#### **Data Sources** (`v1/frontend/scripts/map.js` lines 55-83)
- ✅ Origins source (GeoJSON FeatureCollection)
- ✅ Destinations source (GeoJSON FeatureCollection)
- ✅ Dream lines source (connecting origins to destinations)
- ✅ Dynamic data updates without map reload

#### **Map Layers** (`v1/frontend/scripts/map.js` lines 85-128)
- ✅ Dream lines layer (blue lines, 2px width, 0.7 opacity)
- ✅ Origins layer (green circles, 8px radius, white stroke)
- ✅ Destinations layer (blue circles, 10px radius, white stroke)
- ✅ Proper layer ordering (lines below points)

#### **Map Interactions** (`v1/frontend/scripts/map.js` lines 130-195)
- ✅ Hover cursor change on interactive elements
- ✅ Click popups for origins showing station info
- ✅ Click popups for destinations showing city info
- ✅ Popup content includes dreamers count
- ✅ Auto-close previous popups

#### **Data Visualization** (`v1/frontend/scripts/map.js` lines 209-316)
- ✅ Group dreams by origin station and destination city
- ✅ Show dreamer count for each location
- ✅ Draw lines between origin and destination coordinates
- ✅ Handle missing coordinates gracefully
- ✅ Update visualization in real-time

#### **Map Performance** (`v1/frontend/scripts/map.js` lines 337-371)
- ✅ Add new dreams without full reload
- ✅ Fly-to animation when new dream added
- ✅ Zoom to destination with 1-second transition
- ✅ Error handling for map loading failures
- ✅ Graceful degradation when map unavailable

### **4. Community Features**

#### **Statistics Display** (`v1/frontend/scripts/main.js` lines 318-335)
- ✅ Total dreams counter
- ✅ Active stations counter
- ✅ Communities forming counter (stations/3)
- ✅ Real-time updates every API call
- ✅ DOM element updates by ID
- ✅ Fallback to local data when API fails

#### **Dreamers List** (`v1/frontend/scripts/main.js` lines 297-335)
- ✅ Recent dreamers display (last 20, reversed order)
- ✅ Auto-refresh every 30 seconds
- ✅ Dreamer name and destination city
- ✅ "Anonymous" fallback for missing names
- ✅ "No dreamers yet. Be the first!" empty state
- ✅ XSS protection with HTML escaping
- ✅ Smooth animations for new entries

#### **Community Messages** (`v1/backend/server.js` lines 233-244)
- ✅ Random community messages for stations
- ✅ 4 different message templates
- ✅ Integration with form submission response
- ✅ Display after successful dream submission

#### **Discord Integration** (`v1/frontend/scripts/main.js` lines 105-119)
- ✅ Discord invite link configuration
- ✅ Multiple Discord buttons (header, footer, community)
- ✅ Target="_blank" and security attributes
- ✅ Integration with community messages

### **5. API Endpoints**

#### **Dreams API** (`v1/backend/server.js` lines 105-231)
- ✅ GET /api/dreams - Fetch all active dreams
- ✅ Active dreams filter (not expired)
- ✅ Order by created_at DESC
- ✅ Limit 1000 results
- ✅ Select specific fields only (security)
- ✅ POST /api/dreams - Submit new dream
- ✅ Request validation (name, origin, destination)
- ✅ Email validation if provided
- ✅ UUID generation for dream ID
- ✅ 30-day expiration setting
- ✅ Community message generation
- ✅ Stats update after insertion

#### **Stations API** (`v1/backend/server.js` lines 141-168)
- ✅ GET /api/stations/search - Station autocomplete
- ✅ Query parameter 'q' required
- ✅ Min 2 characters validation
- ✅ Fuzzy search on name and country
- ✅ Priority sorting (exact matches first)
- ✅ Limit 20 results
- ✅ Return name, country, lat, lng

#### **Statistics API** (`v1/backend/server.js` lines 124-139)
- ✅ GET /api/stats - Platform statistics
- ✅ Key-value pair structure
- ✅ Stats: total_dreams, active_stations
- ✅ Real-time calculation from database

#### **Community API** (`v1/backend/server.js` lines 246-267)
- ✅ GET /api/community/:station - Station community info
- ✅ Count dreamers from specific station
- ✅ Generate community message based on count
- ✅ Discord invite link included

#### **Health Check** (`v1/backend/server.js` lines 269-276)
- ✅ GET /api/health - System health status
- ✅ Returns status, timestamp, version
- ✅ Simple availability check

### **6. Database Schema**

#### **Dreams Table** (`v1/backend/server.js` lines 22-38)
```sql
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
```

#### **Stations Table** (`v1/backend/server.js` lines 47-56)
```sql
CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  type TEXT DEFAULT 'station',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **Stats Table** (`v1/backend/server.js` lines 58-63)
```sql
CREATE TABLE stats (
  key TEXT PRIMARY KEY,
  value INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **7. Application Logic**

#### **App Initialization** (`v1/frontend/scripts/main.js` lines 7-73)
- ✅ DOM ready check before initialization
- ✅ Required elements validation
- ✅ Component initialization in correct order
- ✅ Health check on startup
- ✅ Error handling with user feedback
- ✅ Global event listeners setup
- ✅ Window resize handling
- ✅ Visibility change detection
- ✅ Online/offline status monitoring

#### **Error Handling** (`v1/frontend/scripts/main.js` lines 210-224)
- ✅ Initialization error display
- ✅ Refresh page button on errors
- ✅ Graceful degradation for failed components
- ✅ Console logging for debugging
- ✅ User-friendly error messages

#### **Performance Features**
- ✅ Debounced scroll events (100ms)
- ✅ Debounced resize events (250ms)
- ✅ Debounced autocomplete search (300ms)
- ✅ API request caching
- ✅ Visibility-based pause/resume operations
- ✅ Request timeout handling (30 seconds)

### **8. Styling and UX**

#### **Brand Colors** (`v1/frontend/styles/main.css`)
- ✅ Primary: #008f39 (BoT Green)
- ✅ Secondary: #92d051 (BoT Light Green)
- ✅ Accent: #2271b3 (BoT Blue)
- ✅ Dark: #1a1a1a
- ✅ Light: #f8f9fa
- ✅ Complete gray scale (100-800)
- ✅ Error: #dc3545
- ✅ Success: #28a745
- ✅ Warning: #ffc107

#### **Typography** (`v1/frontend/styles/main.css`)
- ✅ Font family: 'Mark Pro' with fallbacks
- ✅ Font sizes: xs (0.75rem) to 4xl (2.25rem)
- ✅ Font weights: 400, 500, 600, 700
- ✅ Line heights optimized for readability

#### **Animations** (`v1/frontend/styles/improvements.css`)
- ✅ Smooth transitions (cubic-bezier timing)
- ✅ Hover effects on interactive elements
- ✅ Loading animations
- ✅ Scroll-triggered animations
- ✅ Form validation animations
- ✅ Success/error message animations
- ✅ Pulse effect for event banner
- ✅ Slide-up animations for new content

#### **Responsive Design**
- ✅ Mobile-first approach
- ✅ Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- ✅ Flexible grid layouts
- ✅ Optimized touch targets
- ✅ Readable font sizes on all devices
- ✅ Proper spacing and padding

### **9. Accessibility Features**

- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Alt text for images
- ✅ Focus styles for keyboard navigation
- ✅ ARIA labels where needed
- ✅ Color contrast compliance
- ✅ Form labels properly associated
- ✅ Error messages linked to fields

### **10. Browser Compatibility**

- ✅ Modern browsers support (ES6+)
- ✅ Mapbox GL JS compatibility
- ✅ Fetch API with fallbacks
- ✅ CSS Grid and Flexbox
- ✅ CSS custom properties (variables)
- ✅ Intersection Observer for scroll detection

## 🔍 **Key Implementation Details**

### **Critical Timing Values**
- Debounce delays: autocomplete (300ms), scroll (100ms), resize (250ms)
- API timeout: 30 seconds
- Auto-refresh intervals: dreamers list (30s), stats (60s), countdown (1h)
- Animation durations: fast (150ms), base (300ms), slow (500ms)

### **Critical Text Content**
- Event banner: "European Train Adventure Challenge"
- Countdown format: "XXX days left" (3-digit zero-padded)
- Form button: "Add my dream to the map"
- Loading text: "Adding to map..."
- Success message: "Dream submitted successfully!"
- Empty state: "No dreamers yet. Be the first!"

### **Critical API Response Structures**
- Dreams: `{ dreamer_name, origin_station, origin_country, origin_lat, origin_lng, destination_city, destination_country, destination_lat, destination_lng, created_at }`
- Stations: `{ name, country, lat, lng }`
- Stats: `{ total_dreams: number, active_stations: number }`
- Submit response: `{ id, message, community_message }`

### **Critical Configuration Values**
- Map center: [13.4, 52.5] (Europe)
- Map zoom: initial 4, min 2, max 18
- Dream expiration: 30 days
- Results limits: dreams (1000), stations (20), dreamers list (20)
- Coordinate bounds: lat [-90,90], lng [-180,180]

## ✅ **V3 Implementation Checklist**

Use this checklist to ensure 100% feature parity:

### **Phase 1: Foundation**
- [ ] Next.js project with exact same dependencies
- [ ] Environment configuration matching V1
- [ ] Brand colors and typography system
- [ ] Basic layout structure

### **Phase 2: Core Components**
- [ ] Header with logo and navigation
- [ ] Event banner with countdown timer
- [ ] Floating navigation with scroll detection
- [ ] Footer with Discord links

### **Phase 3: Form System**
- [ ] Dream form with all validation rules
- [ ] Station autocomplete with caching
- [ ] Destination suggestions (15 cities)
- [ ] Error handling and success messages
- [ ] Loading states and animations

### **Phase 4: Map Integration**
- [ ] Mapbox setup with exact configuration
- [ ] Three data sources (origins, destinations, lines)
- [ ] Three layers with exact styling
- [ ] Interactive popups with dreamer counts
- [ ] Real-time data updates

### **Phase 5: Community Features**
- [ ] Statistics display with auto-refresh
- [ ] Dreamers list with 30-second updates
- [ ] Community message generation
- [ ] Discord integration buttons

### **Phase 6: API Layer**
- [ ] Dreams endpoint (GET/POST)
- [ ] Stations search endpoint
- [ ] Statistics endpoint
- [ ] Community info endpoint
- [ ] Health check endpoint
- [ ] All validation rules matching V1

### **Phase 7: Styling**
- [ ] All V1 CSS ported exactly
- [ ] Animations and transitions working
- [ ] Responsive design complete
- [ ] Accessibility features included

### **Phase 8: Testing & Deployment**
- [ ] Unit tests for all components
- [ ] E2E tests for user journeys
- [ ] Performance testing
- [ ] Vercel deployment
- [ ] Production monitoring

---

**This inventory captures EVERY detail from V1. Use it as your definitive checklist during V3 development!** ✅