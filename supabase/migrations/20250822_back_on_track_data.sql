-- Migration: Back-on-Track Night Train Data Integration
-- Created: 2025-08-22
-- Purpose: Import official Back-on-Track night train data for advocacy platform

-- Table: bot_agencies
-- Stores information about night train operating agencies
CREATE TABLE IF NOT EXISTS bot_agencies (
    id BIGSERIAL PRIMARY KEY,
    agency_id TEXT UNIQUE NOT NULL,
    agency_name TEXT NOT NULL,
    agency_url TEXT,
    agency_timezone TEXT NOT NULL DEFAULT 'CET',
    agency_lang TEXT DEFAULT 'en',
    agency_phone TEXT,
    agency_fare_url TEXT,
    agency_email TEXT,
    agency_name_romanized TEXT,
    agency_name_brand TEXT,
    agency_state TEXT, -- Country/state code
    agency_logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT bot_agencies_agency_id_key UNIQUE (agency_id)
);

-- Table: bot_routes  
-- Stores night train route information
CREATE TABLE IF NOT EXISTS bot_routes (
    id BIGSERIAL PRIMARY KEY,
    route_id TEXT UNIQUE NOT NULL,
    agency_id TEXT NOT NULL REFERENCES bot_agencies(agency_id) ON DELETE CASCADE,
    route_short_name TEXT,
    route_long_name TEXT,
    route_desc TEXT,
    route_type INTEGER DEFAULT 2, -- GTFS: 2 = Rail
    route_url TEXT,
    route_color TEXT,
    route_text_color TEXT,
    route_sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT bot_routes_route_id_key UNIQUE (route_id)
);

-- Table: bot_stops
-- Stores train station/stop information  
CREATE TABLE IF NOT EXISTS bot_stops (
    id BIGSERIAL PRIMARY KEY,
    stop_id TEXT UNIQUE NOT NULL,
    stop_code TEXT,
    stop_name TEXT NOT NULL,
    stop_desc TEXT,
    stop_lat DECIMAL(10, 8), -- Latitude with sufficient precision
    stop_lon DECIMAL(11, 8), -- Longitude with sufficient precision
    zone_id TEXT,
    stop_url TEXT,
    location_type INTEGER DEFAULT 0, -- GTFS: 0 = stop/platform
    parent_station TEXT,
    stop_timezone TEXT,
    wheelchair_boarding INTEGER DEFAULT 0, -- GTFS accessibility
    level_id TEXT,
    platform_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance and spatial queries
    CONSTRAINT bot_stops_stop_id_key UNIQUE (stop_id)
);

-- Table: bot_trips
-- Stores individual trip instances
CREATE TABLE IF NOT EXISTS bot_trips (
    id BIGSERIAL PRIMARY KEY,
    trip_id TEXT UNIQUE NOT NULL,
    route_id TEXT NOT NULL REFERENCES bot_routes(route_id) ON DELETE CASCADE,
    service_id TEXT NOT NULL, -- Calendar service identifier
    trip_headsign TEXT,
    trip_short_name TEXT,
    direction_id INTEGER DEFAULT 0, -- 0 = outbound, 1 = inbound
    block_id TEXT,
    shape_id TEXT,
    wheelchair_accessible INTEGER DEFAULT 0,
    bikes_allowed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT bot_trips_trip_id_key UNIQUE (trip_id)
);

-- Table: bot_stop_times
-- Stores stop times for each trip
CREATE TABLE IF NOT EXISTS bot_stop_times (
    id BIGSERIAL PRIMARY KEY,
    trip_id TEXT NOT NULL REFERENCES bot_trips(trip_id) ON DELETE CASCADE,
    arrival_time TEXT, -- HH:MM:SS format (can exceed 24:00:00)
    departure_time TEXT, -- HH:MM:SS format
    stop_id TEXT NOT NULL REFERENCES bot_stops(stop_id) ON DELETE CASCADE,
    stop_sequence INTEGER NOT NULL,
    stop_headsign TEXT,
    pickup_type INTEGER DEFAULT 0, -- GTFS pickup rules
    drop_off_type INTEGER DEFAULT 0, -- GTFS drop-off rules
    continuous_pickup INTEGER DEFAULT 1,
    continuous_drop_off INTEGER DEFAULT 1,
    shape_dist_traveled DECIMAL(10, 2),
    timepoint INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Composite primary key alternative
    CONSTRAINT bot_stop_times_trip_stop_seq UNIQUE (trip_id, stop_sequence)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bot_agencies_state ON bot_agencies(agency_state);
CREATE INDEX IF NOT EXISTS idx_bot_agencies_name ON bot_agencies(agency_name);

CREATE INDEX IF NOT EXISTS idx_bot_routes_agency ON bot_routes(agency_id);
CREATE INDEX IF NOT EXISTS idx_bot_routes_type ON bot_routes(route_type);
CREATE INDEX IF NOT EXISTS idx_bot_routes_name ON bot_routes(route_short_name, route_long_name);

CREATE INDEX IF NOT EXISTS idx_bot_stops_location ON bot_stops(stop_lat, stop_lon) WHERE stop_lat IS NOT NULL AND stop_lon IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bot_stops_name ON bot_stops(stop_name);
CREATE INDEX IF NOT EXISTS idx_bot_stops_parent ON bot_stops(parent_station);

CREATE INDEX IF NOT EXISTS idx_bot_trips_route ON bot_trips(route_id);
CREATE INDEX IF NOT EXISTS idx_bot_trips_service ON bot_trips(service_id);

CREATE INDEX IF NOT EXISTS idx_bot_stop_times_trip ON bot_stop_times(trip_id);
CREATE INDEX IF NOT EXISTS idx_bot_stop_times_stop ON bot_stop_times(stop_id);
CREATE INDEX IF NOT EXISTS idx_bot_stop_times_sequence ON bot_stop_times(trip_id, stop_sequence);

-- Enable Row Level Security (RLS) for data protection
ALTER TABLE bot_agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_stop_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access for advocacy data
CREATE POLICY "bot_agencies_public_read" ON bot_agencies
    FOR SELECT USING (true);

CREATE POLICY "bot_routes_public_read" ON bot_routes
    FOR SELECT USING (true);

CREATE POLICY "bot_stops_public_read" ON bot_stops
    FOR SELECT USING (true);

CREATE POLICY "bot_trips_public_read" ON bot_trips
    FOR SELECT USING (true);

CREATE POLICY "bot_stop_times_public_read" ON bot_stop_times
    FOR SELECT USING (true);

-- Helper functions for common queries
CREATE OR REPLACE FUNCTION get_bot_routes_by_agency(agency_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    route_id TEXT,
    route_name TEXT,
    agency_name TEXT,
    agency_brand TEXT,
    agency_state TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.route_id,
        COALESCE(r.route_long_name, r.route_short_name) as route_name,
        a.agency_name,
        a.agency_name_brand,
        a.agency_state
    FROM bot_routes r
    JOIN bot_agencies a ON r.agency_id = a.agency_id
    WHERE agency_filter IS NULL OR a.agency_id = agency_filter
    ORDER BY a.agency_name, r.route_short_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_bot_stops_by_country(country_filter TEXT DEFAULT NULL)
RETURNS TABLE (
    stop_id TEXT,
    stop_name TEXT,
    stop_lat DECIMAL,
    stop_lon DECIMAL,
    country TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.stop_id,
        s.stop_name,
        s.stop_lat,
        s.stop_lon,
        -- Extract country from stop patterns or use a lookup table
        CASE 
            WHEN s.stop_id LIKE 'DE%' THEN 'Germany'
            WHEN s.stop_id LIKE 'FR%' THEN 'France'
            WHEN s.stop_id LIKE 'AT%' THEN 'Austria'
            WHEN s.stop_id LIKE 'IT%' THEN 'Italy'
            WHEN s.stop_id LIKE 'CH%' THEN 'Switzerland'
            ELSE 'Unknown'
        END as country
    FROM bot_stops s
    WHERE s.stop_lat IS NOT NULL 
    AND s.stop_lon IS NOT NULL
    AND (country_filter IS NULL OR 
         CASE 
            WHEN s.stop_id LIKE 'DE%' THEN 'Germany'
            WHEN s.stop_id LIKE 'FR%' THEN 'France'
            WHEN s.stop_id LIKE 'AT%' THEN 'Austria'
            WHEN s.stop_id LIKE 'IT%' THEN 'Italy'
            WHEN s.stop_id LIKE 'CH%' THEN 'Switzerland'
            ELSE 'Unknown'
         END = country_filter)
    ORDER BY s.stop_name;
END;
$$ LANGUAGE plpgsql;

-- Create view for easier querying of route details
CREATE OR REPLACE VIEW bot_route_details AS
SELECT 
    r.route_id,
    r.route_short_name,
    r.route_long_name,
    r.route_desc,
    r.route_url,
    a.agency_id,
    a.agency_name,
    a.agency_name_brand,
    a.agency_state,
    a.agency_url,
    a.agency_fare_url,
    r.created_at,
    r.updated_at
FROM bot_routes r
JOIN bot_agencies a ON r.agency_id = a.agency_id;

-- Create materialized view for performance-critical queries
CREATE MATERIALIZED VIEW IF NOT EXISTS bot_route_summary AS
SELECT 
    a.agency_state as country,
    a.agency_name,
    COUNT(r.route_id) as route_count,
    array_agg(DISTINCT r.route_short_name ORDER BY r.route_short_name) as routes
FROM bot_agencies a
LEFT JOIN bot_routes r ON a.agency_id = r.agency_id
GROUP BY a.agency_state, a.agency_name
ORDER BY route_count DESC, a.agency_name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_bot_route_summary_agency 
ON bot_route_summary (agency_name, country);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_bot_route_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY bot_route_summary;
END;
$$ LANGUAGE plpgsql;

-- Comment the tables for documentation
COMMENT ON TABLE bot_agencies IS 'Official Back-on-Track night train operating agencies';
COMMENT ON TABLE bot_routes IS 'Night train routes from Back-on-Track database';
COMMENT ON TABLE bot_stops IS 'Train stations and stops for night train network';
COMMENT ON TABLE bot_trips IS 'Individual trip instances for night train routes';
COMMENT ON TABLE bot_stop_times IS 'Timetable data for night train stops';

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;