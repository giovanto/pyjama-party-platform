// API client for Pajama Party Platform
class PajamaPartyAPI {
  constructor() {
    this.baseURL = CONFIG.API_BASE_URL;
    this.timeout = CONFIG.UI_CONFIG.form.timeoutMs;
  }

  // Generic fetch with timeout and error handling
  async fetchWithTimeout(url, options = {}) {
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

  // Search railway stations
  async searchStations(query) {
    if (!query || query.length < CONFIG.UI_CONFIG.autocomplete.minLength) {
      return [];
    }

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

  // Submit a new dream
  async submitDream(dreamData) {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/dreams`, {
        method: 'POST',
        body: JSON.stringify(dreamData)
      });
      return response;
    } catch (error) {
      console.error('Error submitting dream:', error);
      throw error;
    }
  }

  // Get all dreams for map visualization
  async getDreams() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/dreams`);
      return response || [];
    } catch (error) {
      console.error('Error fetching dreams:', error);
      return [];
    }
  }

  // Get platform statistics
  async getStats() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/stats`);
      return response || {};
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {};
    }
  }

  // Get community information for a station
  async getCommunityInfo(station) {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseURL}/community/${encodeURIComponent(station)}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching community info:', error);
      return null;
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/health`);
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return null;
    }
  }
}

// Debounce utility for API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create global API instance
window.pajamaAPI = new PajamaPartyAPI();