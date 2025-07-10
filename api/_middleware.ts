/**
 * API Middleware for Vercel Serverless Functions
 * Handles CORS, security headers, and request preprocessing
 */

import { NextRequest, NextResponse } from 'next/server';

interface RequestExtended extends NextRequest {
  context?: {
    startTime: number;
    requestId: string;
  };
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Security headers for API responses
 */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/**
 * CORS headers for cross-origin requests
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
};

/**
 * Simple in-memory rate limiter (for basic protection)
 * Note: In production, use Redis or similar for distributed rate limiting
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if request exceeds rate limit
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
    });
    return false;
  }
  
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return true;
  }
  
  entry.count++;
  return false;
}

/**
 * Get client IP address
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * Log request details
 */
function logRequest(request: NextRequest, response: NextResponse, duration: number) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const status = response.status;
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method,
    path: pathname,
    query: search,
    status,
    duration,
    ip,
    userAgent: userAgent.substring(0, 100), // Truncate long user agents
  }));
}

/**
 * Main middleware function
 */
export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Add request context
  (request as RequestExtended).context = {
    startTime,
    requestId,
  };
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
      },
    });
  }
  
  // Check rate limiting
  const clientIP = getClientIP(request);
  if (isRateLimited(clientIP)) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(RATE_LIMIT_CONFIG.windowMs / 1000),
      },
      { status: 429 }
    );
    
    // Add headers
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', (Date.now() + RATE_LIMIT_CONFIG.windowMs).toString());
    
    return response;
  }
  
  // Continue with the request
  const response = NextResponse.next();
  
  // Add CORS headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add custom headers
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Powered-By', 'Pajama Party Platform');
  
  // Log the request
  const duration = Date.now() - startTime;
  logRequest(request, response, duration);
  
  return response;
}

/**
 * Configure middleware to run on API routes
 */
export const config = {
  matcher: [
    '/api/:path*',
  ],
};

/**
 * Utility function to create standardized API responses
 */
export function createAPIResponse(
  data: any,
  options: {
    status?: number;
    headers?: Record<string, string>;
    requestId?: string;
  } = {}
) {
  const { status = 200, headers = {}, requestId } = options;
  
  const response = NextResponse.json(data, { status });
  
  // Add standard headers
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Add custom headers
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  if (requestId) {
    response.headers.set('X-Request-ID', requestId);
  }
  
  return response;
}

/**
 * Utility function to create error responses
 */
export function createErrorResponse(
  error: string,
  options: {
    status?: number;
    message?: string;
    details?: any;
    requestId?: string;
  } = {}
) {
  const { status = 500, message, details, requestId } = options;
  
  const errorData: any = {
    error,
    timestamp: new Date().toISOString(),
  };
  
  if (message) {
    errorData.message = message;
  }
  
  if (details && process.env.NODE_ENV === 'development') {
    errorData.details = details;
  }
  
  return createAPIResponse(errorData, { status, requestId });
}