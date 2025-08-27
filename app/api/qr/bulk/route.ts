import { NextRequest, NextResponse } from 'next/server';
import { BulkQRRequest, QRCodeResponse } from '@/types';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      stations,
      language = 'en',
      eventDate = '2025-09-26',
      coordinatorEmail
    } = body as BulkQRRequest;

    // Validate required fields
    if (!stations || stations.length === 0) {
      return NextResponse.json(
        { error: 'At least one station is required' },
        { status: 400 }
      );
    }

    if (stations.length > 50) {
      return NextResponse.json(
        { error: 'Maximum 50 stations per bulk request' },
        { status: 400 }
      );
    }

    if (!coordinatorEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(coordinatorEmail)) {
      return NextResponse.json(
        { error: 'Valid coordinator email is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrCodes: QRCodeResponse[] = [];
    const errors: Array<{ station: string; error: string }> = [];

    // Generate QR codes for each station
    for (const station of stations) {
      try {
        const stationCode = station.code || station.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .trim();

        // Create the interview URL with parameters
        const interviewUrl = new URL('/interview', baseUrl);
        interviewUrl.searchParams.set('station', stationCode);
        interviewUrl.searchParams.set('lang', language);
        interviewUrl.searchParams.set('event', eventDate);
        
        const url = interviewUrl.toString();

        // QR Code generation options
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

        // Generate unique ID
        const qrId = `bulk_qr_${stationCode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Set expiration date
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 6);

        qrCodes.push({
          id: qrId,
          qrCodeDataUrl,
          url,
          stationCode,
          expiresAt: expiresAt.toISOString(),
          stationName: station.name,
          country: station.country
        } as QRCodeResponse & { stationName: string; country: string });

      } catch (stationError) {
        console.error(`Error generating QR for station ${station.name}:`, stationError);
        errors.push({
          station: station.name,
          error: stationError instanceof Error ? stationError.message : 'Unknown error'
        });
      }
    }

    // Log bulk generation for analytics
    try {
      // In a real application, you might want to store this in a database
      console.log('Bulk QR generation completed', {
        coordinatorEmail,
        stationsRequested: stations.length,
        qrCodesGenerated: qrCodes.length,
        errors: errors.length,
        language,
        eventDate,
        timestamp: new Date().toISOString()
      });
    } catch (logError) {
      console.error('Failed to log bulk generation:', logError);
    }

    return NextResponse.json({
      success: true,
      qrCodes,
      errors,
      summary: {
        totalRequested: stations.length,
        successful: qrCodes.length,
        failed: errors.length,
        language,
        eventDate,
        coordinatorEmail,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Bulk QR generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for retrieving bulk QR templates or station lists
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'template') {
    // Return a template for bulk QR generation
    const template = {
      stations: [
        {
          code: "amsterdam-central",
          name: "Amsterdam Centraal",
          country: "Netherlands"
        },
        {
          code: "berlin-hbf",
          name: "Berlin Hauptbahnhof",
          country: "Germany"
        },
        {
          code: "paris-nord",
          name: "Paris Gare du Nord",
          country: "France"
        }
      ],
      language: "en",
      eventDate: "2025-09-26",
      coordinatorEmail: "coordinator@example.com"
    };

    return NextResponse.json({
      template,
      instructions: [
        "Replace the stations array with your desired stations",
        "Set the appropriate language (en, de, fr)",
        "Provide a valid coordinator email",
        "Set the event date in YYYY-MM-DD format",
        "Maximum 50 stations per request"
      ]
    });
  }

  return NextResponse.json(
    { error: 'Invalid action parameter. Use ?action=template' },
    { status: 400 }
  );
}

// Options for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}