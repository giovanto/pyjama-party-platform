# Pajama Party Platform: "Where Would You Like to Wake Up Tomorrow?"

## Project Overview

A webapp for Back-on-Track activism that collects European night train destination desires, builds grassroots communities, and coordinates synchronized pajama parties across Europe. The platform bridges the gap between individual travel dreams and collective advocacy action.

## Mission Statement

**Primary Goal**: Inspire "normal" people (especially young Europeans) to discover night train possibilities, moving beyond the rail enthusiast bubble to mainstream sustainable travel awareness.

**Secondary Goals**:
- Collect advocacy data showing public demand for specific night train connections
- Build station-based communities of sustainable travel advocates
- Coordinate Europe-wide pajama party activism events
- Spread Back-on-Track mission through accessible, engaging platform

## Core Concept

### User Experience
1. **Landing Question**: "Where would you like to wake up tomorrow?"
2. **Input Form**: 
   - "Which station represents you?" (origin)
   - "Where would you like to wake up?" (destination)
3. **Map Visualization**: Interactive European map showing all submitted desires
4. **Community Building**: Connect users from same stations for local action
5. **Advocacy Integration**: Link to BoT mission, policy papers, main website

### Strategic Value
- **Advocacy Data**: "X people want night train connection from A to B"
- **Community Formation**: 2+ people from same station = pajama party potential
- **European Solidarity**: Continental-scale coordinated activism
- **Mainstream Outreach**: Romantic framing attracts non-activists

## Technical Architecture

### Frontend
- **Framework**: Vanilla HTML/CSS/JS (prototype), React (production)
- **Map**: Mapbox API integration
- **Design**: Back-on-Track brand guidelines
- **Mobile-First**: Essential for station-based usage

### Backend
- **Prototype**: Node.js/Express + SQLite
- **Production**: Node.js/Express + PostgreSQL
- **Database**: European rail stations + user submissions
- **API**: RESTful endpoints for submissions and map data

### Data Model
```sql
user_submissions:
- id (UUID)
- origin_station (validated against rail database)
- destination_station (validated against rail database)
- email_hash (verification only, privacy-first)
- created_at
- verified_at
- coordinates (lat/long for visualization)
```

## Privacy-First Design

### Data Collection
- **Anonymous**: No personal information beyond station preferences
- **Minimal Email**: Only for verification and Discord invitation
- **No Tracking**: No analytics, cookies, or user profiling
- **Transparent**: Clear privacy policy and data usage explanation

### Data Retention
- **Individual Data**: Deleted after 30 days
- **Aggregated Statistics**: Retained for advocacy purposes
- **User Control**: Easy data deletion and Discord opt-out

## Community Building Strategy

### Discord Integration
- **Main Channel**: #action-group-general for strategy and announcements
- **Event Coordination**: Station-specific organization through Discord
- **Threshold**: 2+ people from same station triggers pajama party suggestion
- **European Coordination**: September 2025 Berlin Conference tie-in

### Pajama Party Coordination
- **Date**: September 26, 2025 (18:30-19:30 CET)
- **Format**: Updated pajama party kit from Action Group
- **Locations**: European train stations with 2+ interested participants
- **Coordination**: Discord channels for local organization

## Integration with Back-on-Track

### Existing Resources
- **Night Train Database**: https://back-on-track.eu/open-night-train-database/
- **Graphics/Branding**: https://back-on-track.eu/graphics/
- **Berlin Conference**: https://back-on-track.eu/night-train-conference-2025/
- **Main Website**: Policy papers, mission statement, newsletter

### Brand Alignment
- **Tone**: Dreamy and inspirational first, advocacy second
- **Visual**: Clean, professional, youth-friendly
- **Messaging**: "Dream of sustainable travel" → "Make it reality together"

## Development Timeline

### Phase 1: MVP Prototype (2 Days)
**Goal**: Demo for Action Group meeting

**Day 1 (Today)**:
- Frontend: Landing page, form, basic map
- Backend: Simple server, SQLite database
- Data: European rail stations from OSM
- Integration: Basic Mapbox visualization

**Day 2 (Tomorrow)**:
- Polish: Visual design, mobile responsiveness
- Demo: Pre-populate with realistic data
- Presentation: 3-minute Action Group demo script
- Documentation: Future development roadmap

### Phase 2: Production Development (Post-Demo)
**Timeline**: July-August 2025

**Features**:
- Full privacy implementation
- Discord bot integration
- Email verification system
- Multi-language support
- Enhanced map features
- Station clustering algorithms

### Phase 3: September 2025 Activation
**Berlin Conference Integration**:
- Platform launch coordination
- European pajama party logistics
- Real-time event coordination
- Media and advocacy amplification

## Success Metrics

### Action Group Demo (Short-term)
- **Emotional Response**: "This makes me want to travel by night train"
- **Strategic Understanding**: "This gives us concrete advocacy data"
- **Community Potential**: "I can see local activist networks forming"
- **Integration Clarity**: "This supports our September coordination perfectly"

### Platform Launch (Medium-term)
- **Engagement**: 1000+ dream destinations submitted
- **Community**: 50+ stations with 2+ interested participants
- **Advocacy**: Concrete data for policy papers and lobbying
- **Outreach**: 80% of users new to Back-on-Track

### September 2025 Event (Long-term)
- **Scale**: 20+ European cities with synchronized pajama parties
- **Media**: International coverage of night train advocacy
- **Network**: Established activist communities in major European cities
- **Policy**: EU decision-makers aware of public demand for night trains

## Project Context

### Action Group Background
- **Co-leads**: Giovanni Antoniazzi, Ellie Cijvat
- **Core Members**: Howard Osborne, Peter Cornelius, Simone Zambrin
- **Meeting Schedule**: Monthly coordination meetings
- **Next Demo**: Action Group meeting in 2 days

### Strategic Alignment
- **Howard's Vision**: "Where do you want to go?" data collection
- **Ellie's Experience**: October 2024 pajama party kit and coordination
- **Giovanni's Skills**: Technical implementation and European coordination
- **BoT Mission**: Grassroots activism supporting policy advocacy

### European Context
- **Berlin Conference**: September 26-28, 2025
- **Existing Events**: Amsterdam, Brussels, Malmö, Paris, Vienna, Zürich
- **Coalition Partners**: Critical Mass, Stay Grounded, potentially Greenpeace
- **Policy Timing**: EU night train network development discussions

## File Structure

```
pajama-party-platform/
├── README.md (this file)
├── docs/
│   ├── CONCEPT.md
│   ├── TECHNICAL_ARCHITECTURE.md
│   ├── BRAND_GUIDELINES.md
│   ├── PRIVACY_POLICY.md
│   └── IMPLEMENTATION_ROADMAP.md
├── frontend/
│   ├── index.html
│   ├── styles/
│   ├── scripts/
│   └── assets/
├── backend/
│   ├── server.js
│   ├── database/
│   ├── api/
│   └── config/
├── data/
│   ├── european_stations.json
│   ├── night_train_connections.json
│   └── demo_data.json
└── deployment/
    ├── docker-compose.yml
    ├── nginx.conf
    └── deploy.sh
```

## Getting Started

1. **Review Documentation**: Read all files in `docs/` directory
2. **Environment Setup**: Configure Mapbox API, PostgreSQL, Discord bot
3. **Development**: Start with frontend prototype, add backend functionality
4. **Testing**: Use demo data for Action Group presentation
5. **Deployment**: Set up production environment on Linux server

## Key Contacts

- **Giovanni Antoniazzi**: Technical lead, platform development
- **Ellie Cijvat**: Action Group co-lead, pajama party expertise
- **Howard Osborne**: European coordination, web development input
- **Action Group**: Monthly feedback and strategic guidance

---

**Platform URL**: pajama-party.back-on-track.eu  
**Project Status**: Pre-development (documentation phase)  
**Next Milestone**: Action Group demo presentation  
**Long-term Goal**: Europe-wide night train advocacy platform