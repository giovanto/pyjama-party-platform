// Map functionality for Pajama Party Platform
class PajamaPartyMap {
  constructor() {
    this.map = null;
    this.dreams = [];
    this.isInitialized = false;
  }

  // Initialize the map
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = CONFIG.MAPBOX_ACCESS_TOKEN;

      // Create map instance
      this.map = new mapboxgl.Map({
        container: 'map',
        style: CONFIG.MAP_CONFIG.style,
        center: CONFIG.MAP_CONFIG.center,
        zoom: CONFIG.MAP_CONFIG.zoom,
        minZoom: CONFIG.MAP_CONFIG.minZoom,
        maxZoom: CONFIG.MAP_CONFIG.maxZoom
      });

      // Add navigation controls
      this.map.addControl(new mapboxgl.NavigationControl());

      // Add fullscreen control
      this.map.addControl(new mapboxgl.FullscreenControl());

      // Wait for map to load
      await new Promise((resolve) => {
        this.map.on('load', resolve);
      });

      // Add sources and layers
      this.addDataSources();
      this.addLayers();
      this.addInteractions();

      this.isInitialized = true;
      console.log('🗺️ Map initialized successfully');

      // Load initial data
      await this.loadDreams();

    } catch (error) {
      console.error('Error initializing map:', error);
      this.showMapError('Failed to load map. Please refresh the page.');
    }
  }

  // Add data sources
  addDataSources() {
    // Origins source
    this.map.addSource('origins', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Destinations source
    this.map.addSource('destinations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Lines source (connecting origins to destinations)
    this.map.addSource('dream-lines', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });
  }

  // Add map layers
  addLayers() {
    // Dream lines layer
    this.map.addLayer({
      id: 'dream-lines',
      type: 'line',
      source: 'dream-lines',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': CONFIG.MAP_STYLE.lines.color,
        'line-width': CONFIG.MAP_STYLE.lines.width,
        'line-opacity': CONFIG.MAP_STYLE.lines.opacity
      }
    });

    // Origins layer
    this.map.addLayer({
      id: 'origins',
      type: 'circle',
      source: 'origins',
      paint: {
        'circle-radius': CONFIG.MAP_STYLE.origins.size,
        'circle-color': CONFIG.MAP_STYLE.origins.color,
        'circle-stroke-color': CONFIG.MAP_STYLE.origins.strokeColor,
        'circle-stroke-width': CONFIG.MAP_STYLE.origins.strokeWidth
      }
    });

    // Destinations layer
    this.map.addLayer({
      id: 'destinations',
      type: 'circle',
      source: 'destinations',
      paint: {
        'circle-radius': CONFIG.MAP_STYLE.destinations.size,
        'circle-color': CONFIG.MAP_STYLE.destinations.color,
        'circle-stroke-color': CONFIG.MAP_STYLE.destinations.strokeColor,
        'circle-stroke-width': CONFIG.MAP_STYLE.destinations.strokeWidth
      }
    });
  }

  // Add map interactions
  addInteractions() {
    // Hover effects
    this.map.on('mouseenter', 'origins', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'origins', () => {
      this.map.getCanvas().style.cursor = '';
    });

    this.map.on('mouseenter', 'destinations', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'destinations', () => {
      this.map.getCanvas().style.cursor = '';
    });

    // Click handlers for popups
    this.map.on('click', 'origins', (e) => {
      this.showOriginPopup(e);
    });

    this.map.on('click', 'destinations', (e) => {
      this.showDestinationPopup(e);
    });
  }

  // Show popup for origin stations
  showOriginPopup(e) {
    const properties = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    const popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div class="map-popup">
          <h3 class="map-popup__title">${properties.station}</h3>
          <p class="map-popup__info">${properties.country}</p>
          <p class="map-popup__description">
            ${properties.dreamers_count} ${properties.dreamers_count === 1 ? 'dreamer' : 'dreamers'} from this station
          </p>
        </div>
      `)
      .addTo(this.map);
  }

  // Show popup for destination cities
  showDestinationPopup(e) {
    const properties = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();

    const popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`
        <div class="map-popup">
          <h3 class="map-popup__title">${properties.city}</h3>
          <p class="map-popup__info">${properties.country}</p>
          <p class="map-popup__description">
            ${properties.dreamers_count} ${properties.dreamers_count === 1 ? 'person dreams' : 'people dream'} of waking up here
          </p>
        </div>
      `)
      .addTo(this.map);
  }

  // Load dreams from API and update map
  async loadDreams() {
    try {
      const dreams = await pajamaAPI.getDreams();
      this.dreams = dreams;
      this.updateMapData();
      this.updateStats();
    } catch (error) {
      console.error('Error loading dreams:', error);
    }
  }

  // Update map data with current dreams
  updateMapData() {
    const originFeatures = [];
    const destinationFeatures = [];
    const lineFeatures = [];

    // Group dreams by origin and destination
    const originGroups = new Map();
    const destinationGroups = new Map();

    this.dreams.forEach(dream => {
      // Group origins
      const originKey = `${dream.origin_station}`;
      if (!originGroups.has(originKey)) {
        originGroups.set(originKey, {
          station: dream.origin_station,
          country: dream.origin_country,
          lat: dream.origin_lat,
          lng: dream.origin_lng,
          count: 0
        });
      }
      originGroups.get(originKey).count++;

      // Group destinations
      const destinationKey = `${dream.destination_city}`;
      if (!destinationGroups.has(destinationKey)) {
        destinationGroups.set(destinationKey, {
          city: dream.destination_city,
          country: dream.destination_country,
          lat: dream.destination_lat,
          lng: dream.destination_lng,
          count: 0
        });
      }
      destinationGroups.get(destinationKey).count++;

      // Create line feature
      if (dream.origin_lat && dream.origin_lng && dream.destination_lat && dream.destination_lng) {
        lineFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [dream.origin_lng, dream.origin_lat],
              [dream.destination_lng, dream.destination_lat]
            ]
          },
          properties: {
            origin_station: dream.origin_station,
            destination_city: dream.destination_city
          }
        });
      }
    });

    // Create origin features
    originGroups.forEach(origin => {
      if (origin.lat && origin.lng) {
        originFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [origin.lng, origin.lat]
          },
          properties: {
            station: origin.station,
            country: origin.country,
            dreamers_count: origin.count
          }
        });
      }
    });

    // Create destination features
    destinationGroups.forEach(destination => {
      if (destination.lat && destination.lng) {
        destinationFeatures.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [destination.lng, destination.lat]
          },
          properties: {
            city: destination.city,
            country: destination.country,
            dreamers_count: destination.count
          }
        });
      }
    });

    // Update map sources
    this.map.getSource('origins').setData({
      type: 'FeatureCollection',
      features: originFeatures
    });

    this.map.getSource('destinations').setData({
      type: 'FeatureCollection',
      features: destinationFeatures
    });

    this.map.getSource('dream-lines').setData({
      type: 'FeatureCollection',
      features: lineFeatures
    });
  }

  // Update statistics display
  async updateStats() {
    try {
      const stats = await pajamaAPI.getStats();
      
      // Update DOM elements
      const totalDreamsEl = document.getElementById('totalDreams');
      const totalStationsEl = document.getElementById('totalStations');
      const totalCommunitiesEl = document.getElementById('totalCommunities');

      if (totalDreamsEl) totalDreamsEl.textContent = stats.total_dreams || this.dreams.length;
      if (totalStationsEl) totalStationsEl.textContent = stats.active_stations || 0;
      if (totalCommunitiesEl) totalCommunitiesEl.textContent = Math.floor((stats.active_stations || 0) / 3);

    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Add a new dream to the map
  addDream(dreamData) {
    this.dreams.push(dreamData);
    this.updateMapData();
    this.updateStats();

    // Fly to the new dream location
    if (dreamData.destination_lat && dreamData.destination_lng) {
      this.map.flyTo({
        center: [dreamData.destination_lng, dreamData.destination_lat],
        zoom: 6,
        duration: 1000
      });
    }
  }

  // Show error message
  showMapError(message) {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div class="map-error">
          <div class="map-error__icon">🗺️</div>
          <div class="map-error__message">${message}</div>
        </div>
      `;
    }
  }

  // Resize map (useful for responsive design)
  resize() {
    if (this.map) {
      this.map.resize();
    }
  }
}

// Create global map instance
window.pajamaMap = new PajamaPartyMap();