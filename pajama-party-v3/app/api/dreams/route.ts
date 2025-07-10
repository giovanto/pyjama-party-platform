import { NextRequest, NextResponse } from 'next/server';

interface DreamData {
  from: string;
  to: string;
  name: string;
  email: string;
  why: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DreamData = await request.json();
    
    const { from, to, name, email, why } = body;
    
    if (!from || !to || !name || !email || !why) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const dreamEntry = {
      id: crypto.randomUUID(),
      from: from.trim(),
      to: to.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      why: why.trim(),
      createdAt: new Date().toISOString(),
      coordinates: {
        from: null,
        to: null
      }
    };

    console.log('New dream submission:', dreamEntry);

    return NextResponse.json({
      success: true,
      message: 'Dream route submitted successfully!',
      id: dreamEntry.id
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing dream submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    return NextResponse.json({
      dreams: [],
      total: 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching dreams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}