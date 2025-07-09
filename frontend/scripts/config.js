// Configuration for the Pajama Party Platform
const CONFIG = {
  // API Configuration
  API_BASE_URL: window.location.origin + '/api',
  
  // OpenRailwayMap API Configuration
  OPENRAILWAYMAP_API: 'https://api.openrailwaymap.org/v2',
  
  // Mapbox Configuration
  MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoiZ2lvdmFudG8iLCJhIjoiY21jdnA4c3p0MDE1cDJqcXJjejE3Ymg3YiJ9.OKkbmDiZosRlNgJP-H86XA',
  
  // Map Configuration
  MAP_CONFIG: {
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [13.4050, 52.5200], // Berlin center
    zoom: 4,
    minZoom: 3,
    maxZoom: 12
  },
  
  // UI Configuration
  UI_CONFIG: {
    autocomplete: {
      minLength: 2,
      debounceMs: 300,
      maxResults: 8
    },
    animation: {
      fadeMs: 300,
      scrollMs: 800
    },
    form: {
      maxRetries: 3,
      timeoutMs: 10000
    }
  },
  
  // Map Styling
  MAP_STYLE: {
    origins: {
      color: '#008f39', // BoT primary green
      size: 8,
      strokeColor: '#ffffff',
      strokeWidth: 2
    },
    destinations: {
      color: '#2271b3', // BoT secondary blue
      size: 10,
      strokeColor: '#ffffff',
      strokeWidth: 2
    },
    lines: {
      color: '#92d051', // BoT light green
      width: 2,
      opacity: 0.6
    }
  },
  
  // Community Configuration
  COMMUNITY_CONFIG: {
    discordInvite: 'https://discord.gg/back-on-track',
    minCommunitySize: 2,
    pajamaPartyThreshold: 3
  },
  
  // Analytics (Privacy-respecting)
  ANALYTICS: {
    enabled: false, // Set to true for production
    events: {
      dreamSubmitted: 'dream_submitted',
      mapInteraction: 'map_interaction',
      communityAction: 'community_action'
    }
  }
};

// Export for use in other modules
window.CONFIG = CONFIG;