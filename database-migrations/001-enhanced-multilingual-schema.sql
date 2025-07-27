-- Enhanced Multilingual Database Schema for European Night Train Advocacy Platform
-- Migration 001: Foundation for dual-layer map system with multilingual support
-- Created: 2025-01-27
-- Purpose: Support TripHop places integration and progressive user journey

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

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

-- Full-text search index combining multiple languages
CREATE INDEX IF NOT EXISTS idx_places_search ON places USING GIN (
  to_tsvector('english', 
    COALESCE(content->>'en'->>'name', '') || ' ' ||
    COALESCE(content->>'en'->>'brief_desc', '') || ' ' ||
    place_country
  )
);

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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (from_place_id) REFERENCES places(place_id),
  FOREIGN KEY (to_place_id) REFERENCES places(place_id)
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

-- Views for common queries

-- Multilingual places view with fallback logic
CREATE OR REPLACE VIEW places_multilingual AS
SELECT 
  id,
  place_id,
  place_lat,
  place_lon,
  place_country,
  place_image,
  image_attribution,
  place_type,
  priority_score,
  tags,
  
  -- Name with fallback: requested lang -> English -> first available
  CASE 
    WHEN content ? 'en' AND content->'en' ? 'name' THEN content->'en'->>'name'
    ELSE place_id
  END as name_en,
  
  CASE 
    WHEN content ? 'de' AND content->'de' ? 'name' THEN content->'de'->>'name'
    WHEN content ? 'en' AND content->'en' ? 'name' THEN content->'en'->>'name'
    ELSE place_id
  END as name_de,
  
  CASE 
    WHEN content ? 'fr' AND content->'fr' ? 'name' THEN content->'fr'->>'name'
    WHEN content ? 'en' AND content->'en' ? 'name' THEN content->'en'->>'name'
    ELSE place_id
  END as name_fr,
  
  content,
  created_at,
  updated_at
FROM places;

-- Route demand aggregation view
CREATE OR REPLACE VIEW route_demand_summary AS
SELECT 
  r.id,
  r.route_name,
  r.from_place_id,
  r.to_place_id,
  r.total_dreams,
  r.current_demand_score,
  r.advocacy_priority,
  r.exists_currently,
  r.service_type,
  
  -- Place names for easy display
  fp.content->'en'->>'name' as from_name,
  tp.content->'en'->>'name' as to_name,
  
  -- Calculate potential impact score
  CASE 
    WHEN r.exists_currently = FALSE AND r.current_demand_score > 5.0 THEN 'high_impact'
    WHEN r.exists_currently = FALSE AND r.current_demand_score > 2.0 THEN 'medium_impact'
    ELSE 'low_impact'
  END as advocacy_impact
  
FROM routes r
LEFT JOIN places fp ON r.from_place_id = fp.place_id
LEFT JOIN places tp ON r.to_place_id = tp.place_id;

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
    FOR lang IN SELECT jsonb_object_keys(content_jsonb) LOOP
      IF content_jsonb->lang ? field_name THEN
        RETURN content_jsonb->lang->>field_name;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search places with multilingual support
CREATE OR REPLACE FUNCTION search_places(
  search_query TEXT,
  search_lang VARCHAR(5) DEFAULT 'en',
  limit_results INTEGER DEFAULT 50
) RETURNS TABLE (
  place_id VARCHAR(100),
  name TEXT,
  brief_description TEXT,
  country VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  place_type VARCHAR(50),
  priority_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.place_id,
    get_multilingual_content(p.content, search_lang, 'name') as name,
    get_multilingual_content(p.content, search_lang, 'brief_desc') as brief_description,
    p.place_country,
    p.place_lat,
    p.place_lon,
    p.place_type,
    p.priority_score
  FROM places p
  WHERE 
    -- Full-text search in requested language or English fallback
    (
      to_tsvector('english', 
        COALESCE(get_multilingual_content(p.content, search_lang, 'name'), '') || ' ' ||
        COALESCE(get_multilingual_content(p.content, search_lang, 'brief_desc'), '') || ' ' ||
        p.place_country
      ) @@ plainto_tsquery('english', search_query)
    )
    OR 
    -- Fuzzy matching for place names
    (
      similarity(get_multilingual_content(p.content, search_lang, 'name'), search_query) > 0.3
    )
  ORDER BY 
    p.priority_score DESC,
    similarity(get_multilingual_content(p.content, search_lang, 'name'), search_query) DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Create pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Comments for documentation
COMMENT ON TABLE places IS 'Multilingual places database supporting TripHop destinations and OpenRailMaps stations';
COMMENT ON COLUMN places.content IS 'JSONB structure: {"en": {"name": "...", "brief_desc": "...", "longer_desc": "..."}, "de": {...}}';
COMMENT ON TABLE routes IS 'Route demand tracking and advocacy priority management';
COMMENT ON TABLE content IS 'Dynamic multilingual content management for platform UI';
COMMENT ON FUNCTION get_multilingual_content IS 'Retrieves content in requested language with automatic fallbacks';
COMMENT ON FUNCTION search_places IS 'Full-text and fuzzy search across multilingual place names and descriptions';