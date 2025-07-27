-- Core Tables Only - Safe Migration for European Night Train Platform
-- This version only creates the essential new tables without touching existing policies

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
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Search and categorization
  place_type VARCHAR(50) DEFAULT 'destination',
  priority_score INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Data source tracking
  source_type VARCHAR(50) DEFAULT 'triphop',
  source_data JSONB DEFAULT '{}'::jsonb
);

-- Routes table for demand aggregation and analysis
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_place_id VARCHAR(100),
  to_place_id VARCHAR(100),
  route_name VARCHAR(255) NOT NULL,
  from_coordinates POINT,
  to_coordinates POINT,
  distance_km INTEGER,
  total_dreams INTEGER DEFAULT 0,
  current_demand_score DECIMAL(5,2) DEFAULT 0.0,
  advocacy_priority VARCHAR(20) DEFAULT 'medium',
  exists_currently BOOLEAN DEFAULT FALSE,
  service_type VARCHAR(50),
  operator VARCHAR(100),
  frequency VARCHAR(100),
  content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content management table
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_key VARCHAR(200) UNIQUE NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for places
CREATE INDEX IF NOT EXISTS idx_places_country ON places (place_country);
CREATE INDEX IF NOT EXISTS idx_places_coordinates ON places (place_lat, place_lon);
CREATE INDEX IF NOT EXISTS idx_places_type ON places (place_type);
CREATE INDEX IF NOT EXISTS idx_places_priority ON places (priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_places_content_gin ON places USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_places_tags ON places USING GIN (tags);

-- Indexes for routes
CREATE INDEX IF NOT EXISTS idx_routes_from_place ON routes (from_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_to_place ON routes (to_place_id);
CREATE INDEX IF NOT EXISTS idx_routes_demand ON routes (current_demand_score DESC);

-- Indexes for content
CREATE INDEX IF NOT EXISTS idx_content_key ON content (content_key);
CREATE INDEX IF NOT EXISTS idx_content_published ON content (published);

-- Enable RLS for new tables only
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist (using DO blocks)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on places' AND tablename = 'places') THEN
    CREATE POLICY "Allow public read access on places" ON places FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on routes' AND tablename = 'routes') THEN
    CREATE POLICY "Allow public read access on routes" ON routes FOR SELECT USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on content' AND tablename = 'content') THEN
    CREATE POLICY "Allow public read access on content" ON content FOR SELECT USING (published = true);
  END IF;
END $$;

-- Helper function for multilingual content
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
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;