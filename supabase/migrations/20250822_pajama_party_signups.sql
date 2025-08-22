-- Migration: Pajama Party Signups with GDPR Compliance
-- Created: 2025-08-22
-- Purpose: Store user signups for September 26 European Pajama Party with full GDPR compliance

-- Table: pajama_party_signups
-- Stores GDPR-compliant user signups for the September 26 event
CREATE TABLE IF NOT EXISTS pajama_party_signups (
    id BIGSERIAL PRIMARY KEY,
    
    -- Personal Information
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    preferred_station TEXT NOT NULL,
    participation_level TEXT NOT NULL CHECK (participation_level IN ('attend', 'volunteer', 'coordinator')),
    message TEXT, -- Optional message from user
    
    -- Consent Management (GDPR Compliance)
    newsletter_consent BOOLEAN NOT NULL DEFAULT false,
    privacy_consent BOOLEAN NOT NULL, -- Required for processing
    email_verification_required BOOLEAN NOT NULL DEFAULT true,
    
    -- GDPR Audit Trail
    gdpr_consent_timestamp TIMESTAMPTZ NOT NULL,
    ip_address TEXT, -- For security and audit purposes
    user_agent TEXT, -- Browser information for security
    consent_version TEXT NOT NULL DEFAULT '1.0',
    legal_basis TEXT NOT NULL DEFAULT 'consent', -- GDPR Article 6(1)(a)
    data_retention_period TEXT NOT NULL DEFAULT '2_years',
    source_page TEXT, -- Where they signed up from
    
    -- Email Verification
    email_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token TEXT UNIQUE,
    verified_at TIMESTAMPTZ,
    verification_attempts INTEGER DEFAULT 0,
    
    -- Status Management
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'confirmed', 'cancelled')),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    -- Data Processing Audit
    data_processed_for_analytics BOOLEAN DEFAULT false,
    data_anonymized_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- GDPR Data Subject Rights Tracking
    data_access_requests INTEGER DEFAULT 0,
    data_rectification_requests INTEGER DEFAULT 0,
    data_erasure_requested BOOLEAN DEFAULT false,
    data_erasure_requested_at TIMESTAMPTZ,
    
    -- Event-specific fields
    station_assignment TEXT, -- Assigned to specific station after verification
    volunteer_role TEXT, -- For volunteers/coordinators
    emergency_contact TEXT, -- Optional emergency contact info
    
    -- Communication preferences
    communication_language TEXT DEFAULT 'en',
    preferred_contact_method TEXT DEFAULT 'email',
    
    -- Marketing and Analytics (with consent)
    marketing_consent BOOLEAN DEFAULT false,
    analytics_consent BOOLEAN DEFAULT false,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for performance and common queries
CREATE INDEX IF NOT EXISTS idx_pajama_signups_email ON pajama_party_signups(email);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_station ON pajama_party_signups(preferred_station);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_level ON pajama_party_signups(participation_level);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_status ON pajama_party_signups(status);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_verified ON pajama_party_signups(email_verified);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_created ON pajama_party_signups(created_at);
CREATE INDEX IF NOT EXISTS idx_pajama_signups_verification_token ON pajama_party_signups(verification_token) WHERE verification_token IS NOT NULL;

-- Partial index for active (non-cancelled) signups
CREATE INDEX IF NOT EXISTS idx_pajama_signups_active ON pajama_party_signups(preferred_station, participation_level) 
WHERE status != 'cancelled' AND data_erasure_requested = false;

-- Enable Row Level Security for data protection
ALTER TABLE pajama_party_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own data
CREATE POLICY "pajama_signups_own_data" ON pajama_party_signups
    FOR ALL USING (auth.jwt() ->> 'email' = email);

-- RLS Policy: Service role can manage all data
CREATE POLICY "pajama_signups_service_role" ON pajama_party_signups
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_pajama_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Automatically update updated_at on row changes
CREATE TRIGGER trigger_pajama_signups_updated_at
    BEFORE UPDATE ON pajama_party_signups
    FOR EACH ROW
    EXECUTE FUNCTION update_pajama_signups_updated_at();

-- Function: Anonymize personal data (GDPR Right to Erasure)
CREATE OR REPLACE FUNCTION anonymize_pajama_signup(signup_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE pajama_party_signups
    SET 
        name = 'Anonymized User',
        email = 'anonymized_' || id || '@example.com',
        message = NULL,
        ip_address = NULL,
        user_agent = NULL,
        verification_token = NULL,
        emergency_contact = NULL,
        data_anonymized_at = NOW(),
        updated_at = NOW()
    WHERE id = signup_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Get signup statistics (anonymized)
CREATE OR REPLACE FUNCTION get_pajama_party_stats()
RETURNS TABLE (
    total_signups BIGINT,
    verified_signups BIGINT,
    by_participation_level JSONB,
    by_station JSONB,
    by_country JSONB,
    signup_trend JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE email_verified = true) as verified,
            COUNT(*) FILTER (WHERE participation_level = 'attend') as attend_count,
            COUNT(*) FILTER (WHERE participation_level = 'volunteer') as volunteer_count,
            COUNT(*) FILTER (WHERE participation_level = 'coordinator') as coordinator_count
        FROM pajama_party_signups
        WHERE data_erasure_requested = false AND status != 'cancelled'
    ),
    station_stats AS (
        SELECT jsonb_object_agg(preferred_station, count) as stations
        FROM (
            SELECT preferred_station, COUNT(*) as count
            FROM pajama_party_signups
            WHERE data_erasure_requested = false AND status != 'cancelled'
            GROUP BY preferred_station
            ORDER BY count DESC
            LIMIT 20
        ) s
    ),
    daily_signups AS (
        SELECT jsonb_object_agg(signup_date, daily_count) as trend
        FROM (
            SELECT 
                DATE(created_at) as signup_date,
                COUNT(*) as daily_count
            FROM pajama_party_signups
            WHERE data_erasure_requested = false 
            AND created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY signup_date
        ) d
    )
    SELECT 
        s.total,
        s.verified,
        jsonb_build_object(
            'attend', s.attend_count,
            'volunteer', s.volunteer_count,
            'coordinator', s.coordinator_count
        ),
        st.stations,
        jsonb_build_object('data', 'Privacy protected'), -- Country data would need additional privacy analysis
        ds.trend
    FROM stats s, station_stats st, daily_signups ds;
END;
$$ LANGUAGE plpgsql;

-- Function: GDPR data export for a user
CREATE OR REPLACE FUNCTION export_user_pajama_data(user_email TEXT)
RETURNS TABLE (
    export_data JSONB,
    export_timestamp TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'personal_data', jsonb_build_object(
                'name', name,
                'email', email,
                'preferred_station', preferred_station,
                'participation_level', participation_level,
                'message', message
            ),
            'consent_data', jsonb_build_object(
                'newsletter_consent', newsletter_consent,
                'privacy_consent', privacy_consent,
                'gdpr_consent_timestamp', gdpr_consent_timestamp,
                'consent_version', consent_version,
                'legal_basis', legal_basis
            ),
            'processing_data', jsonb_build_object(
                'created_at', created_at,
                'updated_at', updated_at,
                'status', status,
                'email_verified', email_verified,
                'verified_at', verified_at
            ),
            'rights_exercised', jsonb_build_object(
                'data_access_requests', data_access_requests,
                'data_rectification_requests', data_rectification_requests,
                'data_erasure_requested', data_erasure_requested
            )
        ) as export_data,
        NOW() as export_timestamp
    FROM pajama_party_signups
    WHERE email = user_email
    AND data_erasure_requested = false;
END;
$$ LANGUAGE plpgsql;

-- Create a view for public statistics (no personal data)
CREATE OR REPLACE VIEW pajama_party_public_stats AS
SELECT 
    COUNT(*) as total_participants,
    COUNT(*) FILTER (WHERE participation_level = 'coordinator') as stations_with_coordinators,
    COUNT(DISTINCT preferred_station) as stations_count,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_participants,
    -- Anonymized geographic distribution
    COUNT(*) FILTER (WHERE preferred_station LIKE '%Germany%' OR preferred_station LIKE '%DE%') as germany_approx,
    COUNT(*) FILTER (WHERE preferred_station LIKE '%France%' OR preferred_station LIKE '%FR%') as france_approx,
    COUNT(*) FILTER (WHERE preferred_station LIKE '%Italy%' OR preferred_station LIKE '%IT%') as italy_approx,
    -- Growth metrics
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as signups_last_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as signups_last_day
FROM pajama_party_signups
WHERE status != 'cancelled' AND data_erasure_requested = false;

-- Grant permissions for authenticated users and service role
GRANT SELECT ON pajama_party_public_stats TO anon, authenticated;
GRANT ALL ON pajama_party_signups TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON TABLE pajama_party_signups IS 'GDPR-compliant storage for September 26 European Pajama Party signups';
COMMENT ON COLUMN pajama_party_signups.gdpr_consent_timestamp IS 'Timestamp when user gave GDPR consent';
COMMENT ON COLUMN pajama_party_signups.legal_basis IS 'GDPR legal basis for processing (Article 6)';
COMMENT ON COLUMN pajama_party_signups.data_retention_period IS 'How long data will be retained';
COMMENT ON FUNCTION anonymize_pajama_signup IS 'Anonymizes personal data for GDPR Right to Erasure';
COMMENT ON VIEW pajama_party_public_stats IS 'Public statistics with no personal data';

-- Data retention policy note
-- This table should have a scheduled job to automatically delete/anonymize data after 2 years
-- or when the retention period specified by the user expires, in compliance with GDPR Article 17.