# 🚂 Development Rules: Pyjama Party Platform

> Note (2025‑08‑27): TripHop/Howard’s dataset is no longer used; `/api/places` was removed. Current implementation uses user‑submitted dreams (sanitized views). Stations integration via OpenRailwayMap (offline fetch + viewport API) is planned. See `docs/CLAUDE_CODEX_COLLABORATION.md`.

> **Core Principles for Implementation Sessions**

## 1. Platform Architecture Rules

### **Two-Tier Data System**
```
DREAMERS (Open Access)
├── Cities/Towns (700+ European locations from Howard's dataset)
├── Form-first interaction → Map visualization second
├── No email required
├── Focus: Route demand visualization
└── Data: Origin city → Destination city + personal story

PYJAMA PARTY PARTICIPANTS (Email Required)
├── Train Stations (OpenRailMap/Overpass API - all European stations)
├── Form-first interaction → Map visualization second
├── Email required + role selection (Participate/Organize)
├── Focus: September 26th event coordination
└── Data: Station selection + contact info + coordination role
```

### **Progressive Engagement Flow**
```
Visit → Dream Route (city/town) → See collective impact → 
Optional: Join pyjama party (train station) → Email + role → 
PDF download + Discord invite
```

## 2. Data Architecture Rules

### **Cities vs Stations Logic**
- **Dreamers**: Use Howard's 700-place European dataset (cities/towns)
- **Pyjama participants**: Use comprehensive train station database
- **Smart suggestions**: When dreamer selects cities, show nearest train stations for potential pyjama party participation
- **Database design**: Separate tables for cities and stations with relationship mapping

### **Data Sources Integration**
```
PRIMARY: Howard's TripHop dataset (700+ European places)
├── File: https://triphop.info/static/places.json
├── Contains: lat/lng, descriptions, images
├── Usage: Dreamer route selection

SECONDARY: OpenRailMap/Overpass API
├── Source: OpenStreetMap railway=station tags
├── Coverage: All European train stations (comprehensive)
├── Usage: Pyjama party location selection
├── Backup: Current limited station database
```

## 3. User Experience Rules

### **Form-First Interaction**
- **Primary**: Form input with autocomplete
- **Secondary**: Map interaction (click-to-select)
- **Fallback**: Manual text entry
- **Validation**: Real-time with helpful suggestions

### **Map Visualization Rules**
- **Dreamers**: Show city-to-city routes with popularity indicators
- **Pyjama participants**: Show train stations with event planning indicators
- **Interactive elements**: Hover details, click for more info
- **Performance**: Lazy loading, efficient rendering

## 4. Technical Implementation Rules

### **Spelling Consistency**
- **Global replacement**: pyjama → pyjama everywhere
- **File names**: Update all references
- **Documentation**: Consistent spelling throughout
- **Database**: Update table names and column references

### **API Integration Rules**
```
DATA FETCHING STRATEGY:
1. Static integration of Howard's dataset (initial)
2. Dynamic OpenRailMap API integration (train stations)
3. Caching layer for performance
4. Fallback to current database if API fails
```

### **Discord Integration Rules**
- **Automatic invite generation** after email signup
- **Role assignment**: "Participant" vs "Organizer"
- **Channel management**: City-based channels (managed by Action Group)
- **Privacy**: No personal data shared beyond Discord invite

## 5. Content and Resource Rules

### **Party Kit Distribution**
- **Source**: Ellie's updated 2025 party kit (Google Doc → PDF)
- **Access**: Email signup required
- **Download**: Direct PDF download from platform
- **Versioning**: Track downloads and kit versions
- **Updates**: Easy content management for Action Group

### **Multi-language Priority**
- **Phase 1**: English (primary)
- **Phase 2**: German, French, Italian, Spanish
- **Implementation**: i18n framework preparation
- **Content**: Both interface and party kit translations

## 6. Development Session Rules

### **Code Quality Standards**
- **TypeScript**: Strict typing for all new code
- **Testing**: Write tests for new features
- **Documentation**: Update API docs with new endpoints
- **Performance**: Mobile-first, accessibility compliance

### **Database Migration Rules**
- **Safe migrations**: No data loss during updates
- **Backup strategy**: Before schema changes
- **Testing**: Validate migrations in development
- **Rollback plan**: Always have rollback scripts

## 7. Documentation Structure Rules

### **Keep These Files:**
- `README.md` - Main project documentation
- `setup-database.sql` - Primary database schema
- `LICENSE` - MIT license

### **Update These Files:**
- `ROADMAP.md` - Fix timeline dates, mark completed phases
- Global spelling: pyjama → pyjama

### **Delete These Files:**
- `GITHUB_FINAL_CLEANUP.md` - Outdated task document
- `src/lib/database-schema.sql` - Redundant schema
- `QUICK_FIX.sql` - Temporary fix artifact

### **Create These Files:**
- `USER_FLOW.md` - Document 2-tier engagement system
- `API_DOCUMENTATION.md` - Complete API endpoint documentation
- `DISCORD_INTEGRATION.md` - Coordination workflow
- `DATA_SOURCES.md` - Howard's dataset + OpenRailMap integration

## 8. Feature Development Priority

### **Phase 1: Core Functionality (Next Development Session)**
1. **Howard's dataset integration** - Cities/towns for dreamers
2. **OpenRailMap API integration** - Train stations for pyjama participants
3. **Form-first UX** - Autocomplete with map as secondary
4. **Global spelling update** - pyjama → pyjama
5. **Database schema update** - Cities vs stations architecture

### **Phase 2: Engagement Features**
1. **Progressive engagement flow** - Dream → pyjama party suggestion
2. **Discord integration** - Automatic invite system
3. **Party kit download** - PDF distribution system
4. **Smart suggestions** - Nearest stations for cities

### **Phase 3: Enhancement Features**
1. **Multi-language support** - i18n implementation
2. **Advanced map features** - Enhanced data visualization
3. **Community features** - Better coordination tools
4. **Analytics integration** - Action Group insights

## 9. Questions for Clarification

### **Technical Architecture**
1. **Database strategy**: Should we migrate existing dreams to new city-based structure, or run parallel systems?
2. **API rate limits**: How should we handle OpenRailMap API limitations? Cache strategy?
3. **Data updates**: How frequently should we sync with external data sources?

### **User Experience**
1. **Transition flow**: When dreamers select cities, should we automatically suggest nearest train stations?
2. **Map interaction**: Should clicking on map auto-fill form fields, or open modal with details?
3. **Mobile experience**: Any specific mobile UX requirements for event day coordination?

### **Content Management**
1. **Party kit updates**: How will Ellie update the PDF? Manual upload or automated sync?
2. **Discord management**: Who manages channel creation and moderation?
3. **Multi-language**: Should we start with interface translation or party kit translation first?

## 10. Success Metrics

### **Development Success**
- Clean separation of cities vs stations data
- Smooth form-first interaction with map fallback
- Successful integration of Howard's dataset
- Automatic Discord invite system working

### **User Success**
- Increased dreamer engagement (city selection easier)
- More pyjama party signups (clear station selection)
- Smooth progression from dreamer to participant
- Party kit distribution working smoothly

---

**Next Session Goals**: Implement Phase 1 features based on these rules, focusing on data architecture and user experience improvements.
