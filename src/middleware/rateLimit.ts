/**
 * Rate Limiting Middleware for API Protection
 * Simple in-memory rate limiting for API endpoints
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Maximum requests per window
  message?: string;  // Custom error message
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, RateLimitEntry>();

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  search: { windowMs: 60000, max: 100 }, // 100 requests per minute
  details: { windowMs: 60000, max: 200 }, // 200 requests per minute
  dreams: { windowMs: 300000, max: 10 }, // 10 dreams per 5 minutes
  parties: { windowMs: 600000, max: 5 }, // 5 party submissions per 10 minutes
  default: { windowMs: 60000, max: 50 } // 50 requests per minute default
} as const;

/**
 * Get client identifier from request
 */
function getClientId(request: Request): string {
  // In production, use more sophisticated client identification
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${clientIp}:${userAgent.substring(0, 50)}`;
}

/**
 * Clean expired entries from store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key);
    }
  }
}

/**
 * Check rate limit for a client
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  total: number;
} {
  const clientId = getClientId(request);
  const now = Date.now();
  const windowStart = now;
  const windowEnd = now + config.windowMs;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries();
  }
  
  // Get or create entry for this client
  let entry = store.get(clientId);
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: windowEnd
    };
  }
  
  // Check if limit exceeded
  const allowed = entry.count < config.max;
  
  if (allowed) {
    entry.count++;
    store.set(clientId, entry);
  }
  
  return {
    allowed,
    remaining: Math.max(0, config.max - entry.count),
    resetTime: entry.resetTime,
    total: config.max
  };
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(rateLimitResult: {
  remaining: number;
  resetTime: number;
  total: number;
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': rateLimitResult.total.toString(),
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
  };
}

/**
 * Rate limiting wrapper for API routes
 */
export function withRateLimit<T extends any[]>(
  handler: (...args: T) => Promise<Response>,
  config: RateLimitConfig = RATE_LIMIT_CONFIGS.default
) {
  return async (...args: T): Promise<Response> => {
    const request = args[0] as Request;
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, config);
    
    if (!rateLimitResult.allowed) {
      // Rate limit exceeded
      const headers = getRateLimitHeaders(rateLimitResult);
      
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: config.message || `Too many requests. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} seconds.`,
          retry_after: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      );
    }
    
    // Execute original handler
    try {
      const response = await handler(...args);
      
      // Add rate limit headers to successful responses
      const headers = getRateLimitHeaders(rateLimitResult);
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      
      return response;
    } catch (error) {
      // Still add rate limit headers to error responses
      throw error;
    }
  };
}

/**
 * Middleware for Next.js API routes
 */
export function createRateLimitMiddleware(config: RateLimitConfig = RATE_LIMIT_CONFIGS.default) {
  return (handler: (req: Request, ...args: any[]) => Promise<Response>) => {
    return withRateLimit(handler, config);
  };
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus(): {
  totalClients: number;
  activeClients: number;
  storeSize: number;
} {
  const now = Date.now();
  let activeClients = 0;
  
  for (const entry of store.values()) {
    if (now <= entry.resetTime) {
      activeClients++;
    }
  }
  
  return {
    totalClients: store.size,
    activeClients,
    storeSize: store.size
  };
}

/**
 * Clear rate limit store (for testing or maintenance)
 */
export function clearRateLimitStore(): void {
  store.clear();
}

/**
 * Set custom rate limit for specific client (for testing)
 */
export function setClientRateLimit(clientId: string, count: number, resetTime: number): void {
  store.set(clientId, { count, resetTime });
}