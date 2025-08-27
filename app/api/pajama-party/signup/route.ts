import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { headers } from 'next/headers';
import { withRateLimit, RATE_LIMIT_CONFIGS } from '@/middleware/rateLimit';
import { corsHeaders } from '@/lib/cors';

// Note: Do not initialize service-role clients at module scope in a file
// that also exports GET handlers. Create inside POST-only handlers instead.

// Validation schema for signup data
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address').max(255),
  preferred_station: z.string().min(1, 'Preferred station is required').max(255),
  participation_level: z.enum(['attend', 'volunteer', 'coordinator']),
  message: z.string().max(1000).optional(),
  newsletter_consent: z.boolean().default(false),
  privacy_consent: z.boolean().refine(val => val === true, {
    message: 'Privacy consent is required'
  }),
  email_verification_required: z.boolean().default(true),
  submitted_at: z.string().datetime(),
  gdpr_consent_timestamp: z.string().datetime(),
  user_agent: z.string().max(500),
  consent_version: z.string().default('1.0'),
  legal_basis: z.string().default('consent'),
  data_retention_period: z.string().default('2_years'),
  source_page: z.string().url().max(500)
});

async function postHandler(request: NextRequest) {
  try {
    // Initialize Supabase client (service role) only within POST handler, using dynamic import
    // This avoids touching Supabase at module-evaluation/build time
    const { createClient } = await import('@supabase/supabase-js');
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return NextResponse.json(
        { error: 'Server not configured for sign-ups' },
        { status: 503, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    // Parse request body
    const body = await request.json();
    
    // Get client IP address
    const headersList = headers();
    const forwarded = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';

    // Add IP address to body
    body.ip_address = clientIp;

    // Validate input data
    const validatedData = signupSchema.parse(body);

    // Check for existing email (GDPR compliance - no duplicates without explicit consent)
    const { data: existingUser, error: checkError } = await supabase
      .from('pajama_party_signups')
      .select('id, email, created_at')
      .eq('email', validatedData.email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "not found"
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'This email address is already registered. Please use a different email or contact support if you need to update your registration.',
          code: 'EMAIL_ALREADY_EXISTS'
        },
        { status: 409, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    // Prepare data for database insertion
    const signupData = {
      name: validatedData.name,
      email: validatedData.email,
      preferred_station: validatedData.preferred_station,
      participation_level: validatedData.participation_level,
      message: validatedData.message || null,
      newsletter_consent: validatedData.newsletter_consent,
      privacy_consent: validatedData.privacy_consent,
      email_verification_required: validatedData.email_verification_required,
      
      // GDPR Compliance fields
      gdpr_consent_timestamp: validatedData.gdpr_consent_timestamp,
      ip_address: clientIp,
      user_agent: validatedData.user_agent,
      consent_version: validatedData.consent_version,
      legal_basis: validatedData.legal_basis,
      data_retention_period: validatedData.data_retention_period,
      source_page: validatedData.source_page,
      
      // Status fields
      email_verified: false,
      verification_token: generateVerificationToken(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert into database
    const { data: newSignup, error: insertError } = await supabase
      .from('pajama_party_signups')
      .insert([signupData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save signup. Please try again.' },
        { status: 500, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    // TODO: Send verification email (would implement with email service like Resend)
    // await sendVerificationEmail(newSignup.email, newSignup.verification_token);

    // Log successful signup for analytics (anonymized)
    console.log(`New signup: ${validatedData.participation_level} level, station: ${validatedData.preferred_station}`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for joining the European Pajama Party! Please check your email for verification instructions.',
      signup_id: newSignup.id,
      next_steps: [
        'Check your email for verification link',
        'Join our Discord community for updates',
        'Mark September 26, 2025 in your calendar'
      ]
    }, { headers: { ...corsHeaders(request, ['POST']) } });

  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid form data',
          details: error.errors.map(err => ({ field: err.path.join('.'), message: err.message }))
        },
        { status: 400, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500, headers: { ...corsHeaders(request, ['POST']) } }
    );
  }
}

// Generate secure verification token
function generateVerificationToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    endpoint: 'pajama-party-signup',
    timestamp: new Date().toISOString()
  });
}

export const POST = withRateLimit(postHandler as any, RATE_LIMIT_CONFIGS.parties);

// Preflight for cross-origin POSTs
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: { ...corsHeaders(request, ['POST','OPTIONS']) } });
}
