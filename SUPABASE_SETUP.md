# Supabase Database Setup Instructions

## 🚨 URGENT: Apply Database Schema

The current API errors are because the database schema hasn't been applied yet.

### Step 1: Access Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `pajama-party-v3`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Apply Schema

Copy and paste the entire contents of `setup-database.sql` into the SQL Editor and execute it.

**Key SQL to run:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
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

-- Dreams table  
CREATE TABLE IF NOT EXISTS dreams (
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

-- Pajama parties table
CREATE TABLE IF NOT EXISTS pajama_parties (
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

-- Insert sample stations
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
  ('Hamburg Hauptbahnhof', 'Hamburg', 'Germany', 53.5527, 10.0063)
ON CONFLICT (name, city, country) DO NOTHING;

-- Enable RLS
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pajama_parties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access on stations" ON stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access on dreams" ON dreams FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pajama_parties" ON pajama_parties FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on dreams" ON dreams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on pajama_parties" ON pajama_parties FOR INSERT WITH CHECK (true);
```

### Step 3: Verify Schema

After running the SQL, verify the tables exist:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check stations table structure
\d stations;

-- Check sample data
SELECT COUNT(*) FROM stations;
SELECT * FROM stations LIMIT 5;
```

### Step 4: Test API Endpoints

Once the schema is applied, test the endpoints:

```bash
# Station search should now work
curl "http://localhost:3000/api/stations/search?q=berlin"

# Dream submission should work  
curl -X POST http://localhost:3000/api/dreams \
  -H "Content-Type: application/json" \
  -d '{"from":"Berlin Hauptbahnhof","to":"Vienna Central Station","name":"Test","email":"test@example.com","why":"Testing"}'

# Stats should show real data
curl http://localhost:3000/api/stats
```

## Environment Variables Configured ✅

```
NEXT_PUBLIC_SUPABASE_URL=https://ouzeawngrhmbyrhkypfu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps After Schema Applied

1. ✅ Test all API endpoints
2. ✅ Verify form submissions persist to database  
3. ✅ Check map displays real route data
4. ✅ Commit changes and deploy to Vercel