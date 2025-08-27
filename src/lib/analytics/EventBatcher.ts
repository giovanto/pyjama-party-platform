// Analytics event batching for high-performance data collection

interface AnalyticsEvent {
  event_name: string;
  event_data: Record<string, any>;
  session_id?: string;
  user_id?: string;
  timestamp: number;
  url: string;
  user_agent: string;
  referrer?: string;
  viewport_width?: number;
  viewport_height?: number;
  connection_type?: string;
}

interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number; // ms
  retryAttempts: number;
  retryDelay: number; // ms
  enableCompression: boolean;
  enableOfflineQueue: boolean;
  maxOfflineEvents: number;
  debugMode: boolean;
}

interface BatchMetrics {
  totalEvents: number;
  totalBatches: number;
  failedBatches: number;
  avgBatchSize: number;
  avgFlushTime: number;
  offlineEvents: number;
  lastFlushTime: number;
}

class AnalyticsEventBatcher {
  private eventQueue: AnalyticsEvent[] = [];
  private offlineQueue: AnalyticsEvent[] = [];
  private config: BatchConfig;
  private metrics: BatchMetrics = {
    totalEvents: 0,
    totalBatches: 0,
    failedBatches: 0,
    avgBatchSize: 0,
    avgFlushTime: 0,
    offlineEvents: 0,
    lastFlushTime: Date.now()
  };
  private flushTimer?: NodeJS.Timeout;
  private sessionId: string;
  private isOnline: boolean = navigator.onLine;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = {
      maxBatchSize: 50,
      flushInterval: 5000, // 5 seconds
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      enableCompression: true,
      enableOfflineQueue: true,
      maxOfflineEvents: 1000,
      debugMode: process.env.NODE_ENV === 'development',
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startBatchFlushTimer();
    this.loadOfflineEvents();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners(): void {
    // Handle online/offline state
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true); // Immediate flush
    });

    // Flush on visibility change (when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true);
      }
    });
  }

  private startBatchFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private async loadOfflineEvents(): Promise<void> {
    if (!this.config.enableOfflineQueue) return;

    try {
      const stored = localStorage.getItem('analytics_offline_queue');
      if (stored) {
        const events: AnalyticsEvent[] = JSON.parse(stored);
        this.offlineQueue = events.slice(0, this.config.maxOfflineEvents);
        this.metrics.offlineEvents = this.offlineQueue.length;
        
        if (this.isOnline && this.offlineQueue.length > 0) {
          setTimeout(() => this.flushOfflineQueue(), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to load offline events:', error);
    }
  }

  private async saveOfflineEvents(): Promise<void> {
    if (!this.config.enableOfflineQueue) return;

    try {
      localStorage.setItem('analytics_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline events:', error);
    }
  }

  private enrichEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'url' | 'user_agent'>): AnalyticsEvent {
    const connection = (navigator as any).connection;
    
    return {
      ...event,
      timestamp: Date.now(),
      url: window.location.href,
      user_agent: navigator.userAgent,
      session_id: this.sessionId,
      referrer: document.referrer,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      connection_type: connection?.effectiveType || 'unknown'
    };
  }

  // Public method to track events
  track(eventName: string, eventData: Record<string, any> = {}, userId?: string): void {
    const event = this.enrichEvent({
      event_name: eventName,
      event_data: eventData,
      user_id: userId
    });

    this.eventQueue.push(event);
    this.metrics.totalEvents++;

    if (this.config.debugMode) {
      console.log('📊 Analytics Event Queued:', eventName, eventData);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxBatchSize) {
      this.flush();
    }
  }

  // Flush events to server
  async flush(immediate: boolean = false): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    if (!this.isOnline && this.config.enableOfflineQueue) {
      // Add to offline queue
      this.offlineQueue.push(...events);
      
      // Limit offline queue size
      if (this.offlineQueue.length > this.config.maxOfflineEvents) {
        this.offlineQueue = this.offlineQueue.slice(-this.config.maxOfflineEvents);
      }
      
      this.metrics.offlineEvents = this.offlineQueue.length;
      await this.saveOfflineEvents();
      
      if (this.config.debugMode) {
        console.log('📱 Events saved offline:', events.length);
      }
      return;
    }

    const startTime = performance.now();
    await this.sendBatch(events, immediate);
    const flushTime = performance.now() - startTime;

    // Update metrics
    this.metrics.totalBatches++;
    this.metrics.avgBatchSize = this.metrics.totalEvents / this.metrics.totalBatches;
    this.metrics.avgFlushTime = (this.metrics.avgFlushTime + flushTime) / 2;
    this.metrics.lastFlushTime = Date.now();
  }

  // Send batch to server with retry logic
  private async sendBatch(events: AnalyticsEvent[], immediate: boolean = false): Promise<void> {
    let attempt = 0;

    while (attempt <= this.config.retryAttempts) {
      try {
        const payload = this.config.enableCompression 
          ? this.compressEvents(events)
          : { events };

        const response = await fetch('/api/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.enableCompression && { 'Content-Encoding': 'gzip' })
          },
          body: JSON.stringify(payload),
          ...(immediate && { keepalive: true }) // Use keepalive for page unload
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (this.config.debugMode) {
          console.log('✅ Analytics batch sent:', events.length, 'events');
        }

        return; // Success
      } catch (error) {
        attempt++;
        this.metrics.failedBatches++;

        if (this.config.debugMode) {
          console.error(`❌ Analytics batch failed (attempt ${attempt}):`, error);
        }

        if (attempt <= this.config.retryAttempts) {
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed and offline queue is enabled, save events
    if (this.config.enableOfflineQueue) {
      this.offlineQueue.push(...events);
      await this.saveOfflineEvents();
    }
  }

  // Flush offline events when online
  private async flushOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const events = [...this.offlineQueue];
    this.offlineQueue = [];
    this.metrics.offlineEvents = 0;

    try {
      await this.sendBatch(events);
      localStorage.removeItem('analytics_offline_queue');
      
      if (this.config.debugMode) {
        console.log('📡 Offline events flushed:', events.length);
      }
    } catch (error) {
      // Re-add to offline queue if failed
      this.offlineQueue = events;
      this.metrics.offlineEvents = events.length;
      console.error('Failed to flush offline events:', error);
    }
  }

  // Compress events for better performance
  private compressEvents(events: AnalyticsEvent[]): any {
    // Simple compression by removing redundant data
    const compressed = {
      session_id: this.sessionId,
      base_url: window.location.origin,
      user_agent: navigator.userAgent,
      events: events.map(event => ({
        n: event.event_name, // name
        d: event.event_data, // data
        t: event.timestamp,   // timestamp
        p: event.url.replace(window.location.origin, ''), // path only
        u: event.user_id,     // user_id
        vw: event.viewport_width,
        vh: event.viewport_height,
        c: event.connection_type
      }))
    };

    return compressed;
  }

  // Get performance metrics
  getMetrics(): BatchMetrics {
    return { ...this.metrics };
  }

  // Get queue status
  getQueueStatus(): { online: number; offline: number; total: number } {
    return {
      online: this.eventQueue.length,
      offline: this.offlineQueue.length,
      total: this.eventQueue.length + this.offlineQueue.length
    };
  }

  // Force immediate flush
  async forceFlush(): Promise<void> {
    await this.flush(true);
    await this.flushOfflineQueue();
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    // Final flush
    this.flush(true);
  }
}

// Singleton instance
let batcher: AnalyticsEventBatcher | null = null;

export function getAnalyticsBatcher(): AnalyticsEventBatcher {
  if (!batcher) {
    batcher = new AnalyticsEventBatcher({
      maxBatchSize: 25, // Smaller batches for better performance
      flushInterval: 3000, // More frequent flushes
      enableOfflineQueue: true,
      debugMode: process.env.NODE_ENV === 'development'
    });
  }
  return batcher;
}

export { AnalyticsEventBatcher };
export type { AnalyticsEvent, BatchConfig, BatchMetrics };