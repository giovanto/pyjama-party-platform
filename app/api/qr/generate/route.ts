import { NextRequest, NextResponse } from 'next/server';
import { QRCodeRequest, QRCodeResponse } from '@/types';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stationCode,
      stationName,
      language = 'en',
      volunteerId,
      eventDate = '2025-09-26'
    } = body as QRCodeRequest;

    // Validate required fields
    if (!stationCode || !stationName) {
      return NextResponse.json(
        { error: 'Station code and name are required' },
        { status: 400 }
      );
    }

    // Create the interview URL with parameters (prefer current request origin)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin || 'http://localhost:3000';
    const interviewUrl = new URL('/interview', baseUrl);
    
    // Add query parameters
    interviewUrl.searchParams.set('station', stationCode);
    interviewUrl.searchParams.set('lang', language);
    
    if (volunteerId) {
      interviewUrl.searchParams.set('volunteer', volunteerId);
    }
    
    if (eventDate) {
      interviewUrl.searchParams.set('event', eventDate);
    }

    const url = interviewUrl.toString();

    // Generate QR Code
    try {
      const qrCodeOptions = {
        errorCorrectionLevel: 'M' as const,
        type: 'image/png' as const,
        quality: 0.92,
        margin: 2,
        color: {
          dark: '#1f2937', // Gray-800
          light: '#ffffff'
        },
        width: 300
      };

      const qrCodeDataUrl = await QRCode.toDataURL(url, qrCodeOptions);

      // Generate a unique ID for tracking
      const qrId = `qr_${stationCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Set expiration date (default: 6 months from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      const response: QRCodeResponse = {
        id: qrId,
        qrCodeDataUrl,
        url,
        stationCode,
        expiresAt: expiresAt.toISOString()
      };

      // TODO: Store QR code metadata in database for analytics if needed
      // This could include usage tracking, expiration management, etc.

      return NextResponse.json(response);

    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}

// GET method for simple QR generation with URL parameters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const stationCode = searchParams.get('station');
  const stationName = searchParams.get('name');
  const language = searchParams.get('lang') || 'en';
  const volunteerId = searchParams.get('volunteer') || undefined;
  const eventDate = searchParams.get('event') || '2025-09-26';

  if (!stationCode || !stationName) {
    return NextResponse.json(
      { error: 'Station code and name are required as query parameters' },
      { status: 400 }
    );
  }

  // Convert to POST format and reuse POST logic
  const mockRequest = {
    json: async () => ({
      stationCode,
      stationName,
      language: language as 'en' | 'de' | 'fr',
      volunteerId,
      eventDate
    }),
    url: request.url
  } as unknown as NextRequest;

  return POST(mockRequest);
}

// Options for CORS
export async function OPTIONS(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': request.headers.get('origin') || 'https://pyjama-party.back-on-track.eu',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  return new NextResponse(null, { status: 200, headers });
}
