import { NextRequest, NextResponse } from 'next/server';
import { getDBPool } from '@/lib/db/connectionPool';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number>;
  timestamp: string;
}

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(ip: string): string {
  return `analytics_${ip}`;
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  let record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, record);
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

function sanitizeEventData(data: any): AnalyticsEvent | null {
  try {
    if (!data || typeof data !== 'object') return null;
    
    const { event, properties = {}, timestamp } = data;
    
    if (!event || typeof event !== 'string') return null;
    if (!timestamp || typeof timestamp !== 'string') return null;
    
    // Validate timestamp is within reasonable bounds (not too old, not in future)
    const eventTime = new Date(timestamp);
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);
    
    if (eventTime < oneHourAgo || eventTime > oneMinuteFromNow) {
      return null;
    }
    
    // Sanitize properties
    const cleanProperties: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (typeof key === 'string' && key.length <= 50) {
        if (typeof value === 'string' && value.length <= 200) {
          cleanProperties[key] = value;
        } else if (typeof value === 'number' && !isNaN(value)) {
          cleanProperties[key] = value;
        }
      }
    }
    
    return {
      event: event.slice(0, 100), // Limit event name length
      properties: cleanProperties,
      timestamp
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Handle batched events
    let events = [];
    if (body.events && Array.isArray(body.events)) {
      // Batched events
      events = body.events.map(sanitizeEventData).filter(Boolean);
    } else {
      // Single event
      const eventData = sanitizeEventData(body);
      if (eventData) events.push(eventData);
    }
    
    if (events.length === 0) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      );
    }

    // Use optimized connection pool
    const dbPool = getDBPool();
    
    // Batch insert for better performance
    const { error } = await dbPool.query(
      'analytics_events',
      (client) => client
        .from('analytics_events')
        .insert(events.map(eventData => ({
          event_name: eventData.event,
          event_data: eventData.properties,
          created_at: new Date().toISOString(),
          // Add automatic expiry - events are deleted after 30 days
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }))),
      { 
        cache: false, // Don't cache analytics inserts
        retries: 1, // Quick retry for analytics
        timeout: 2000 // 2 second timeout
      }
    );

    if (error) {
      console.error('Analytics storage error:', error);
      // Don't fail the request if analytics storage fails
      // This ensures the user experience isn't affected
    }

    const duration = performance.now() - startTime;
    
    // Track API performance
    if (duration > 1000) {
      console.warn(`Slow analytics API: ${duration.toFixed(2)}ms for ${events.length} events`);
    }

    return NextResponse.json({ 
      success: true, 
      processed: events.length,
      duration: Math.round(duration)
    });
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error('Analytics API error:', error, `Duration: ${duration.toFixed(2)}ms`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes