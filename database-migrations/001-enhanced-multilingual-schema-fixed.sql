-- Enhanced Multilingual Database Schema for European Night Train Advocacy Platform
-- Migration 001: Foundation for dual-layer map system with multilingual support
-- Created: 2025-01-27 (Fixed JSONB operators)
-- Purpose: Support TripHop places integration and progressive user journey

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enhanced places table with multilingual JSONB support
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id VARCHAR(100) UNIQUE NOT NULL,
  
  -- Geographic data
  place_lat DECIMAL(10, 8) NOT NULL,
  place_lon DECIMAL(11, 8) NOT NULL,
  lat_lon_tolerance DECIMAL(6, 4) DEFAULT 3.0,
  
  -- Core place data
  place_country VARCHAR(100) NOT NULL,
  place_image VARCHAR(500),
  image_attribution TEXT,
  
  -- Multilingual content stored as JSONB
  -- Structure: { "en": { "name": "...", "brief_desc": "...", "longer_desc": "..." }, "de": {...}, "fr": {...} }
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Search and categorization
  place_type VARCHAR(50) DEFAULT 'destination', -- 'destination', 'station', 'poi'
  priority_score INTEGER DEFAULT 1, -- For sorting popular destinations
  tags TEXT[] DEFAULT '{}', -- Tags for filtering: ['cultural', 'nature', 'urban']
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Data source tracking
  source_type VARCHAR(50) DEFAULT 'triphop', -- 'triphop', 'openrail', 'manual'
  source_data JSONB DEFAULT '{}'::jsonb -- Original source data for reference
);

-- Optimized indexes for places search and geolocation
CREATE INDEX IF NOT EXISTS idx_places_country ON places (place_country);
CREATE INDEX IF NOT EXISTS idx_places_coordinates ON places (place_lat, place_lon);
CREATE INDEX IF NOT EXISTS idx_places_type ON places (place_type);
CREATE INDEX IF NOT EXISTS idx_places_priority ON places (priority_score DESC);

-- GIN indexes for JSONB content and full-text search
CREATE INDEX IF NOT EXISTS idx_places_content_gin ON places USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_places_tags ON places USING GIN (tags);

-- Enhanced stations table (extends existing)
ALTER TABLE stations ADD COLUMN IF NOT EXISTS country_code VARCHAR(3);
ALTER TABLE stations ADD COLUMN IF NOT EXISTS station_type VARCHAR(50) DEFAULT 'train';
ALTER TABLE stations ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '{}'::jsonb;
ALTER TABLE stations ADD COLUMN IF NOT EXISTS accessibility JSONB DEFAULT '{}'::jsonb;

-- Enhanced dreams table for better route tracking
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS route_type VARCHAR(50) DEFAULT 'night_train';
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS travel_purpose VARCHAR(100);
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS estimated_demand INTEGER DEFAULT 1;
ALTER TABLE dreams ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted';

-- Routes table for demand aggregation and analysis
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Route definition
  from_place_id VARCHAR(100),
  to_place_id VARCHAR(100),
  route_name VARCHAR(255) NOT NULL,
  
  -- Geographic data
  from_coordinates POINT,
  to_coordinates POINT,
  distance_km INTEGER,
  
  -- Demand tracking
  total_dreams INTEGER DEFAULT 0,
  current_demand_score DECIMAL(5,2) DEFAULT 0.0,
  advocacy_priority VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
  
  -- Route status
  exists_currently BOOLEAN DEFAULT FALSE,
  service_type VARCHAR(50), -- 'night_train', 'day_train', 'bus', 'none'
  operator VARCHAR(100),
  frequency VARCHAR(100), -- 'daily', 'weekly', 'seasonal', 'none'
  
  -- Multilingual route descriptions
  content JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for routes
CREATE INDEX IF NOT EXISTS idx_routes_from_place ON routes (from_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_to_place ON routes (to_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_demand ON routes (current_demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_routes_priority ON routes (advocacy_priority);
CREATE INDEX IF NOT EXISTS idx_routes_exists ON routes (exists_currently);

-- Content management table for dynamic multilingual content
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key VARCHAR(200) UNIQUE NOT NULL, -- 'homepage.hero.title', 'event.description'
  content_type VARCHAR(50) NOT NULL, -- 'text', 'markdown', 'html'
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Multilingual content
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for content management
CREATE INDEX IF NOT EXISTS idx_content_key ON content (content_key);
CREATE INDEX IF NOT EXISTS idx_content_published ON content (published);
CREATE INDEX IF NOT EXISTS idx_content_gin ON content USING GIN (content);

-- Function to update updated_at timestamp (enhanced)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access on places" ON places
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on routes" ON routes
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on content" ON content
  FOR SELECT USING (published = true);

-- Create policies for public insert access (for user-generated content)
CREATE POLICY "Allow public insert access on dreams" ON dreams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access on pyjama_parties" ON pyjama_parties
  FOR INSERT WITH CHECK (true);

-- Helper functions for multilingual content retrieval

-- Get content in specific language with fallbacks
CREATE OR REPLACE FUNCTION get_multilingual_content(
  content_jsonb JSONB,
  requested_lang VARCHAR(5) DEFAULT 'en',
  field_name VARCHAR(50) DEFAULT 'name'
) RETURNS TEXT AS $$
BEGIN
  -- Try requested language first
  IF content_jsonb ? requested_lang AND content_jsonb->requested_lang ? field_name THEN
    RETURN content_jsonb->requested_lang->>field_name;
  END IF;
  
  -- Fallback to English
  IF content_jsonb ? 'en' AND content_jsonb->'en' ? field_name THEN
    RETURN content_jsonb->'en'->>field_name;
  END IF;
  
  -- Fallback to any available language
  IF jsonb_typeof(content_jsonb) = 'object' THEN
    DECLARE
      lang TEXT;
    BEGIN
      FOR lang IN SELECT jsonb_object_keys(content_jsonb) LOOP
        IF content_jsonb->lang ? field_name THEN
          RETURN content_jsonb->lang->>field_name;
        END IF;
      END LOOP;
    END;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Comments for documentation
COMMENT ON TABLE places IS 'Multilingual places database supporting TripHop destinations and OpenRailMaps stations';
COMMENT ON COLUMN places.content IS 'JSONB structure: {"en": {"name": "...", "brief_desc": "...", "longer_desc": "..."}, "de": {...}}';
COMMENT ON TABLE routes IS 'Route demand tracking and advocacy priority management';
COMMENT ON TABLE content IS 'Dynamic multilingual content management for platform UI';
COMMENT ON FUNCTION get_multilingual_content IS 'Retrieves content in requested language with automatic fallbacks';