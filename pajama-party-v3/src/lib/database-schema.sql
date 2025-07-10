-- Pajama Party Platform V3 Database Schema
-- This file contains the SQL schema for setting up the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  coordinates POINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for station search
CREATE INDEX IF NOT EXISTS idx_stations_search ON stations USING GIN (
  to_tsvector('english', name || ' ' || city || ' ' || country)
);

-- Dreams table
CREATE TABLE IF NOT EXISTS dreams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_station VARCHAR(255) NOT NULL,
  to_station VARCHAR(255) NOT NULL,
  dreamer_name VARCHAR(100) NOT NULL,
  dreamer_email VARCHAR(255) NOT NULL,
  why_important TEXT NOT NULL,
  from_coordinates POINT,
  to_coordinates POINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for dreams
CREATE INDEX IF NOT EXISTS idx_dreams_created_at ON dreams (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dreams_route ON dreams (from_station, to_station);
CREATE INDEX IF NOT EXISTS idx_dreams_email ON dreams (dreamer_email);

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

-- Create index for pajama parties
CREATE INDEX IF NOT EXISTS idx_pajama_parties_date ON pajama_parties (party_date);
CREATE INDEX IF NOT EXISTS idx_pajama_parties_location ON pajama_parties (city, country);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stations_updated_at BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dreams_updated_at BEFORE UPDATE ON dreams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pajama_parties_updated_at BEFORE UPDATE ON pajama_parties
  FOR EACH ROW EXECUTE FUNCTION update_pajama_parties_updated_at_column();

-- Insert sample European train stations
INSERT INTO stations (name, city, country, coordinates) VALUES
  ('Berlin Hauptbahnhof', 'Berlin', 'Germany', POINT(13.3690, 52.5251)),
  ('Vienna Central Station', 'Vienna', 'Austria', POINT(16.3792, 48.1851)),
  ('Gare de Lyon', 'Paris', 'France', POINT(2.3732, 48.8447)),
  ('Madrid Puerta de Atocha', 'Madrid', 'Spain', POINT(-3.6906, 40.4063)),
  ('Roma Termini', 'Rome', 'Italy', POINT(12.5010, 41.9009)),
  ('Amsterdam Centraal', 'Amsterdam', 'Netherlands', POINT(4.9000, 52.3789)),
  ('Zürich Hauptbahnhof', 'Zurich', 'Switzerland', POINT(8.5402, 47.3784)),
  ('Copenhagen Central Station', 'Copenhagen', 'Denmark', POINT(12.5655, 55.6730)),
  ('Stockholm Central Station', 'Stockholm', 'Sweden', POINT(18.0590, 59.3301)),
  ('Oslo Central Station', 'Oslo', 'Norway', POINT(10.7528, 59.9116)),
  ('Brussels Central Station', 'Brussels', 'Belgium', POINT(4.3571, 50.8453)),
  ('Praha hlavní nádraží', 'Prague', 'Czech Republic', POINT(14.4356, 50.0839)),
  ('Budapest Keleti', 'Budapest', 'Hungary', POINT(19.0815, 47.5000)),
  ('Warszawa Centralna', 'Warsaw', 'Poland', POINT(21.0030, 52.2286)),
  ('Lisboa Oriente', 'Lisbon', 'Portugal', POINT(-9.0983, 38.7681)),
  ('Barcelona Sants', 'Barcelona', 'Spain', POINT(2.1404, 41.3792)),
  ('München Hauptbahnhof', 'Munich', 'Germany', POINT(11.5608, 48.1405)),
  ('Frankfurt (Main) Hauptbahnhof', 'Frankfurt', 'Germany', POINT(8.6625, 50.1073)),
  ('Köln Hauptbahnhof', 'Cologne', 'Germany', POINT(6.9589, 50.9430)),
  ('Hamburg Hauptbahnhof', 'Hamburg', 'Germany', POINT(10.0063, 53.5527))
ON CONFLICT (name, city, country) DO NOTHING;