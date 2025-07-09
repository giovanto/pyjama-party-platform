// Main application entry point
class PajamaPartyApp {
  constructor() {
    this.isInitialized = false;
  }

  // Initialize the application
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🌙 Initializing Pajama Party Platform...');

      // Check if all required elements exist
      this.checkRequiredElements();

      // Initialize components
      await this.initializeComponents();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Setup Discord links
      this.setupDiscordLinks();

      // Health check
      await this.performHealthCheck();

      this.isInitialized = true;
      console.log('✅ Pajama Party Platform initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.showInitializationError();
    }
  }

  // Check if required DOM elements exist
  checkRequiredElements() {
    const requiredElements = [
      'dreamForm',
      'map',
      'originStation',
      'destinationStation',
      'submitButton'
    ];

    const missing = requiredElements.filter(id => !document.getElementById(id));
    
    if (missing.length > 0) {
      throw new Error(`Missing required elements: ${missing.join(', ')}`);
    }
  }

  // Initialize all components
  async initializeComponents() {
    // Initialize form first
    if (window.pajamaForm) {
      window.pajamaForm.initialize();
    }

    // Initialize map
    if (window.pajamaMap) {
      await window.pajamaMap.initialize();
    }

    // Initialize any other components
    this.initializeScrollToTop();
    this.initializeSmoothScrolling();
  }

  // Setup global event listeners
  setupGlobalEventListeners() {
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
      if (window.pajamaMap) {
        window.pajamaMap.resize();
      }
    }, 250));

    // Handle visibility change (for performance)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, pause any heavy operations
        this.pauseOperations();
      } else {
        // Page is visible, resume operations
        this.resumeOperations();
      }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
      this.showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      this.showConnectionStatus('offline');
    });
  }

  // Setup Discord community links
  setupDiscordLinks() {
    const discordLinks = [
      document.getElementById('discordButton'),
      document.getElementById('footerDiscordLink')
    ];

    discordLinks.forEach(link => {
      if (link) {
        link.href = CONFIG.COMMUNITY_CONFIG.discordInvite;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
  }

  // Perform health check
  async performHealthCheck() {
    try {
      const health = await pajamaAPI.checkHealth();
      if (health && health.status === 'healthy') {
        console.log('🏥 API health check passed');
      } else {
        console.warn('⚠️ API health check failed');
      }
    } catch (error) {
      console.warn('⚠️ API health check failed:', error);
    }
  }

  // Initialize scroll to top functionality
  initializeScrollToTop() {
    // Create scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '↑';
    scrollButton.title = 'Scroll to top';
    scrollButton.style.display = 'none';
    document.body.appendChild(scrollButton);

    // Show/hide based on scroll position
    window.addEventListener('scroll', debounce(() => {
      if (window.scrollY > 500) {
        scrollButton.style.display = 'block';
      } else {
        scrollButton.style.display = 'none';
      }
    }, 100));

    // Handle click
    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Initialize smooth scrolling for anchor links
  initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Show connection status
  showConnectionStatus(status) {
    const existing = document.querySelector('.connection-status');
    if (existing) existing.remove();

    const statusEl = document.createElement('div');
    statusEl.className = `connection-status connection-status--${status}`;
    statusEl.textContent = status === 'online' ? 'Back online' : 'You are offline';
    document.body.appendChild(statusEl);

    // Auto-hide after 3 seconds
    setTimeout(() => {
      statusEl.remove();
    }, 3000);
  }

  // Pause heavy operations when page is hidden
  pauseOperations() {
    // Stop any polling or heavy operations
    console.log('🛑 Pausing operations - page hidden');
  }

  // Resume operations when page becomes visible
  resumeOperations() {
    // Resume polling or heavy operations
    console.log('▶️ Resuming operations - page visible');
  }

  // Show initialization error
  showInitializationError() {
    const errorEl = document.createElement('div');
    errorEl.className = 'initialization-error';
    errorEl.innerHTML = `
      <div class="initialization-error__content">
        <h2>Oops! Something went wrong</h2>
        <p>We're having trouble loading the platform. Please try refreshing the page.</p>
        <button onclick="location.reload()" class="initialization-error__button">
          Refresh Page
        </button>
      </div>
    `;
    document.body.appendChild(errorEl);
  }

  // Add demo data for development
  async addDemoData() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log('🎭 Adding demo data...');
      
      const demoData = [
        {
          origin_station: 'Berlin Hauptbahnhof',
          origin_country: 'Germany',
          origin_lat: 52.5251,
          origin_lng: 13.3691,
          destination_city: 'Barcelona',
          destination_country: 'Spain',
          destination_lat: 41.3851,
          destination_lng: 2.1734
        },
        {
          origin_station: 'Amsterdam Centraal',
          origin_country: 'Netherlands',
          origin_lat: 52.3789,
          origin_lng: 4.9004,
          destination_city: 'Prague',
          destination_country: 'Czech Republic',
          destination_lat: 50.0755,
          destination_lng: 14.4378
        },
        {
          origin_station: 'Paris Gare du Nord',
          origin_country: 'France',
          origin_lat: 48.8809,
          origin_lng: 2.3553,
          destination_city: 'Vienna',
          destination_country: 'Austria',
          destination_lat: 48.2082,
          destination_lng: 16.3738
        }
      ];

      // Add to map if it exists
      if (window.pajamaMap) {
        demoData.forEach(dream => {
          window.pajamaMap.addDream(dream);
        });
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 DOM ready, initializing app...');
  
  const app = new PajamaPartyApp();
  await app.initialize();
  
  // Add demo data in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => app.addDemoData(), 2000);
  }
});

// Handle any unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // You could send this to an error reporting service
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // You could send this to an error reporting service
});

// Export for global access
window.PajamaPartyApp = PajamaPartyApp;