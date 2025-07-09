// Form functionality for Pajama Party Platform
class PajamaPartyForm {
  constructor() {
    this.form = null;
    this.isSubmitting = false;
    this.selectedOrigin = null;
    this.selectedDestination = null;
    this.autocompleteCache = new Map();
  }

  // Initialize form functionality
  initialize() {
    this.form = document.getElementById('dreamForm');
    if (!this.form) return;

    this.setupFormElements();
    this.setupEventListeners();
    this.setupAutocomplete();
    console.log('📝 Form initialized successfully');
  }

  // Setup form elements
  setupFormElements() {
    this.elements = {
      originStation: document.getElementById('originStation'),
      originSuggestions: document.getElementById('originSuggestions'),
      destinationStation: document.getElementById('destinationStation'),
      destinationSuggestions: document.getElementById('destinationSuggestions'),
      email: document.getElementById('email'),
      submitButton: document.getElementById('submitButton'),
      successMessage: document.getElementById('successMessage'),
      communityInfo: document.getElementById('communityInfo'),
      loadingOverlay: document.getElementById('loadingOverlay')
    };
  }

  // Setup event listeners
  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Input validation
    this.elements.originStation.addEventListener('input', () => this.validateOrigin());
    this.elements.destinationStation.addEventListener('input', () => this.validateDestination());
    this.elements.email.addEventListener('input', () => this.validateEmail());

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
  }

  // Setup autocomplete functionality
  setupAutocomplete() {
    // Origin station autocomplete
    const debouncedOriginSearch = debounce((query) => {
      this.searchStations(query, 'origin');
    }, CONFIG.UI_CONFIG.autocomplete.debounceMs);

    this.elements.originStation.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= CONFIG.UI_CONFIG.autocomplete.minLength) {
        debouncedOriginSearch(query);
      } else {
        this.hideSuggestions('origin');
      }
    });

    // Destination autocomplete (for cities, we'll use a different approach)
    const debouncedDestinationSearch = debounce((query) => {
      this.searchDestinations(query);
    }, CONFIG.UI_CONFIG.autocomplete.debounceMs);

    this.elements.destinationStation.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= CONFIG.UI_CONFIG.autocomplete.minLength) {
        debouncedDestinationSearch(query);
      } else {
        this.hideSuggestions('destination');
      }
    });
  }

  // Search railway stations
  async searchStations(query, type) {
    if (this.autocompleteCache.has(query)) {
      this.showSuggestions(this.autocompleteCache.get(query), type);
      return;
    }

    try {
      const stations = await pajamaAPI.searchStations(query);
      this.autocompleteCache.set(query, stations);
      this.showSuggestions(stations, type);
    } catch (error) {
      console.error('Error searching stations:', error);
      this.hideSuggestions(type);
    }
  }

  // Search destinations (cities/places)
  async searchDestinations(query) {
    // For MVP, we'll provide some popular European destinations
    const destinations = [
      { name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734 },
      { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
      { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
      { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738 },
      { name: 'Venice', country: 'Italy', lat: 45.4408, lng: 12.3155 },
      { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402 },
      { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683 },
      { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
      { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
      { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
      { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
      { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
      { name: 'Oslo', country: 'Norway', lat: 59.9139, lng: 10.7522 },
      { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384 },
      { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417 }
    ];

    const filtered = destinations.filter(dest => 
      dest.name.toLowerCase().includes(query.toLowerCase()) ||
      dest.country.toLowerCase().includes(query.toLowerCase())
    ).slice(0, CONFIG.UI_CONFIG.autocomplete.maxResults);

    this.showSuggestions(filtered, 'destination');
  }

  // Show autocomplete suggestions
  showSuggestions(suggestions, type) {
    const container = type === 'origin' ? this.elements.originSuggestions : this.elements.destinationSuggestions;
    
    if (!suggestions || suggestions.length === 0) {
      this.hideSuggestions(type);
      return;
    }

    const html = suggestions.map(suggestion => `
      <div class="suggestion-item" data-type="${type}" data-suggestion='${JSON.stringify(suggestion)}'>
        <div class="suggestion-item__name">${suggestion.name}</div>
        <div class="suggestion-item__country">${suggestion.country}</div>
      </div>
    `).join('');

    container.innerHTML = html;
    container.style.display = 'block';

    // Add click handlers
    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', (e) => this.selectSuggestion(e));
    });
  }

  // Hide suggestions
  hideSuggestions(type) {
    const container = type === 'origin' ? this.elements.originSuggestions : this.elements.destinationSuggestions;
    container.style.display = 'none';
    container.innerHTML = '';
  }

  // Select a suggestion
  selectSuggestion(e) {
    const item = e.currentTarget;
    const type = item.dataset.type;
    const suggestion = JSON.parse(item.dataset.suggestion);

    if (type === 'origin') {
      this.selectedOrigin = suggestion;
      this.elements.originStation.value = suggestion.name;
      this.hideSuggestions('origin');
      this.validateOrigin();
    } else {
      this.selectedDestination = suggestion;
      this.elements.destinationStation.value = suggestion.name;
      this.hideSuggestions('destination');
      this.validateDestination();
    }
  }

  // Handle clicks outside suggestions
  handleOutsideClick(e) {
    if (!e.target.closest('.dream-form__field')) {
      this.hideSuggestions('origin');
      this.hideSuggestions('destination');
    }
  }

  // Validate origin station
  validateOrigin() {
    const input = this.elements.originStation;
    const value = input.value.trim();

    if (!value) {
      this.setFieldError(input, 'Please select your origin station');
      return false;
    }

    if (!this.selectedOrigin) {
      this.setFieldError(input, 'Please select a station from the suggestions');
      return false;
    }

    this.clearFieldError(input);
    return true;
  }

  // Validate destination
  validateDestination() {
    const input = this.elements.destinationStation;
    const value = input.value.trim();

    if (!value) {
      this.setFieldError(input, 'Please enter your dream destination');
      return false;
    }

    this.clearFieldError(input);
    return true;
  }

  // Validate email
  validateEmail() {
    const input = this.elements.email;
    const value = input.value.trim();

    if (value && !this.isValidEmail(value)) {
      this.setFieldError(input, 'Please enter a valid email address');
      return false;
    }

    this.clearFieldError(input);
    return true;
  }

  // Check if email is valid
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Set field error
  setFieldError(input, message) {
    const field = input.closest('.dream-form__field');
    const existing = field.querySelector('.field-error');
    
    if (existing) {
      existing.textContent = message;
    } else {
      const errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      errorEl.textContent = message;
      field.appendChild(errorEl);
    }
    
    input.classList.add('error');
  }

  // Clear field error
  clearFieldError(input) {
    const field = input.closest('.dream-form__field');
    const existing = field.querySelector('.field-error');
    
    if (existing) {
      existing.remove();
    }
    
    input.classList.remove('error');
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;

    // Validate all fields
    const isOriginValid = this.validateOrigin();
    const isDestinationValid = this.validateDestination();
    const isEmailValid = this.validateEmail();

    if (!isOriginValid || !isDestinationValid || !isEmailValid) {
      return;
    }

    this.isSubmitting = true;
    this.showLoading();

    try {
      // Prepare dream data
      const dreamData = {
        origin_station: this.selectedOrigin.name,
        origin_country: this.selectedOrigin.country,
        origin_lat: this.selectedOrigin.lat,
        origin_lng: this.selectedOrigin.lng,
        destination_city: this.elements.destinationStation.value.trim(),
        destination_country: this.selectedDestination ? this.selectedDestination.country : '',
        destination_lat: this.selectedDestination ? this.selectedDestination.lat : null,
        destination_lng: this.selectedDestination ? this.selectedDestination.lng : null,
        email: this.elements.email.value.trim() || null
      };

      // Submit to API
      const response = await pajamaAPI.submitDream(dreamData);

      // Show success message
      this.showSuccess(response);

      // Add to map
      if (window.pajamaMap) {
        window.pajamaMap.addDream(dreamData);
      }

      // Reset form
      this.resetForm();

    } catch (error) {
      console.error('Error submitting dream:', error);
      this.showError(error.message || 'Something went wrong. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.hideLoading();
    }
  }

  // Show loading state
  showLoading() {
    this.elements.submitButton.disabled = true;
    this.elements.submitButton.textContent = 'Adding to map...';
    this.elements.loadingOverlay.style.display = 'flex';
  }

  // Hide loading state
  hideLoading() {
    this.elements.submitButton.disabled = false;
    this.elements.submitButton.textContent = 'Add my dream to the map';
    this.elements.loadingOverlay.style.display = 'none';
  }

  // Show success message
  showSuccess(response) {
    this.elements.successMessage.style.display = 'block';
    
    if (response.community_message) {
      this.elements.communityInfo.innerHTML = `
        <div class="community-message">
          <div class="community-message__icon">🎉</div>
          <div class="community-message__text">${response.community_message}</div>
          <a href="${CONFIG.COMMUNITY_CONFIG.discordInvite}" class="community-message__link" target="_blank">
            Join Discord Community
          </a>
        </div>
      `;
    }

    // Scroll to success message
    this.elements.successMessage.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }

  // Show error message
  showError(message) {
    // Create or update error message
    let errorEl = document.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      this.form.appendChild(errorEl);
    }
    
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  // Reset form
  resetForm() {
    this.form.reset();
    this.selectedOrigin = null;
    this.selectedDestination = null;
    this.hideSuggestions('origin');
    this.hideSuggestions('destination');
    
    // Clear any errors
    this.form.querySelectorAll('.field-error').forEach(el => el.remove());
    this.form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  }
}

// Create global form instance
window.pajamaForm = new PajamaPartyForm();