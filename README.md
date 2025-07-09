# Pajama Party Platform

**"Where would you like to wake up tomorrow?"**

A web platform for European night train advocacy that transforms individual travel dreams into collective action through community building and coordinated pajama parties at train stations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](CONTRIBUTING.md)

## 🌟 Mission

**Primary Goal**: Inspire everyday Europeans to discover night train possibilities, moving beyond rail enthusiasts to mainstream sustainable travel awareness.

**How it works**:
1. **Dream Collection**: Users share where they want to wake up tomorrow
2. **Community Building**: Connect people from the same stations
3. **Coordinated Action**: Organize pajama parties to demand specific routes
4. **Policy Impact**: Generate advocacy data for European night train expansion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- A Mapbox account for maps (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/back-on-track/pajama-party-platform.git
cd pajama-party-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Mapbox token and other settings

# Import station data
npm run setup:data

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the platform in action!

## 🎯 Key Features

### Current (MVP)
- **Dream Submission**: Simple form for travel destination desires
- **Interactive Map**: Visualize submitted dreams across Europe
- **Station Autocomplete**: Smart search for European railway stations
- **Privacy-First**: 30-day data retention, no tracking
- **Mobile Responsive**: Works on all devices
- **Community Messages**: Connect users from same stations

### Coming Soon
- **Discord Integration**: Real-time community coordination
- **Pajama Party Kits**: Downloadable event organization materials
- **Multi-language Support**: Localized for European markets
- **Real-time Updates**: Live participation tracking
- **Event Coordination**: Tools for September 2025 pajama parties

## 🏗️ Architecture

### Frontend
- **Technology**: Vanilla HTML, CSS, JavaScript (migrating to React)
- **Styling**: Custom CSS with Back-on-Track branding
- **Maps**: Mapbox GL JS for interactive visualization
- **Form Handling**: Client-side validation with server verification

### Backend
- **Server**: Node.js with Express framework
- **Database**: SQLite for development (PostgreSQL for production)
- **API**: RESTful endpoints for dreams, stations, and statistics
- **Security**: Rate limiting, input validation, CORS protection

### Project Structure
```
pajama-party-platform/
├── frontend/           # Client-side code
│   ├── index.html     # Main page
│   ├── styles/        # CSS files
│   ├── scripts/       # JavaScript modules
│   └── assets/        # Images and icons
├── backend/           # Server-side code
│   └── server.js      # Main server file
├── docs/              # Documentation
├── scripts/           # Setup and utility scripts
├── data/              # Database and station data
└── tests/             # Test files
```

## 🎨 What is a Pajama Party?

A pajama party is a creative, peaceful demonstration where people gather at train stations wearing pajamas and sleep accessories to advocate for night trains. It uses a "silent disco" format with synchronized music through headphones, making it:

- **Media-friendly**: Visually engaging and newsworthy
- **Legally safe**: No amplified sound or disruption
- **Inclusive**: Accessible to all ages and abilities
- **Effective**: Proven success in the [2024 Trans-European Pajama Party](https://back-on-track.eu/projects-and-activities/trans-europe-pyjama-party-2024/)

## 📊 Data & Privacy

We take privacy seriously while generating valuable advocacy data:

### Data Collection
- **Anonymous submissions**: No personal info beyond travel preferences
- **Optional email**: Only for community coordination
- **No tracking**: No cookies, analytics, or user profiling
- **Transparent**: Clear data usage explanation

### Data Usage
- **Individual data**: Deleted after 30 days
- **Aggregated statistics**: Used for advocacy and policy work
- **Community formation**: Connect users from same stations
- **Media-friendly stats**: "X people want trains from A to B"

## 🤝 Contributing

We welcome contributions from developers, designers, activists, and anyone passionate about sustainable transport! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Ways to Contribute
- **Code**: Frontend, backend, or infrastructure improvements
- **Design**: UI/UX, graphics, or user experience enhancements
- **Documentation**: Guides, translations, or API documentation
- **Testing**: Quality assurance and accessibility testing
- **Community**: Organize local pajama parties or Discord moderation

### Development Setup
```bash
# Fork the repository and clone your fork
git clone https://github.com/YOUR_USERNAME/pajama-party-platform.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and test them
npm run dev

# Run tests and linting
npm test
npm run lint

# Submit a pull request
```

## 🗺️ Roadmap

Our development is organized in phases leading to the September 2025 Trans-European Pajama Party:

- **Phase 1 (✅ Complete)**: MVP demo for Action Group
- **Phase 2 (Summer 2025)**: Community building and Discord integration
- **Phase 3 (September 2025)**: Event coordination and media tools
- **Phase 4 (2026+)**: Sustained growth and policy integration

See the full [Roadmap](ROADMAP.md) for detailed timelines and features.

## 📱 Usage Examples

### Submit a Dream
```javascript
// Example API call
POST /api/dreams
{
  "dreamer_name": "Maria",
  "origin_station": "Amsterdam Central",
  "destination_city": "Barcelona",
  "email": "maria@example.com" // optional
}
```

### Community Formation
When 2+ people from the same station want to reach the same destination, the platform:
1. Shows community messages encouraging coordination
2. Provides Discord invite links for local organization
3. Offers pajama party planning resources
4. Tracks participation for advocacy data

## 🌍 European Integration

The platform is designed for European-wide coordination:

### Supported Languages
- **Current**: English
- **Planned**: French, German, Italian, Spanish, Dutch

### Railway Integration
- **Station Database**: 10,000+ European stations
- **Route Visualization**: Popular night train connections
- **Regional Coordination**: Local community features

### Policy Impact
- **Advocacy Data**: Concrete demand statistics for policymakers
- **Media Resources**: Press kits and story materials
- **Coalition Building**: Integration with transport advocacy groups

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/back-on-track/pajama-party-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/back-on-track/pajama-party-platform/discussions)
- **Discord**: Join our community server (link in platform)
- **Email**: contact@back-on-track.eu

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Back-on-Track AISBL**: European night train advocacy organization
- **Action Group**: Giovanni Antoniazzi, Ellie Cijvat, Howard Osborne, and team
- **Contributors**: Everyone who helps make European night trains a reality
- **Inspiration**: The successful 2024 Trans-European Pajama Party

---

**Built with ❤️ for sustainable European travel**

*Platform URL: pajama-party.back-on-track.eu*  
*Organization: [Back-on-Track AISBL](https://back-on-track.eu)*