-- Rollback Migration 001: Enhanced Multilingual Schema
-- This script safely removes the enhanced schema changes while preserving existing data
-- Created: 2025-01-27

-- Remove new functions
DROP FUNCTION IF EXISTS search_places(TEXT, VARCHAR(5), INTEGER);
DROP FUNCTION IF EXISTS get_multilingual_content(JSONB, VARCHAR(5), VARCHAR(50));

-- Remove new views
DROP VIEW IF EXISTS route_demand_summary;
DROP VIEW IF EXISTS places_multilingual;

-- Remove new triggers
DROP TRIGGER IF EXISTS update_content_updated_at ON content;
DROP TRIGGER IF EXISTS update_routes_updated_at ON routes;
DROP TRIGGER IF EXISTS update_places_updated_at ON places;

-- Remove new policies
DROP POLICY IF EXISTS "Allow public insert access on pyjama_parties" ON pyjama_parties;
DROP POLICY IF EXISTS "Allow public insert access on dreams" ON dreams;
DROP POLICY IF EXISTS "Allow public read access on content" ON content;
DROP POLICY IF EXISTS "Allow public read access on routes" ON routes;
DROP POLICY IF EXISTS "Allow public read access on places" ON places;

-- Disable RLS on new tables
ALTER TABLE IF EXISTS content DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS places DISABLE ROW LEVEL SECURITY;

-- Remove new tables (in dependency order)
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS places;

-- Remove new columns from existing tables
ALTER TABLE dreams DROP COLUMN IF EXISTS status;
ALTER TABLE dreams DROP COLUMN IF EXISTS estimated_demand;
ALTER TABLE dreams DROP COLUMN IF EXISTS travel_purpose;
ALTER TABLE dreams DROP COLUMN IF EXISTS route_type;

ALTER TABLE stations DROP COLUMN IF EXISTS accessibility;
ALTER TABLE stations DROP COLUMN IF EXISTS facilities;
ALTER TABLE stations DROP COLUMN IF EXISTS station_type;
ALTER TABLE stations DROP COLUMN IF EXISTS country_code;

-- Remove new extensions (only if not used elsewhere)
-- Note: We keep uuid-ossp, btree_gin, and pg_trgm as they might be used by other parts
-- DROP EXTENSION IF EXISTS pg_trgm;
-- DROP EXTENSION IF EXISTS btree_gin;

-- Restore original function if it was modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Re-enable original triggers
DROP TRIGGER IF EXISTS update_pyjama_parties_updated_at ON pyjama_parties;
CREATE TRIGGER update_pyjama_parties_updated_at BEFORE UPDATE ON pyjama_parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dreams_updated_at ON dreams;
CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stations_updated_at ON stations;
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Re-enable original RLS policies
CREATE POLICY "Allow public insert access on pyjama_parties" ON pyjama_parties
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert access on dreams" ON dreams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on pyjama_parties" ON pyjama_parties
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on dreams" ON dreams
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access on stations" ON stations
  FOR SELECT USING (true);

-- Add comment for rollback completion
COMMENT ON SCHEMA public IS 'Schema rolled back to original state before enhanced multilingual migration';

-- Final validation query to check rollback success
-- You can run this after the rollback to verify the original state is restored:
/*
SELECT 
  'stations' as table_name, 
  count(*) as record_count,
  array_agg(column_name ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'stations' AND table_schema = 'public'
GROUP BY table_name

UNION ALL

SELECT 
  'dreams' as table_name, 
  count(*) as record_count,
  array_agg(column_name ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'dreams' AND table_schema = 'public'
GROUP BY table_name

UNION ALL

SELECT 
  'pyjama_parties' as table_name, 
  count(*) as record_count,
  array_agg(column_name ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'pyjama_parties' AND table_schema = 'public'
GROUP BY table_name;
*/