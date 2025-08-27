import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface WebVitalsData {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  url: string;
  userAgent: string;
  timestamp: number;
}

// Simple rate limiting for web vitals
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function isRateLimited(clientId: string): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  if (!clientData || now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientId, { count: 1, timestamp: now });
    return false;
  }

  if (clientData.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  clientData.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting based on IP
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const data: WebVitalsData = await request.json();

    // Validate the data
    if (!data.name || typeof data.value !== 'number' || !data.rating) {
      return NextResponse.json(
        { error: 'Invalid web vitals data' },
        { status: 400 }
      );
    }

    // Only store metrics that indicate performance issues or are particularly good
    const shouldStore = 
      data.rating === 'poor' || 
      (data.rating === 'good' && Math.random() < 0.1) || // Sample 10% of good metrics
      data.name === 'LCP' || // Always store LCP (most important)
      data.name === 'CLS';   // Always store CLS (most important)

    if (shouldStore) {
      const supabase = await createClient();
      
      // Store in analytics_events table
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          event_type: 'web_vital',
          event_data: {
            metric_name: data.name,
            metric_value: data.value,
            metric_rating: data.rating,
            url: data.url,
            user_agent_hash: hashUserAgent(data.userAgent)
          },
          created_at: new Date(data.timestamp).toISOString()
        });

      if (error) {
        console.error('Failed to store web vitals metric:', error);
        // Don't return error to client - metrics collection is non-critical
      }
    }

    // Always return success to avoid blocking client-side tracking
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing web vitals:', error);
    // Return success to avoid breaking client-side functionality
    return NextResponse.json({ success: true });
  }
}

// Hash user agent for privacy while maintaining uniqueness
function hashUserAgent(userAgent: string): string {
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function GET() {
  return NextResponse.json({ 
    message: 'Web Vitals collection endpoint',
    status: 'active'
  });
}