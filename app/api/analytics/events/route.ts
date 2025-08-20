import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const eventData = sanitizeEventData(body);
    
    if (!eventData) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Store event in database for dashboard aggregation
    // Note: This creates an analytics_events table for aggregated data
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_name: eventData.event,
        properties: eventData.properties,
        event_timestamp: eventData.timestamp,
        created_at: new Date().toISOString(),
        // Add automatic expiry - events are deleted after 30 days
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    if (error) {
      console.error('Analytics storage error:', error);
      // Don't fail the request if analytics storage fails
      // This ensures the user experience isn't affected
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
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