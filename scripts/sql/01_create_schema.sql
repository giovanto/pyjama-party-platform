-- =====================================================
-- Pajama Party Platform Database Schema
-- Phase 2: Database Setup with Supabase
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- Table: dreams
-- Stores user dream submissions with automatic expiration
-- =====================================================

CREATE TABLE IF NOT EXISTS dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dreamer_name VARCHAR(255) NOT NULL CHECK (length(trim(dreamer_name)) >= 2),
    origin_station VARCHAR(255) NOT NULL CHECK (length(trim(origin_station)) >= 2),
    origin_country VARCHAR(2), -- ISO 3166-1 alpha-2 country code
    origin_lat DECIMAL(10, 8) CHECK (origin_lat >= -90 AND origin_lat <= 90),
    origin_lng DECIMAL(11, 8) CHECK (origin_lng >= -180 AND origin_lng <= 180),
    destination_city VARCHAR(255) NOT NULL CHECK (length(trim(destination_city)) >= 2),
    destination_country VARCHAR(2), -- ISO 3166-1 alpha-2 country code
    destination_lat DECIMAL(10, 8) CHECK (destination_lat >= -90 AND destination_lat <= 90),
    destination_lng DECIMAL(11, 8) CHECK (destination_lng >= -180 AND destination_lng <= 180),
    email VARCHAR(255) CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    
    -- Ensure expiration is in the future
    CONSTRAINT dreams_expires_at_check CHECK (expires_at > created_at)
);

-- =====================================================
-- Table: stations
-- Stores European train station data with search capabilities
-- =====================================================

CREATE TABLE IF NOT EXISTS stations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id VARCHAR(255) UNIQUE NOT NULL, -- External reference ID
    name VARCHAR(255) NOT NULL CHECK (length(trim(name)) >= 2),
    country VARCHAR(2) NOT NULL CHECK (length(country) = 2), -- ISO 3166-1 alpha-2
    country_name VARCHAR(255) NOT NULL CHECK (length(trim(country_name)) >= 2),
    city VARCHAR(255) CHECK (city IS NULL OR length(trim(city)) >= 2),
    lat DECIMAL(10, 8) NOT NULL CHECK (lat >= -90 AND lat <= 90),
    lng DECIMAL(11, 8) NOT NULL CHECK (lng >= -180 AND lng <= 180),
    station_type VARCHAR(50) DEFAULT 'station' CHECK (station_type IN ('station', 'stop', 'halt', 'junction')),
    searchable TEXT NOT NULL, -- Pre-processed search text
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure coordinates are reasonable for Europe
    CONSTRAINT stations_europe_bounds CHECK (
        lat >= 34.0 AND lat <= 72.0 AND  -- Europe latitude bounds
        lng >= -25.0 AND lng <= 45.0      -- Europe longitude bounds
    )
);

-- =====================================================
-- Performance Indexes
-- =====================================================

-- Dreams table indexes
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_expires_at ON dreams(expires_at);
CREATE INDEX IF NOT EXISTS idx_dreams_origin_station ON dreams(origin_station);
CREATE INDEX IF NOT EXISTS idx_dreams_destination_city ON dreams(destination_city);
CREATE INDEX IF NOT EXISTS idx_dreams_active ON dreams(created_at DESC);

-- Stations table indexes
CREATE INDEX IF NOT EXISTS idx_stations_external_id ON stations(external_id);
CREATE INDEX IF NOT EXISTS idx_stations_country ON stations(country);
CREATE INDEX IF NOT EXISTS idx_stations_active ON stations(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_stations_name_trgm ON stations USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stations_searchable_trgm ON stations USING gin(searchable gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_stations_location ON stations(lat, lng);

-- Combined index for station search
CREATE INDEX IF NOT EXISTS idx_stations_search_combined ON stations(country, is_active, name) WHERE is_active = TRUE;

-- =====================================================
-- Row Level Security Setup
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;

-- Dreams table policies
CREATE POLICY "Public read access to active dreams" ON dreams
    FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Public insert access to dreams" ON dreams
    FOR INSERT WITH CHECK (
        length(trim(dreamer_name)) >= 2 AND
        length(trim(origin_station)) >= 2 AND
        length(trim(destination_city)) >= 2
    );

-- Stations table policies
CREATE POLICY "Public read access to active stations" ON stations
    FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- Utility Functions
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at on stations
CREATE TRIGGER update_stations_updated_at
    BEFORE UPDATE ON stations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to build searchable text for stations
CREATE OR REPLACE FUNCTION build_station_searchable(
    station_name TEXT,
    city_name TEXT,
    country_name TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(station_name, '') || ' ' || 
           COALESCE(city_name, '') || ' ' || 
           COALESCE(country_name, '');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to cleanup expired dreams
CREATE OR REPLACE FUNCTION cleanup_expired_dreams()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM dreams WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the cleanup operation
    INSERT INTO cleanup_log (table_name, deleted_count, cleaned_at)
    VALUES ('dreams', deleted_count, NOW())
    ON CONFLICT DO NOTHING; -- Ignore if logging table doesn't exist
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Optional: Cleanup logging table
-- =====================================================

CREATE TABLE IF NOT EXISTS cleanup_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    deleted_count INTEGER NOT NULL DEFAULT 0,
    cleaned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for cleanup log
ALTER TABLE cleanup_log ENABLE ROW LEVEL SECURITY;

-- Only allow service accounts to read cleanup logs
CREATE POLICY "Service account access to cleanup log" ON cleanup_log
    FOR SELECT USING (auth.role() = 'service_role');

-- =====================================================
-- Database Statistics and Monitoring Views
-- =====================================================

-- View for active dreams statistics
CREATE OR REPLACE VIEW dreams_stats AS
SELECT 
    COUNT(*) as total_active_dreams,
    COUNT(DISTINCT origin_station) as unique_origin_stations,
    COUNT(DISTINCT destination_city) as unique_destinations,
    COUNT(*) FILTER (WHERE email IS NOT NULL) as dreams_with_email,
    DATE(created_at) as dream_date
FROM dreams 
WHERE expires_at > NOW()
GROUP BY DATE(created_at)
ORDER BY dream_date DESC;

-- View for community formation (stations with 2+ dreamers)
CREATE OR REPLACE VIEW communities_forming AS
SELECT 
    origin_station,
    origin_country,
    COUNT(*) as dreamer_count,
    ARRAY_AGG(dreamer_name ORDER BY created_at) as dreamers,
    MIN(created_at) as first_dream_at,
    MAX(created_at) as latest_dream_at
FROM dreams 
WHERE expires_at > NOW()
GROUP BY origin_station, origin_country
HAVING COUNT(*) >= 2
ORDER BY dreamer_count DESC, latest_dream_at DESC;

-- Grant access to views
GRANT SELECT ON dreams_stats TO anon, authenticated;
GRANT SELECT ON communities_forming TO anon, authenticated;

-- =====================================================
-- Schema Complete
-- =====================================================

-- Add a comment to track schema version
COMMENT ON SCHEMA public IS 'Pajama Party Platform v2 - Schema v1.0.0';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run the import stations script';
    RAISE NOTICE '2. Test the API endpoints';
    RAISE NOTICE '3. Set up scheduled cleanup job';
END $$;