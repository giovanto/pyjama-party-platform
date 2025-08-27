import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { corsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  // Guard: only allow when explicitly enabled to avoid production exposure
  if (process.env.SENTRY_DEBUG_ENABLE !== 'true') {
    return NextResponse.json({ error: 'Not enabled' }, { status: 404 });
  }

  try {
    Sentry.setTag('debug_route', 'true');
    Sentry.setContext('request', {
      url: request.url,
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    const eventId = Sentry.captureException(new Error('Sentry debug test event'));
    const headers = { ...corsHeaders(request, ['GET']), 'Cache-Control': 'no-store' };
    return NextResponse.json({ ok: true, eventId }, { status: 200, headers });
  } catch {
    const headers = { ...corsHeaders(request, ['GET']) };
    return NextResponse.json({ ok: false, error: 'Failed to send event' }, { status: 500, headers });
  }
}

