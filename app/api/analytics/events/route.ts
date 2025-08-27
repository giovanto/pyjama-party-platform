import { NextRequest, NextResponse } from 'next/server';
import { getDBPool } from '@/lib/db/connectionPool';
import { checkRateLimit, RATE_LIMIT_CONFIGS, getRateLimitHeaders } from '@/middleware/rateLimit';

interface AnalyticsEvent {
  event: string;
  properties: Record<string, string | number>;
  timestamp: string;
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
    // Rate limiting (shared Redis if configured)
    const rl = await checkRateLimit(request as unknown as Request, RATE_LIMIT_CONFIGS.analytics);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rl) }
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
      async (client) => await client
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

// No in-process interval cleanup needed when using shared Redis
