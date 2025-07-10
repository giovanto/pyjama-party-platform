# 🚨 URGENT: Fix Database Schema Errors

## Current Error
```
ERROR: 42703: column "from_station" does not exist
```

This means the database tables either don't exist or have wrong column names.

## ⚡ IMMEDIATE FIX

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `pajama-party-v3`
3. Click **SQL Editor** in left sidebar

### Step 2: Run This SQL (Copy Everything Below)

```sql
-- URGENT: Run this SQL in Supabase SQL Editor to fix all database errors

-- First, drop any existing tables that might have wrong schema
DROP TABLE IF EXISTS dreams CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS pajama_parties CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stations table with correct schema
CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, city, country)
);

-- Create dreams table with correct schema
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_station VARCHAR(255) NOT NULL,
  to_station VARCHAR(255) NOT NULL,
  dreamer_name VARCHAR(100) NOT NULL,
  dreamer_email VARCHAR(255) NOT NULL,
  why_important TEXT NOT NULL,
  from_latitude DECIMAL(10, 8),
  from_longitude DECIMAL(11, 8),
  to_latitude DECIMAL(10, 8),
  to_longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pajama_parties table
CREATE TABLE pajama_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  station_name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  party_date TIMESTAMP WITH TIME ZONE NOT NULL,
  organizer_name VARCHAR(100) NOT NULL,
  organizer_email VARCHAR(255) NOT NULL,
  description TEXT,
  attendees_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample stations (CRITICAL FOR AUTOCOMPLETE)
INSERT INTO stations (name, city, country, latitude, longitude) VALUES
  ('Berlin Hauptbahnhof', 'Berlin', 'Germany', 52.5251, 13.3690),
  ('Vienna Central Station', 'Vienna', 'Austria', 48.1851, 16.3792),
  ('Gare de Lyon', 'Paris', 'France', 48.8447, 2.3732),
  ('Madrid Puerta de Atocha', 'Madrid', 'Spain', 40.4063, -3.6906),
  ('Roma Termini', 'Rome', 'Italy', 41.9009, 12.5010),
  ('Amsterdam Centraal', 'Amsterdam', 'Netherlands', 52.3789, 4.9000),
  ('Zürich Hauptbahnhof', 'Zurich', 'Switzerland', 47.3784, 8.5402),
  ('Copenhagen Central Station', 'Copenhagen', 'Denmark', 55.6730, 12.5655),
  ('Stockholm Central Station', 'Stockholm', 'Sweden', 59.3301, 18.0590),
  ('Oslo Central Station', 'Oslo', 'Norway', 59.9116, 10.7528),
  ('Brussels Central Station', 'Brussels', 'Belgium', 50.8453, 4.3571),
  ('Praha hlavní nádraží', 'Prague', 'Czech Republic', 50.0839, 14.4356),
  ('Budapest Keleti', 'Budapest', 'Hungary', 47.5000, 19.0815),
  ('Warszawa Centralna', 'Warsaw', 'Poland', 52.2286, 21.0030),
  ('Lisboa Oriente', 'Lisbon', 'Portugal', 38.7681, -9.0983),
  ('Barcelona Sants', 'Barcelona', 'Spain', 41.3792, 2.1404),
  ('München Hauptbahnhof', 'Munich', 'Germany', 48.1405, 11.5608),
  ('Frankfurt (Main) Hauptbahnhof', 'Frankfurt', 'Germany', 50.1073, 8.6625),
  ('Köln Hauptbahnhof', 'Cologne', 'Germany', 50.9430, 6.9589),
  ('Hamburg Hauptbahnhof', 'Hamburg', 'Germany', 53.5527, 10.0063);

-- Enable Row Level Security
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pajama_parties ENABLE ROW LEVEL SECURITY;

-- Create public access policies
CREATE POLICY "Allow public read access on stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on dreams" ON dreams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pajama_parties" ON pajama_parties FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on dreams" ON dreams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on pajama_parties" ON pajama_parties FOR INSERT WITH CHECK (true);

-- Verify tables were created
SELECT 'stations' as table_name, count(*) as row_count FROM stations
UNION ALL
SELECT 'dreams' as table_name, count(*) as row_count FROM dreams
UNION ALL  
SELECT 'pajama_parties' as table_name, count(*) as row_count FROM pajama_parties;
```

### Step 3: Click "RUN" Button

You should see output like:
```
table_name | row_count
-----------|----------
stations   | 20
dreams     | 0
pajama_parties | 0
```

### Step 4: Test the Fix

```bash
# Test station search (should work now)
curl "http://localhost:3000/api/stations/search?q=berlin"

# Test dream submission (should work now)
curl -X POST http://localhost:3000/api/dreams \
  -H "Content-Type: application/json" \
  -d '{"from":"Berlin Hauptbahnhof","to":"Vienna Central Station","name":"Test","email":"test@example.com","why":"Testing"}'
```

## ✅ After Running SQL

The platform will be fully functional:
- ✅ Station autocomplete will work
- ✅ Dream submissions will persist to database
- ✅ Map will show real route data
- ✅ Stats will display actual metrics
- ✅ Ready for Vercel deployment

## 🚀 Next Steps After Database Fixed

1. **Test Everything:** `npm run test:supabase`
2. **Commit Changes:** Git commit the working version
3. **Deploy to Vercel:** Push to GitHub and deploy
4. **Add environment variables** to Vercel project